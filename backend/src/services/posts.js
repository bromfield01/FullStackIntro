// backend/src/services/posts.js
import mongoose from 'mongoose';
import { Post } from '../db/models/post.js';

export async function createPost(userId, { title, contents, tags }) {
  const post = new Post({ title, author: userId, contents, tags });
  return await post.save();
}

function buildSort({ sortBy = 'createdAt', sortOrder = 'desc' } = {}) {
  const dir =
    sortOrder === 'desc' || sortOrder === 'descending' || sortOrder === -1
      ? -1
      : 1;
  const field = sortBy || 'createdAt';
  return { [field]: dir };
}

async function listPosts(userId /* optional */, query = {}, options = {}) {
  const filter = { ...query };
  if (userId) filter.author = userId; // only add when provided
  return await Post.find(filter).sort(buildSort(options));
}

// PUBLIC reads (no userId passed) will work fine now:
export async function listAllPosts(options) {
  return await listPosts(undefined, {}, options);
}

export async function listPostsByAuthor(authorId, options) {
  // Require a valid ObjectId if “author” is provided as a query parameter
  if (!mongoose.isValidObjectId(authorId)) {
    // Return empty list rather than throwing, or you can return 400 in the route
    return [];
  }
  return await listPosts(authorId, {}, options);
}

export const listPostByAuthor = listPostsByAuthor;

export async function listPostsByTag(tags, options) {
  const values = Array.isArray(tags) ? tags : [tags];
  return await listPosts(undefined, { tags: { $in: values } }, options);
}

export async function getPostById(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  return await Post.findById(id);
}

// Auth-required mutations (keep user scoping)
export async function updatePostById(userId, id, updates = {}) {
  if (!mongoose.isValidObjectId(id)) return null;
  const ALLOWED = new Set(['title', 'contents', 'tags']); // no author changes
  const toSet = {};
  for (const [k, v] of Object.entries(updates)) {
    if (!ALLOWED.has(k) || v === undefined) continue;
    toSet[k] = k === 'tags' && !Array.isArray(v) ? [v] : v;
  }
  if (Object.keys(toSet).length === 0) {
    return await Post.findOne({ _id: id, author: userId });
  }
  return await Post.findOneAndUpdate(
    { _id: id, author: userId },
    { $set: toSet },
    { new: true, runValidators: true },
  );
}

export async function updatePost(userId, postId, payload) {
  return updatePostById(userId, postId, payload);
}

export async function deletePostById(userId, id) {
  if (!mongoose.isValidObjectId(id)) return null;
  return await Post.findOneAndDelete({ _id: id, author: userId });
}

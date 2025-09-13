// backend/src/services/posts.js
import mongoose from 'mongoose';
import { Post } from '../db/models/post.js';

/** Create */
export async function createPost({ title, author, contents, tags }) {
  const post = new Post({ title, author, contents, tags });
  return await post.save();
}

/** Internal list helper with safe sorting */
async function listPosts(
  query = {},
  { sortBy = 'createdAt', sortOrder = 'desc' } = {},
) {
  const dir =
    sortOrder === 'desc' || sortOrder === 'descending' || sortOrder === -1
      ? -1
      : 1;
  const field = sortBy || 'createdAt';
  return await Post.find(query).sort({ [field]: dir });
}

/** List all */
export async function listAllPosts(options) {
  return await listPosts({}, options);
}

/** List by author (correct plural name) */
export async function listPostsByAuthor(author, options) {
  return await listPosts({ author }, options);
}
/** Back-compat alias for older imports */
export const listPostByAuthor = listPostsByAuthor;

/** List by tag(s) */
export async function listPostsByTag(tags, options) {
  const values = Array.isArray(tags) ? tags : [tags];
  // $in handles single or multiple tags
  return await listPosts({ tags: { $in: values } }, options);
}

/** Get by id (safe) */
export async function getPostById(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  return await Post.findById(id);
}

/** Update by id (PATCH-style, whitelist fields) */
export async function updatePostById(id, updates = {}) {
  if (!mongoose.isValidObjectId(id)) return null;
  const ALLOWED = new Set(['title', 'author', 'contents', 'tags']);
  const toSet = {};
  for (const [k, v] of Object.entries(updates)) {
    if (!ALLOWED.has(k) || v === undefined) continue;
    toSet[k] = k === 'tags' && !Array.isArray(v) ? [v] : v;
  }
  if (Object.keys(toSet).length === 0) return await Post.findById(id);
  return await Post.findByIdAndUpdate(
    id,
    { $set: toSet },
    { new: true, runValidators: true },
  );
}

/** Alias for compatibility */
export async function updatePost(postId, payload) {
  return updatePostById(postId, payload);
}

/** Delete by id (safe) */
export async function deletePostById(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  return await Post.findByIdAndDelete(id);
}

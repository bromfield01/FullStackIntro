import { Post } from '../db/models/post.js';
import mongoose from 'mongoose';
export async function createPost({ title, author, contents, tags }) {
  const post = new Post({ title, author, contents, tags });

  return await post.save();
}

async function listPosts(
  query = {},
  { sortBy = 'createdAt', sortOrder = 'descending' } = {},
) {
  return await Post.find(query).sort({ [sortBy]: sortOrder });
}

export async function listAllPosts(options) {
  return await listPosts({}, options);
}

export async function listPostByAuthor(author, options) {
  return await listPosts({ author }, options);
}
export async function listPostsByTag(tags, options) {
  return await listPosts({ tags }, options);
}

export async function getPostById(postId) {
  if (!mongoose.isValidObjectId(postId)) return null;
  return await Post.findById(postId);
}

export async function updatePostById(id, data) {
  if (!mongoose.isValidObjectId(id)) return null;
  return await Post.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
}
export async function updatePost(postId, { title, author, contents, tags }) {
  if (!mongoose.isValidObjectId(postId)) return null;
  return await Post.findOneAndUpdate(
    { _id: postId },
    { $set: { title, author, contents, tags } },
    { new: true },
  );
}
export async function deletePostById(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  return await Post.findByIdAndDelete(id);
}

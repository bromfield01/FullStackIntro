// backend/src/__tests__/posts.test.js
import mongoose from 'mongoose';
import { describe, expect, test, afterAll } from '@jest/globals';
import { createPost } from '../service/posts.js'; // <-- keep ONE import, include .js
import { Post } from '../db/models/post.js'; // <-- include .js

describe('creating posts', () => {
  test('with all parameters should succeed', async () => {
    const post = {
      title: 'Hello Mongoose !!!',
      author: 'T. Blackwood',
      contents: 'This is a test, this is only a test',
      tags: ['mongoose', 'mongodb'], // <-- fix typo
    };

    const createdPost = await createPost(post);
    expect(createdPost._id).toBeInstanceOf(mongoose.Types.ObjectId);

    const foundPost = await Post.findById(createdPost._id);
    expect(foundPost).toEqual(expect.objectContaining(post));
    expect(foundPost.createdAt).toBeInstanceOf(Date);
    expect(foundPost.updatedAt).toBeInstanceOf(Date);
  });
  test('without title should fail', async () => {
    const post = {
      author: 'John Brown',
      contents: 'Post with no title',
      tags: ['empty'],
    };
    try {
      await createPost(post);
    } catch (err) {
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.message).toContain('`title` is required');
    }
  });
  test('with minimal parameters should succeed', async () => {
    const post = {
      title: 'Only a title',
    };
    const createdPost = await createPost(post);
    expect(createdPost._id).toBeInstanceOf(mongoose.Types.ObjectId);
  });
});

afterAll(async () => {
  // close DB connection so Jest can exit cleanly
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

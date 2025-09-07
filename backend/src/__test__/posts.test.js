// backend/src/__tests__/posts.test.js
import mongoose from 'mongoose';
import { describe, expect, test, afterAll, beforeEach } from '@jest/globals';
import {
  createPost,
  listAllPosts,
  listPostsByTag,
  listPostByAuthor,
  getPostById,
  updatePost,
  deletePostById,
} from '../service/posts.js'; // <-- keep ONE import, include .js
import { Post } from '../db/models/post.js'; // <-- include .js

// Seed data
const samplePosts = [
  {
    title: 'Learning Redux',
    author: 'Daniel Bugl',
    contents: 'Redux content',
    tags: ['redux'],
  },
  {
    title: 'Learn React Hooks',
    author: 'Daniel Bugl',
    contents: 'Hooks content',
    tags: ['react'],
  },
  {
    title: 'Full-Stack React Projects',
    author: 'Daniel Bugl',
    contents: 'FS content',
    tags: ['react', 'nodejs'],
  },
  {
    title: 'Guid  e to TypeScript',
    author: 'Jane Smith',
    contents: 'TS content',
    tags: ['typescript'],
  },
];

let createdSamplesPosts = [];
beforeEach(async () => {
  // Start from a clean collection so the counts are deterministic
  await Post.deleteMany({});
  createdSamplesPosts = [];
  for (const post of samplePosts) {
    const createdPost = new Post(post);
    createdSamplesPosts.push(await createdPost.save());
  }
});

describe('deleting post', () => {
  test('should remove the post form the database', async () => {
    const result = await deletePostById(createdSamplesPosts[0]._id);
    expect(result).not.toBeNull();
    const deletedPost = await Post.findById(createdSamplesPosts[0]._id);
    expect(deletedPost).toBeNull();
  });
  test('should fail if the id does not exist', async () => {
    const result = await deletePostById('33333');
    expect(result).toBeNull();
  });
});

describe('updating post', () => {
  test('shold update the spcified proerty', async () => {
    await updatePost(createdSamplesPosts[0]._id, {
      author: 'Test Author',
    });
    const updatedPost = await Post.findById(createdSamplesPosts[0]._id);
    expect(updatedPost.author).toEqual('Test Author');
  });
  test('should not update other properties', async () => {
    await updatePost(createdSamplesPosts[0]._id, {
      author: 'Test Author',
    });
    const updatedPost = await Post.findById(createdSamplesPosts[0]._id);
    expect(updatedPost.title).toEqual('Learning Redux');
  });
  test('should update the update timestamp', async () => {
    await updatePost(createdSamplesPosts[0]._id, {
      author: 'Test Author',
    });
    const updatedPost = await Post.findById(createdSamplesPosts[0]._id);
    expect(updatedPost.updatedAt.getTime()).toBeGreaterThan(
      createdSamplesPosts[0].updatedAt.getTime(),
    );
  });
});

describe('getting a post', () => {
  test('should return a full post', async () => {
    const post = await getPostById(createdSamplesPosts[0]._id);
    expect(post.toObject()).toEqual(createdSamplesPosts[0].toObject());
  });
  test('should fail if the id does not exist', async () => {
    const postId = '3433234343';
    const post = await getPostById(postId);
    expect(post).toEqual(null);
  });
});

describe('listing posts', () => {
  test('listAllPosts returns all posts newest first', async () => {
    const posts = await listAllPosts();
    expect(posts.length).toEqual(createdSamplesPosts.length);
  });

  test('listPostsByTag finds posts with a single tag', async () => {
    const posts = await listPostsByTag('nodejs');
    expect(posts.length).toBe(1);
  });

  test('listPostsByAuthor returns only posts by that author', async () => {
    const posts = await listPostByAuthor('Daniel Bugl');
    expect(posts.length).toBe(3);
    expect(posts.every((p) => p.author === 'Daniel Bugl')).toBe(true);
  });

  test('listPostsByTag finds posts with a single tag', async () => {
    const posts = await listPostsByTag('react');
    expect(posts.length).toBe(2);
    expect(posts.every((p) => p.tags.includes('react'))).toBe(true);
  });

  test('listPostsByTag supports multiple tags via $in', async () => {
    const posts = await listPostsByTag(['react', 'nodejs']);
    expect(posts.length).toBeGreaterThanOrEqual(1);
    expect(posts.some((p) => p.tags.includes('nodejs'))).toBe(true);
  });
});

describe('creating posts', () => {
  test('with all parameters should succeed', async () => {
    const post = {
      title: 'Hello Mongoose !!!',
      author: 'T. Blackwood',
      contents: 'This is a test, this is only a test',
      tags: ['mongoose', 'mongodb'], //
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

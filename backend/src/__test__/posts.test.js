// backend/src/__tests__/posts.test.js
import mongoose from 'mongoose';
import {
  describe,
  expect,
  test,
  afterAll,
  beforeEach,
  beforeAll,
} from '@jest/globals';
import {
  createPost,
  listAllPosts,
  listPostsByTag,
  listPostByAuthor, // keep the service name you have
  getPostById,
  updatePost,
  deletePostById,
} from '../services/posts.js'; // keep ONE import, include .js
import { Post } from '../db/models/post.js'; // include .js
import { createUser } from '../services/users.js';

let testUser = null;
let samplePosts = [];

beforeAll(async () => {
  testUser = await createUser({ username: 'sample', password: 'user' });

  samplePosts = [
    {
      title: 'Learning Redux',
      author: testUser._id,
      contents: 'Redux content',
      tags: ['redux'],
    },
    {
      title: 'Learn React Hooks',
      author: testUser._id,
      contents: 'Hooks content',
      tags: ['react'],
    },
    {
      title: 'Full-Stack React Projects',
      author: testUser._id,
      contents: 'FS content',
      tags: ['react', 'nodejs'],
    },
    {
      title: 'Guide to TypeScript',
      author: testUser._id,
      contents: 'TS content',
      tags: ['typescript'],
    },
  ];
});

let createdSamplesPosts = [];

// IMPORTANT: reset the array each time so we don't keep stale IDs
beforeEach(async () => {
  await Post.deleteMany({});
  createdSamplesPosts = [];
  for (const post of samplePosts) {
    const createdPost = new Post(post);
    createdSamplesPosts.push(await createdPost.save());
  }
});

describe('deleting post', () => {
  test('should remove the post from the database', async () => {
    const result = await deletePostById(
      testUser._id,
      createdSamplesPosts[0]._id,
    );
    expect(result).not.toBeNull();

    const deletedPost = await Post.findById(createdSamplesPosts[0]._id);
    expect(deletedPost).toBeNull();
  });

  test('should fail if the id does not exist', async () => {
    // service expects (userId, postId)
    const result = await deletePostById(testUser._id, '33333');
    expect(result).toBeNull();
  });
});

describe('updating post', () => {
  test('should update the specified property', async () => {
    await updatePost(testUser._id, createdSamplesPosts[0]._id, {
      contents: 'some content  changed',
    });

    const updatedPost = await Post.findById(createdSamplesPosts[0]._id);
    expect(updatedPost).not.toBeNull();
    expect(updatedPost.contents).toEqual('some content  changed');
  });

  test('should not update other properties', async () => {
    await updatePost(testUser._id, createdSamplesPosts[0]._id, {
      contents: 'some content  changed',
    });

    const updatedPost = await Post.findById(createdSamplesPosts[0]._id);
    expect(updatedPost).not.toBeNull();
    expect(updatedPost.title).toEqual('Learning Redux');
  });

  test('should update the update timestamp', async () => {
    const beforeUpdate = createdSamplesPosts[0].updatedAt.getTime();

    await updatePost(testUser._id, createdSamplesPosts[0]._id, {
      contents: 'some content  changed',
    });

    const updatedPost = await Post.findById(createdSamplesPosts[0]._id);
    expect(updatedPost).not.toBeNull();
    expect(updatedPost.updatedAt.getTime()).toBeGreaterThan(beforeUpdate);
  });
});

describe('getting a post', () => {
  test('should return a full post', async () => {
    const post = await getPostById(createdSamplesPosts[0]._id);
    // compare on object contents — _id and dates match by value
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
    // Your seed created 4 posts by the same author (testUser)
    const posts = await listPostByAuthor(testUser._id); // pass _id to match your schema
    expect(posts.length).toBe(4);
  });

  test('listPostsByTag finds posts with a single tag (react)', async () => {
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
      contents: 'This is a test, this is only a test',
      tags: ['mongoose', 'mongodb'],
    };

    const createdPost = await createPost(testUser._id, post);
    expect(createdPost._id).toBeInstanceOf(mongoose.Types.ObjectId);

    const foundPost = await Post.findById(createdPost._id);
    expect(foundPost).toEqual(expect.objectContaining(post));
    expect(foundPost.createdAt).toBeInstanceOf(Date);
    expect(foundPost.updatedAt).toBeInstanceOf(Date);
  });

  test('without title should fail', async () => {
    const post = {
      contents: 'Post with no title',
      tags: ['empty'],
    };
    try {
      await createPost(testUser._id, post);
      // if no error thrown, explicitly fail
      expect(false).toBe(true);
    } catch (err) {
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.message).toContain('`title` is required');
    }
  });

  test('with minimal parameters should succeed', async () => {
    const post = { title: 'Only a title' };
    const createdPost = await createPost(testUser._id, post);
    expect(createdPost._id).toBeInstanceOf(mongoose.Types.ObjectId);
  });
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

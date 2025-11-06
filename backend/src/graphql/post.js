// backend/src/graphql/post.js
// Post type + field-level resolver for nested author

import { getUserInfoById } from '../services/users.js';

export const postSchema = /* GraphQL */ `
  type Post {
    id: ID!
    title: String!
    author: User
    contents: String
    tags: [String!]
    createdAt: Float
    updatedAt: Float
  }
`;

export const postResolver = {
  Post: {
    // Resolve the nested author for a post
    author: async (post) => {
      // post.author is assumed to be a user id
      if (!post?.author) return null;
      return await getUserInfoById(post.author);
    },
  },
};

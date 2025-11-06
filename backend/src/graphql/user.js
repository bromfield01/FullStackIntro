// backend/src/graphql/user.js
// User type + nested posts(user) -> [Post]

import { listPostsByAuthor } from '../services/posts.js';

export const userSchema = /* GraphQL */ `
  type User {
    username: String!
    posts: [Post!]!
  }
`;

export const userResolver = {
  User: {
    posts: async (user) => {
      // allow nested: { user { username, posts { id title } } }
      return await listPostsByAuthor(user.username, {});
    },
  },
};

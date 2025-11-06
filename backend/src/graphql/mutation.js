// backend/src/graphql/mutation.js
import { createUser, loginUser } from '../services/users.js';
import { createPost } from '../services/posts.js';

export const mutationSchema = /* GraphQL */ `
  input CreatePostInput {
    title: String!
    contents: String
    tags: [String!]
  }

  input SignupInput {
    username: String!
    password: String!
  }

  input LoginInput {
    username: String!
    password: String!
  }

  type Mutation {
    signupUser(input: SignupInput!): User
    loginUser(input: LoginInput!): String
    createPost(input: CreatePostInput!): Post
  }
`;

export const mutationResolver = {
  Mutation: {
    // --- Create a new user ---
    signupUser: async (_parent, { input }) => {
      const { username, password } = input;
      return await createUser(username, password);
    },

    // --- Login user and return JWT token ---
    loginUser: async (_parent, { input }) => {
      const { username, password } = input;
      return await loginUser(username, password);
    },

    // --- Create post (requires JWT token in context) ---
    createPost: async (_parent, { input }, context) => {
      const { title, contents, tags } = input;
      const { authHeader } = context;

      if (!authHeader) {
        throw new Error('Unauthorized: Missing Authorization header');
      }

      const token = authHeader.split(' ')[1];
      if (!token) throw new Error('Unauthorized: Invalid token format');

      // The createPost service should validate and decode the token internally
      return await createPost(title, contents, tags, token);
    },
  },
};

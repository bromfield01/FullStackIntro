// backend/src/graphql/query.js
// Query root + input/enums for filtering/sorting/pagination

import {
  listAllPosts,
  listPostsByAuthor,
  listPostsByTag,
  getPostById,
} from '../services/posts.js';

export const querySchema = /* GraphQL */ `
  enum SortOrder {
    asc
    desc
  }

  enum PostSortBy {
    createdAt
    updatedAt
    title
  }

  input PostOptions {
    # text match in title or contents (service should interpret)
    filter: String
    # optional sort field and order
    sortBy: PostSortBy
    sortOrder: SortOrder
    # pagination (0-based offset)
    offset: Int
    limit: Int
  }

  type Query {
    test: String
    posts(options: PostOptions): [Post!]!
    postsByAuthor(username: String!, options: PostOptions): [Post!]!
    postsByTag(tag: String!, options: PostOptions): [Post!]!
    postById(id: ID!): Post
  }
`;

function normalizeOptions(options) {
  if (!options) return {};
  const o = { ...options };

  // Map enum names to what the service expects
  if (o.sortBy) o.sortBy = String(o.sortBy);
  if (o.sortOrder) o.sortOrder = String(o.sortOrder);

  // Guardrails
  if (typeof o.limit === 'number') {
    o.limit = Math.min(Math.max(o.limit, 1), 100);
  }
  if (typeof o.offset !== 'number') o.offset = 0;

  return o;
}

export const queryResolver = {
  Query: {
    test: () => 'ok',
    posts: async (_parent, { options }) => {
      return await listAllPosts(normalizeOptions(options));
    },
    postsByAuthor: async (_parent, { username, options }) => {
      return await listPostsByAuthor(username, normalizeOptions(options));
    },
    postsByTag: async (_parent, { tag, options }) => {
      return await listPostsByTag(tag, normalizeOptions(options));
    },
    postById: async (_parent, { id }) => {
      return await getPostById(id);
    },
  },
};

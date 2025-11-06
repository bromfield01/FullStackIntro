// src/api/graphql/posts.js
import * as Apollo from '@apollo/client';

/**
 * getPosts supports server-side filtering/sorting/pagination via PostOptions.
 * It also returns nested author { username }.
 */
export const GET_POSTS = Apollo.gql`
  query getPosts($options: PostOptions) {
    posts(options: $options) {
      id
      title
      contents
      tags
      updatedAt
      createdAt
      author { username }
    }
  }
`;

export const GET_POST_BY_ID = Apollo.gql`
  query getPostById($id: ID!) {
    postById(id: $id) {
      id
      title
      contents
      tags
      updatedAt
      createdAt
      author { username }
    }
  }
`;

export const CREATE_POST = Apollo.gql`
  mutation createPost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      contents
      tags
      createdAt
      author { username }
    }
  }
`;

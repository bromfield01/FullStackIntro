// src/hooks/usePosts.js
import * as Apollo from '@apollo/client';
import { GET_POSTS, CREATE_POST } from '../api/graphql/posts.js';

export function usePosts(options) {
  return Apollo.useQuery(GET_POSTS, {
    variables: { options },
    fetchPolicy: 'cache-and-network',
  });
}

export function useCreatePost() {
  const [mutate, state] = Apollo.useMutation(CREATE_POST, {
    // keep the list fresh
    refetchQueries: ['getPosts'],
    awaitRefetchQueries: true,
  });

  return {
    ...state,
    createPost: (input) => mutate({ variables: { input } }),
  };
}

// src/hooks/useAuthMutations.js
import * as Apollo from '@apollo/client';
import { SIGNUP_USER, LOGIN_USER } from '../api/graphql/users.js';

export function useSignupUser() {
  const [mutate, state] = Apollo.useMutation(SIGNUP_USER);
  return { ...state, signup: (input) => mutate({ variables: { input } }) };
}

export function useLoginUser() {
  const [mutate, state] = Apollo.useMutation(LOGIN_USER);
  return {
    ...state,
    login: async (input) => {
      const { data } = await mutate({ variables: { input } });
      const token = data?.loginUser;
      if (token) localStorage.setItem('token', token);
      return token;
    },
  };
}

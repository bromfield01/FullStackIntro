// src/api/graphql/users.js
import * as Apollo from '@apollo/client';

export const SIGNUP_USER = Apollo.gql`
  mutation signupUser($input: SignupInput!) {
    signupUser(input: $input) {
      username
    }
  }
`;

export const LOGIN_USER = Apollo.gql`
  mutation loginUser($input: LoginInput!) {
    loginUser(input: $input)  # returns a JWT string
  }
`;

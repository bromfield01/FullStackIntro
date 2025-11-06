// src/App.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from './contexts/AuthContext.jsx';
import PropTypes from 'prop-types';
import { HelmetProvider } from 'react-helmet-async';

// ✅ Use a namespace import for the CJS build
import * as Apollo from '@apollo/client';
// ✅ Link utilities come from submodules
import { createHttpLink } from '@apollo/client/link/http';
import { setContext } from '@apollo/client/link/context';

const queryClient = new QueryClient();

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

const apolloClient = new Apollo.ApolloClient({
  link: authLink.concat(httpLink),
  cache: new Apollo.InMemoryCache(),
});

export function App({ children }) {
  return (
    <HelmetProvider>
      <Apollo.ApolloProvider client={apolloClient}>
        <QueryClientProvider client={queryClient}>
          <AuthContextProvider>{children}</AuthContextProvider>
        </QueryClientProvider>
      </Apollo.ApolloProvider>
    </HelmetProvider>
  );
}

App.propTypes = { children: PropTypes.element.isRequired };

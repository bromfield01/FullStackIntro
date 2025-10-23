// src/App.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from './contexts/AuthContext.jsx';
import PropTypes from 'prop-types';

const queryClient = new QueryClient();

import { HelmetProvider } from 'react-helmet-async';

export function App({ children }) {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthContextProvider>{children}</AuthContextProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

App.propTypes = {
  children: PropTypes.element.isRequired,
};

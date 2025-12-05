// src/contexts/AuthContext.jsx
import { createContext, useState, useContext, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

const TOKEN_KEY = 'token';

export const AuthContext = createContext({
  token: null,
  setToken: () => {},
  logout: () => {},
});

export const AuthContextProvider = ({ children }) => {
  // initialize from localStorage when in browser
  const [token, setTokenState] = useState(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(TOKEN_KEY) || null;
  });

  // keep localStorage in sync with state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  const logout = () => {
    setTokenState(null);
  };

  const setToken = (newToken) => {
    setTokenState(newToken || null);
  };

  // ✅ THIS is the "value" we want to pass into Provider
  const value = useMemo(() => ({ token, setToken, logout }), [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  const { token, setToken, logout } = useContext(AuthContext);
  // return a 3-tuple: [token, setToken, logout]
  return [token, setToken, logout];
}

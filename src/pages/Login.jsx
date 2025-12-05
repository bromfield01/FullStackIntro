// src/pages/Login.jsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/users';
import { useAuth } from '../contexts/AuthContext.jsx';

export function Login() {
  const [, setToken] = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: () => login({ username, password }),
    onSuccess: (data) => {
      setToken(data.token);
      navigate('/');
    },
    onError: () => alert('Failed to login!'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Link to='/'>Back to main page</Link>
      <hr />
      <div>
        <label htmlFor='login-username'>Username:</label>
        <input
          type='text'
          name='login-username'
          id='login-username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete='username'
        />
      </div>

      <br />

      <div>
        <label htmlFor='login-password'>Password:</label>
        <input
          type='password'
          name='login-password'
          id='login-password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete='current-password'
        />
      </div>

      <br />

      <input
        type='submit'
        value={loginMutation.isPending ? 'Logging In...' : 'Log In'}
        disabled={!username || !password || loginMutation.isPending}
      />
    </form>
  );
}

export default Login;

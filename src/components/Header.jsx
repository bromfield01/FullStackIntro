import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../contexts/AuthContext.jsx';
import { User } from './User.jsx';

export function Header() {
  const [token, setToken] = useAuth();

  if (token) {
    const { sub } = jwtDecode(token);
    return (
      <div>
        <h1>Welcome To My Blog !</h1>
        <br />
        Logged in as <User id={sub} />
        <br />
        <button onClick={() => setToken(null)}>Logout</button>
      </div>
    );
  }
  return (
    <div>
      <h1>Welcome To My Blog !</h1>
      <br />
      <Link to='/login'>Log In</Link> | <Link to='/Signup'>Sign Up</Link>
    </div>
  );
}

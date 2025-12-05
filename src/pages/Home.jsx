// src/pages/Home.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useSocket } from '../contexts/SocketContext.jsx';
import { ChatPanel } from '../components/ChatPanel.jsx';

export function Home() {
  const [token, , logout] = useAuth();
  const socketCtx = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // clears token + localStorage + disconnects socket
    navigate('/login'); // optional redirect
  };

  const statusLabel = !token ? 'waiting' : socketCtx?.status || 'connecting';

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '1.5rem' }}>
      <h1>Welcome to My Blog!</h1>

      {!token ? (
        <p>
          <Link to='/login'>Log In</Link> | <Link to='/signup'>Sign Up</Link>
        </p>
      ) : (
        <p>
          <button
            onClick={handleLogout}
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </p>
      )}

      <hr />

      <p>
        Socket status: <strong>{statusLabel}</strong>
      </p>

      {/* Show ChatPanel after login */}
      {token && (
        <>
          <hr />
          <ChatPanel />
        </>
      )}
    </main>
  );
}

export default Home;

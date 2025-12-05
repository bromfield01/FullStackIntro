// src/App.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { Home } from './pages/Home.jsx';
import { Signup } from './pages/Signup.jsx';
import { Login } from './pages/Login.jsx';
import { AuthContextProvider } from './contexts/AuthContext.jsx';
import { SocketProvider } from './contexts/SocketContext.jsx';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  { path: '/', element: <Home /> }, // 👈 new landing page
  { path: '/signup', element: <Signup /> },
  { path: '/login', element: <Login /> },
]);

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <SocketProvider>
          <RouterProvider router={router} />
        </SocketProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
}

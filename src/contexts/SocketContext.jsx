// src/contexts/SocketContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const [token] = useAuth(); // [token, setToken, logout]
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('disconnected');
  const [room, setRoom] = useState('public');
  const [username, setUsername] = useState(null);
  const [messages, setMessages] = useState([]);
  const [joinedRooms, setJoinedRooms] = useState([]); // <-- NEW STATE

  // Connect / disconnect when token changes
  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.removeAllListeners();
        socket.close();
        setSocket(null);
      }
      setStatus('disconnected');
      setUsername(null);
      setMessages([]);
      setJoinedRooms([]); // reset joined rooms
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL?.trim();
    if (!socketUrl) {
      console.error('VITE_SOCKET_URL is not defined');
      return;
    }

    const roomFromUrl =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('room')
        : null;

    const initialRoom = roomFromUrl || room || 'public';

    const s = io(socketUrl, {
      path: '/socket.io',
      auth: { token },
      query: { room: initialRoom },
      transports: ['websocket'],
      withCredentials: true,
    });

    setSocket(s);
    setStatus('connecting');
    setRoom(initialRoom);
    setMessages([]);
    setJoinedRooms([initialRoom]); // mark initial room as joined

    s.on('connect', async () => {
      setStatus('connected');
      try {
        const info = await s.emitWithAck('user.info', s.id);
        if (info?.user?.username) {
          setUsername(info.user.username);
        }
      } catch (err) {
        console.error('Error fetching user info:', err);
      }
    });

    s.on('disconnect', (reason) => {
      console.log('[socket] disconnected:', reason);
      setStatus('disconnected');
    });

    s.on('connect_error', (err) => {
      console.error('[socket] connect_error:', err.message);
      setStatus('error');
    });

    s.on('welcome', (text) => {
      setMessages((prev) => [
        ...prev,
        { system: true, room: initialRoom, msg: text },
      ]);
    });

    s.on('user joined', (text) => {
      setMessages((prev) => [
        ...prev,
        { system: true, room: initialRoom, msg: text },
      ]);
    });

    s.on('user left', (text) => {
      setMessages((prev) => [
        ...prev,
        { system: true, room: initialRoom, msg: text },
      ]);
    });

    s.on('chat history', (history) => {
      setMessages((prev) => [
        ...prev,
        ...history.map((m) => ({ ...m, replayed: true })),
      ]);
    });

    s.on('chat message', (payload) => {
      setMessages((prev) => [...prev, payload]);
    });

    return () => {
      s.removeAllListeners();
      s.close();
      setSocket(null);
      setStatus('disconnected');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // re-run when token changes

  // Join a room (used by commands and UI)
  const joinRoom = (newRoom) => {
    if (!socket || !newRoom) return;
    socket.emit('join room', newRoom, (ack) => {
      if (ack?.room) {
        setRoom(ack.room);
        setMessages([]); // clear messages when switching room
        setJoinedRooms((prev) =>
          prev.includes(ack.room) ? prev : [...prev, ack.room],
        );
      }
    });
  };

  // INTERCEPT COMMANDS BEFORE SENDING
  const sendMessage = async (raw) => {
    const msg = raw?.trim();
    if (!socket || !msg) return;

    // Handle commands starting with "/"
    if (msg.startsWith('/')) {
      const [command, ...args] = msg.slice(1).split(/\s+/);
      const lower = command.toLowerCase();

      // /clear -> clear local messages
      if (lower === 'clear') {
        setMessages([]);
        return;
      }

      // /rooms -> ask server which rooms we're in (emitWithAck)
      if (lower === 'rooms') {
        try {
          const info = await socket.emitWithAck('rooms.list');
          if (info?.ok) {
            const list =
              info.rooms && info.rooms.length
                ? info.rooms.join(', ')
                : '(no rooms)';
            setMessages((prev) => [
              ...prev,
              {
                system: true,
                room,
                msg: `You are in rooms: ${list}`,
              },
            ]);
          } else {
            setMessages((prev) => [
              ...prev,
              {
                system: true,
                room,
                msg: `Could not fetch rooms: ${info?.error || 'unknown error'}`,
              },
            ]);
          }
        } catch (err) {
          console.error('Error fetching rooms:', err);
          setMessages((prev) => [
            ...prev,
            {
              system: true,
              room,
              msg: 'Error fetching rooms from server.',
            },
          ]);
        }
        return;
      }

      // /join <room> -> join or create a room (adds to joinedRooms)
      if (lower === 'join') {
        const target = args[0];
        if (!target) {
          setMessages((prev) => [
            ...prev,
            {
              system: true,
              room,
              msg: 'Usage: /join <room>',
            },
          ]);
          return;
        }

        const trimmed = target.trim();
        setMessages((prev) => [
          ...prev,
          {
            system: true,
            room,
            msg: `Joining room "${trimmed}"...`,
          },
        ]);

        joinRoom(trimmed);
        return;
      }

      // /switch <room> -> only allowed if previously joined
      if (lower === 'switch') {
        const target = args[0];
        if (!target) {
          setMessages((prev) => [
            ...prev,
            {
              system: true,
              room,
              msg: 'Usage: /switch <room>',
            },
          ]);
          return;
        }

        const trimmed = target.trim();

        if (!joinedRooms.includes(trimmed)) {
          setMessages((prev) => [
            ...prev,
            {
              system: true,
              room,
              msg: `You haven't joined room "${trimmed}" yet. Use /join ${trimmed} first.`,
            },
          ]);
          return;
        }

        setMessages((prev) => [
          ...prev,
          {
            system: true,
            room,
            msg: `Switching to room "${trimmed}"...`,
          },
        ]);

        joinRoom(trimmed);
        return;
      }

      // Unknown command
      setMessages((prev) => [
        ...prev,
        {
          system: true,
          room,
          msg: `Unknown command: /${command}`,
        },
      ]);
      return;
    }

    // Normal chat message
    socket.emit('chat message', msg);
  };

  // Value passed into context provider
  const value = useMemo(
    () => ({
      socket,
      status,
      room,
      username,
      messages,
      joinRoom,
      sendMessage,
    }),
    [socket, status, room, username, messages],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

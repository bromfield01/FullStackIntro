// backend/src/socket.js
import jwt from 'jsonwebtoken';
import { getUserInfoById } from './services/users.js';
import { saveMessage, getRecentMessagesByRoom } from './services/messages.js';

const { JWT_SECRET } = process.env;

export function handleSocket(io) {
  // AUTH middleware
  io.use(async (socket, next) => {
    try {
      const authToken =
        socket.handshake.auth?.token ||
        (socket.handshake.headers.authorization || '').split(' ')[1];

      if (!authToken) {
        return next(new Error('Unauthorized: missing token'));
      }

      const payload = jwt.verify(authToken, JWT_SECRET);
      if (!payload?.sub) {
        return next(new Error('Unauthorized: invalid payload'));
      }

      const userInfo = await getUserInfoById(payload.sub);

      socket.user = {
        id: payload.sub,
        username: userInfo?.username ?? payload.username ?? 'unknown',
      };

      next();
    } catch (err) {
      console.error('[socket] Auth error:', err.message);
      next(new Error('Unauthorized: invalid or expired token'));
    }
  });

  // CONNECTION handler
  io.on('connection', async (socket) => {
    const rawRoom = socket.handshake?.query?.room;
    let room = (Array.isArray(rawRoom) ? rawRoom[0] : rawRoom) || 'public';

    socket.join(room);

    console.log(
      `[socket] ${socket.user.username} connected to room "${room}" (${socket.id})`,
    );

    // 1️⃣ Replay recent messages for this room (history)
    try {
      const history = await getRecentMessagesByRoom(room, 20);
      if (history.length) {
        socket.emit(
          'chat history',
          history.map((m) => ({
            room: m.room,
            username: m.username,
            userId: m.userId?.toString(),
            msg: m.message,
            sent: m.sent,
            system: !!m.system,
            replayed: true, // mark as history
          })),
        );
      }
    } catch (err) {
      console.error('[socket] error loading history:', err);
    }

    socket.emit(
      'welcome',
      `Welcome ${socket.user.username}! You joined the "${room}" room.`,
    );

    socket
      .to(room)
      .emit('user joined', `${socket.user.username} has joined the room.`);

    // 2️⃣ SWITCH ROOM
    socket.on('join room', async (newRoom, callback) => {
      const targetRoom = (newRoom || 'public').trim() || 'public';

      if (targetRoom === room) {
        callback?.({ room });
        return;
      }

      socket.leave(room);
      socket.join(targetRoom);

      console.log(
        `[socket] ${socket.user.username} moved ${room} -> ${targetRoom}`,
      );

      socket
        .to(room)
        .emit('user left', `${socket.user.username} has left the room.`);
      socket
        .to(targetRoom)
        .emit('user joined', `${socket.user.username} has joined the room.`);

      room = targetRoom;
      callback?.({ room });

      // load history for the new room
      try {
        const history = await getRecentMessagesByRoom(room, 20);
        if (history.length) {
          socket.emit(
            'chat history',
            history.map((m) => ({
              room: m.room,
              username: m.username,
              userId: m.userId?.toString(),
              msg: m.message,
              sent: m.sent,
              system: !!m.system,
              replayed: true,
            })),
          );
        }
      } catch (err) {
        console.error('[socket] error loading history for new room:', err);
      }
    });

    // 3️⃣ LIST ROOMS (for /rooms)
    socket.on('rooms.list', (callback) => {
      try {
        const allRooms = Array.from(socket.rooms || []);
        const visibleRooms = allRooms.filter((r) => r !== socket.id);
        callback({ ok: true, rooms: visibleRooms });
      } catch (err) {
        console.error('[socket] rooms.list error:', err);
        callback({ ok: false, error: 'Internal server error' });
      }
    });

    // 4️⃣ CHAT MESSAGE (store + broadcast)
    socket.on('chat message', async (msg) => {
      console.log(`[chat][${room}] ${socket.user.username}:`, msg);

      const payload = {
        room,
        username: socket.user.username,
        userId: socket.user.id,
        msg,
        sent: new Date(),
        system: false,
        replayed: false, // live message
      };

      io.to(room).emit('chat message', payload);

      try {
        await saveMessage({
          room,
          userId: socket.user.id,
          username: socket.user.username,
          message: msg,
          system: false,
        });
      } catch (err) {
        console.error('[socket] error saving message:', err);
      }
    });

    // 5️⃣ USER INFO (unchanged)
    socket.on('user.info', async (socketId, callback) => {
      try {
        const sockets = await io.in(socketId).fetchSockets();
        if (sockets.length > 0) {
          const target = sockets[0];
          callback({
            id: target.id,
            user: target.user ?? null,
            rooms: Array.from(target.rooms),
          });
        } else {
          callback({ error: 'User not found' });
        }
      } catch (err) {
        console.error('[socket] user.info error:', err);
        callback({ error: 'Internal server error' });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(
        `[socket] ${socket.user.username} disconnected from "${room}" (${reason})`,
      );
      socket
        .to(room)
        .emit('user left', `${socket.user.username} has left the room.`);
    });
  });
}

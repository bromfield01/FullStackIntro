// backend/src/services/messages.js
import { Message } from '../db/models/message.js';

export async function saveMessage({
  room,
  userId,
  username,
  message,
  system = false,
}) {
  const doc = new Message({
    room,
    userId,
    username,
    message,
    system,
  });
  return await doc.save();
}

export async function getRecentMessagesByRoom(room, limit = 20) {
  return await Message.find({ room })
    .sort({ sent: 1 }) // oldest -> newest
    .limit(limit)
    .lean();
}

// backend/src/db/models/message.js
import mongoose, { Schema } from 'mongoose';

const messageSchema = new Schema(
  {
    room: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: false },
    username: { type: String, required: true },
    message: { type: String, required: true },
    system: { type: Boolean, default: false },
    // TTL index: message expires after 5 minutes (adjust as you like)
    sent: {
      type: Date,
      default: Date.now,
      required: true,
      expires: 5 * 60, // seconds
    },
  },
  {
    timestamps: false,
  },
);

export const Message = mongoose.model('message', messageSchema);

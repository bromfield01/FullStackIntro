import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
  },
  { timestamps: true, versionKey: false },
);

export const User = mongoose.model('user', userSchema);

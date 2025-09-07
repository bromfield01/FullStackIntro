// src/db/models/post.js
import mongoose, { Schema } from 'mongoose';

const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, trim: true }, // <-- fixed from "auther"
    contents: { type: String, trim: true },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

// Model name conventionally capitalized; collection will be "posts".
export const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

// backend/simulateEvents.js
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose'; // <-- add this

import { initDatabase } from './src/db/init.js';
import { Post } from './src/db/models/post.js';
import { User } from './src/db/models/user.js';
import { Event } from './src/db/models/event.js';

import { createUser } from './src/services/users.js';
import { createPost } from './src/services/posts.js';
import { trackEvent } from './src/services/events.js';

const simulationStart = Date.now() - 1000 * 60 * 60 * 24 * 30;
const simulationEnd = Date.now();

const simulatedUsers = 5;
const simulatedPosts = 10;
const simulatedViews = 10000;

async function simulateEvents() {
  await initDatabase(); // we don't rely on its return value

  try {
    // ----- Users -----
    await User.deleteMany({});
    const createdUsers = await Promise.all(
      Array(simulatedUsers)
        .fill(null)
        .map((_, u) =>
          createUser({ username: `user-${u}`, password: `password-${u}` }),
        ),
    );
    console.log(`created ${createdUsers.length} users`);

    // ----- Posts -----
    await Post.deleteMany({});
    const createdPosts = await Promise.all(
      Array(simulatedPosts)
        .fill(null)
        .map(async (_, p) => {
          const randomUser =
            createdUsers[Math.floor(Math.random() * simulatedUsers)];
          return createPost(randomUser._id, {
            title: `Test Post ${p}`,
            contents: `This is a test post ${p}`,
          });
        }),
    );
    console.log(`created ${createdPosts.length} posts`);

    // ----- Events -----
    await Event.deleteMany({});
    const createdViews = await Promise.all(
      Array(simulatedViews)
        .fill(null)
        .map(async () => {
          const randomPost =
            createdPosts[Math.floor(Math.random() * simulatedPosts)];

          const sessionStart =
            simulationStart + Math.random() * (simulationEnd - simulationStart);
          const sessionEnd =
            sessionStart + 1000 * Math.floor(Math.random() * 60 * 5);

          const start = await trackEvent({
            postId: randomPost._id,
            action: 'startView',
            date: new Date(sessionStart),
          });

          await trackEvent({
            postId: randomPost._id,
            session: start.session,
            action: 'endView',
            date: new Date(sessionEnd),
          });
        }),
    );

    console.log(`successfully simulated ${createdViews.length} views`);
  } finally {
    // ✅ Correct way to close in Mongoose v6/v7
    await mongoose.disconnect();
  }
}

simulateEvents();

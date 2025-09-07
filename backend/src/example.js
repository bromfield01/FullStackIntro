import { initDatabase } from './db/init.js';

import { Post } from './db/models/post.js';

await initDatabase();

const post = new Post({
  title: 'Hello Mongoose !',
  author: 'Sue Storm',
  contents: 'This is a great way to learn full stack',
  tags: ['mongoose', 'mongoDB'],
});

const createdPost = await post.save();
await Post.findByIdAndUpdate(createdPost._id, {
  $set: { title: 'Hello again Team Mates !!' },
});

const posts = await Post.find();
console.log(posts);

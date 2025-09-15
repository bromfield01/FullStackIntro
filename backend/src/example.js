import { initDatabase } from './db/init.js';

import { Post } from './db/models/post.js';

import dotenv from 'dotenv';
dotenv.config();

await initDatabase();

const post = new Post({
  title: 'Hello Mongoose again !',
  author: 'Lu Kang',
  contents: 'Go !!! Lud',
  tags: ['Lu', 'Kang'],
});

const post1 = new Post({
  title: 'Hello World !',
  author: 'ABle Brown',
  contents: 'a better hello wrle',
  tags: ['world', 'hello'],
});

(await post1.save(),
  //const createdPost =
  await post.save());
// await Post.findByIdAndUpdate(createdPost._id, {
//   $set: { title: 'Hello again Team Mates !!' },
//});

const posts = await Post.find();
console.log(posts);

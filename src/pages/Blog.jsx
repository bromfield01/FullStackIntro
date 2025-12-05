// src/App.jsx
import { PostList } from '../components/PostList.jsx';
import { CreatePost } from '../components/CreatePost.jsx';
import { PostFilter } from '../components/PostFilter.jsx';
import { PostSorting } from '../components/PostSorting.jsx';
import { Header } from '../components/Header.jsx';

import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { getPosts } from '../api/posts.js';

import { ChatPanel } from '../components/ChatPanel.jsx';

export function Blog() {
  const [author, setAuthor] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, SetSortOrder] = useState('descending');

  const postsQuery = useQuery({
    queryKey: ['posts', { author, sortBy, sortOrder }],
    queryFn: () => getPosts({ author, sortBy, sortOrder }),
  });

  const posts = postsQuery.data ?? [];

  return (
    <div style={{ padding: 8 }}>
      <Header />
      <br />
      <hr />

      <CreatePost />

      <br />
      <hr />
      <ChatPanel />

      <br />
      <hr />

      <div>Filter by:</div>
      <PostFilter
        field='author'
        value={author}
        onChange={(value) => setAuthor(value)}
      />

      <br />

      <PostSorting
        fields={['createdAt', 'updatedAt']}
        value={sortBy}
        onChange={(value) => setSortBy(value)}
        orderValue={sortOrder}
        onOrderChage={(orderValue) => SetSortOrder(orderValue)}
      />

      <hr />

      <PostList posts={posts} />
    </div>
  );
}

export default Blog;

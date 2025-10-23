// src/pages/Blog.jsx
import { PostList } from '../components/PostList.jsx';
import { CreatePost } from '../components/CreatePost.jsx';
import { PostFilter } from '../components/PostFilter.jsx';
import { PostSorting } from '../components/PostSorting.jsx';
import { Header } from '../components/Header.jsx';

//import PropTypes from 'prop-types'
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
// adjust this import to wherever your API helper lives
import { getPosts } from '../api/posts.js';

import { Helmet } from 'react-helmet-async';

export function Blog() {
  const [author, setAuthor] = useState('');
  const [sortBy, setBy] = useState('createdAt');
  const [sortOrder, setOrder] = useState('descending');

  const postsQuery = useQuery({
    queryKey: ['posts', { author, sortBy, sortOrder }],
    queryFn: () => getPosts({ author, sortBy, sortOrder }),
  });

  const posts = postsQuery.data ?? [];

  return (
    <div style={{ padding: 8 }}>
      <Helmet>
        <title>Full-Stack React Blog</title>
        <meta
          name='description'
          content='A blog full of articles about full-stack React dvelopment.'
        />
      </Helmet>
      <Header />
      <br />
      <hr />

      <CreatePost />

      <br />
      <hr />

      <PostFilter author={author} onChangeAuthor={setAuthor} />

      <br />

      <PostSorting
        fields={['createdAt', 'updatedAt']}
        value={sortBy}
        onChange={(value) => setBy(value)}
        orderValue={sortOrder}
        onOrderChange={(orderValue) => setOrder(orderValue)}
      />

      <hr />

      <PostList posts={posts} />
    </div>
  );
}

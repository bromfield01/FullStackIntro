// src/pages/Blog.jsx
import { Helmet } from 'react-helmet-async';
import { Header } from '../components/Header.jsx';
import { useState, useMemo } from 'react';
import { usePosts } from '../hooks/usePosts.js';

// UI selects map nicely to your PostOptions input
export function Blog() {
  const [author, setAuthor] = useState('');
  const [sortBy, setSortBy] = useState('createdAt'); // PostSortBy enum
  const [sortOrder, setSortOrder] = useState('descending'); // SortOrder enum

  const options = useMemo(() => {
    // Server will normalize; you can add offset/limit/filter here too
    return {
      filter: author?.trim() || undefined, // if you want "search in title/contents"
      sortBy,
      sortOrder,
      limit: 20,
      offset: 0,
    };
  }, [author, sortBy, sortOrder]);

  const { data, loading, error } = usePosts(options);
  const posts = data?.posts ?? [];

  return (
    <div style={{ padding: 8 }}>
      <Helmet>
        <title>Full-Stack React Blog</title>
        <meta
          name='description'
          content='A blog full of articles about full-stack React development.'
        />
      </Helmet>

      <Header />

      <br />

      <div
        style={{
          display: 'grid',
          gap: 8,
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}
      >
        <label>
          Filter by author:
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder='username'
            style={{ width: '100%' }}
          />
        </label>

        <label>
          Sort By:
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value='createdAt'>createdAt</option>
            <option value='updatedAt'>updatedAt</option>
            <option value='title'>title</option>
          </select>
        </label>

        <label>
          Sort Order:
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value='ascending'>ascending</option>
            <option value='descending'>descending</option>
          </select>
        </label>
      </div>

      <br />

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'crimson' }}>Error: {error.message}</p>}

      {!loading && !error && posts.length === 0 && <p>No posts yet.</p>}

      <ul>
        {posts.map((p) => (
          <li key={p.id} style={{ margin: '12px 0' }}>
            <strong>{p.title}</strong>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              by {p.author?.username ?? '—'} &middot; tags:{' '}
              {p.tags?.join(', ') || '—'}
            </div>
            <div>{p.contents}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

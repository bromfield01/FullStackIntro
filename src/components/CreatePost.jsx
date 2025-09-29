// src/components/CreatePost.jsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext.jsx';
import { createPost } from '../api/posts';

export function CreatePost() {
  const [title, setTitle] = useState('');

  const [contents, setContents] = useState('');

  const [token] = useAuth();

  const queryClient = useQueryClient();

  const creatPostMutation = useMutation({
    mutationFn: () => createPost(token, { title, contents }),
    onSuccess: () => queryClient.invalidateQueries(['posts']),
  });

  const handlesubmit = (e) => {
    e.preventDefault(), creatPostMutation.mutate();
  };

  if (!token) return <div>Please log in to create a new posts.</div>;
  return (
    <form onSubmit={handlesubmit}>
      <div>
        <label htmlFor='create-title'>Title: </label>
        <input
          type='text'
          name='create-title'
          id='create-title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <br />

      <textarea
        id='create-contents'
        name='create-contents'
        rows='4'
        value={contents}
        onChange={(e) => setContents(e.target.value)}
      />

      <br />
      <br />
      <input
        type='submit'
        value={creatPostMutation.isPending ? 'Creating...' : 'Create'}
        disabled={!title}
      />
      {creatPostMutation.isSuccess ? (
        <>
          <br />
          Post created successfully !
        </>
      ) : null}
    </form>
  );
}

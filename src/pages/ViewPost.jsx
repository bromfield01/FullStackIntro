// src/pages/ViewPost.jsx
import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';

import { Header } from '../components/Header.jsx';
import { Post } from '../components/Post.jsx';

import { getPostById } from '../api/posts.js';
import { getUserInfo } from '../api/users.js';
import { postTrackEvent } from '../api/events.js';
import { PostStats } from '../components/PostStats.jsx';

export function ViewPost({ postId }) {
  const [session, setSession] = useState();
  const startTimerRef = useRef(null); // track whether startView fired

  // --- mutations (records start/end with same session) ---
  const trackEventMutation = useMutation({
    mutationFn: (action) => postTrackEvent({ postId, action, session }),
    onSuccess: (data) => {
      // keep any existing session; otherwise adopt server-generated one
      setSession((s) => s ?? data?.session);
    },
    onError: (err) => {
      // optional: surface to a logger / toast
      // eslint-disable-next-line no-console
      console.error('trackEvent failed', err);
    },
  });

  // fire start after 1s; send end on unmount if start fired
  useEffect(() => {
    startTimerRef.current = setTimeout(() => {
      trackEventMutation.mutate('startView');
      startTimerRef.current = null; // mark as fired
    }, 1000);

    return () => {
      if (startTimerRef.current) {
        clearTimeout(startTimerRef.current); // user left before 1s — no event
      } else {
        // startView happened, so pair it with an endView
        trackEventMutation.mutate('endView');
      }
    };
    // we intentionally omit trackEventMutation from deps to avoid re-firing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, session]);

  // persist the session during the view to survive soft reloads
  useEffect(() => {
    const key = `view-session:${postId}`;
    if (session) sessionStorage.setItem(key, session);
    return () => sessionStorage.removeItem(key);
  }, [session, postId]);

  // sendBeacon backup for tab close / backgrounding (browsers may drop async requests)
  useEffect(() => {
    const endpoint = `${import.meta.env.VITE_BACKEND_URL}/events`; // change to /api/v1/events if that's your route

    const sendEndView = () => {
      try {
        if (!session) return;
        const body = JSON.stringify({ postId, action: 'endView', session });
        const blob = new Blob([body], { type: 'application/json' });
        // best-effort; does not block unload
        navigator.sendBeacon?.(endpoint, blob);
      } catch {
        /* noop */
      }
    };

    const onHidden = () => {
      if (document.visibilityState === 'hidden') sendEndView();
    };

    window.addEventListener('beforeunload', sendEndView);
    document.addEventListener('visibilitychange', onHidden);
    return () => {
      window.removeEventListener('beforeunload', sendEndView);
      document.removeEventListener('visibilitychange', onHidden);
    };
  }, [postId, session]);

  // --- data queries ---
  const postQuery = useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPostById(postId),
  });
  const post = postQuery.data;

  const userInfoQuery = useQuery({
    queryKey: ['users', post?.author],
    queryFn: () => getUserInfo(post?.author),
    enabled: Boolean(post?.author),
  });
  const userInfo = userInfoQuery.data ?? {};

  // --- helpers ---
  function truncate(str, max = 160) {
    if (!str) return str;
    return str.length > max ? `${str.slice(0, max - 3)}...` : str;
  }

  return (
    <div style={{ padding: 8 }}>
      {post && (
        <Helmet>
          <title>{post.title} | Full-Stack React Blog</title>
          <meta name='description' content={truncate(post.contents)} />
          <meta property='og:type' content='article' />
          <meta property='og:title' content={post.title} />
          <meta property='og:article:published_time' content={post.createdAt} />
          <meta property='og:article:modified_time' content={post.updatedAt} />
          <meta property='og:article:author' content={userInfo?.username} />
          {(post.tags ?? []).map((tag) => (
            <meta key={tag} property='og:article:tag' content={tag} />
          ))}
        </Helmet>
      )}

      <Header />
      <br />
      <hr />
      <Link to='/'>Back to main page</Link>
      <br />
      <hr />
      {post ? (
        <div>
          {' '}
          <Post {...post} fullPost /> <hr /> <PostStats postId={postId} />
        </div>
      ) : (
        `Post with id ${postId} not found.`
      )}
    </div>
  );
}

ViewPost.propTypes = {
  postId: PropTypes.string.isRequired,
};

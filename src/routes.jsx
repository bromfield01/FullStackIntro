// src/routes.jsx
import { Blog } from './pages/Blog.jsx';
import { Signup } from './pages/Signup.jsx';
import { Login } from './pages/Login.jsx';

import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from '@tanstack/react-query';
import { useLoaderData } from 'react-router-dom';

import { getPosts } from './api/posts.js';
import { getUserInfo } from './api/users.js'; // adjust path if different

export const routes = [
  {
    path: '/',
    loader: async () => {
      const queryClient = new QueryClient();

      // defaults used on first load
      const author = '';
      const sortBy = 'createdAt';
      const sortOrder = 'descending';

      // fetch posts for initial render
      const posts = await getPosts({ author, sortBy, sortOrder });

      // seed the cache for posts
      await queryClient.prefetchQuery({
        queryKey: ['posts', { author, sortBy, sortOrder }],
        queryFn: () => posts, // avoid double fetch
      });

      // prefetch each unique author's user info
      const uniqueAuthors = posts
        .map((post) => post.author)
        .filter((value, index, array) => array.indexOf(value) === index);

      for (const userId of uniqueAuthors) {
        await queryClient.prefetchQuery({
          queryKey: ['users', userId],
          queryFn: () => getUserInfo(userId),
        });
      }

      // pass dehydrated cache to the component via loader data
      return dehydrate(queryClient);
    },
    Component() {
      const dehydratedState = useLoaderData();
      return (
        <HydrationBoundary state={dehydratedState}>
          <Blog />
        </HydrationBoundary>
      );
    },
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/login',
    element: <Login />,
  },
];

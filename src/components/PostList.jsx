// src/components/PostList.jsx
import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Post } from './Post.jsx';

export function PostList({ posts = [] }) {
  return (
    <div>
      {posts.map((p) => {
        const postId = p._id ?? p.id ?? p.postId ?? p.slug;
        return (
          <Fragment key={postId ?? p._id ?? p.id}>
            <Post
              {...p}
              postId={postId} // <-- explicit id for the link
              fullPost={false} // <-- force teaser mode in list
            />
            <hr />
          </Fragment>
        );
      })}
    </div>
  );
}

PostList.propTypes = {
  posts: PropTypes.arrayOf(PropTypes.shape(Post.propTypes)).isRequired,
};

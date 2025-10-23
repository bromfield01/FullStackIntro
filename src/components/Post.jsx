// src/components/Post.jsx
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { User } from './User.jsx';
import slug from 'slug';

export function Post({ title, contents, author, postId, fullPost = false }) {
  return (
    <article>
      {fullPost || !postId ? (
        <h3>{title}</h3>
      ) : (
        <Link
          to={`/posts/${postId}/${slug(title)}`}
          style={{ textDecoration: 'underline', cursor: 'pointer' }}
        >
          <h3>{title}</h3>
        </Link>
      )}

      {fullPost && <div>{contents}</div>}

      {author && (
        <p>
          <em>
            {fullPost && <br />}
            Written by <User id={author} />
          </em>
        </p>
      )}
    </article>
  );
}

Post.propTypes = {
  title: PropTypes.string.isRequired,
  contents: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  author: PropTypes.string,
  postId: PropTypes.string, // <- the only id we rely on
  fullPost: PropTypes.bool,
};

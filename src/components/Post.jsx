// src/components/Post.jsx
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { User } from './User.jsx';

export function Post({ title, contents, author, _id, id, fullPost = false }) {
  // Safely pick whichever key exists
  const postId = _id || id;

  return (
    <article>
      {fullPost || !postId ? (
        <h3>{title}</h3>
      ) : (
        <Link
          to={`/posts/${postId}`}
          style={{
            textDecoration: 'underline',
            cursor: 'pointer',
            color: '#1a0dab', // add visible color to show it’s a link
          }}
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
  _id: PropTypes.string,
  id: PropTypes.string,
  fullPost: PropTypes.bool,
};

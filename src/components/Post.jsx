// src/components/Post.jsx
import PropTypes from 'prop-types';

export function Post({ title, contents, author }) {
  return (
    <article>
      <h3>{title}</h3>
      <div>{contents}</div>
      {author && (
        <p>
          <em>
            Written by <strong>{author}</strong>
          </em>
        </p>
      )}
    </article>
  );
}

Post.propTypes = {
  title: PropTypes.string.isRequired,
  contents: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  author: PropTypes.string,
};

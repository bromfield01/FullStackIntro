// src/components/Post.jsx
import PropTypes from 'prop-types';
import { User } from './User.jsx';

export function Post({ title, contents, author: userId }) {
  return (
    <article>
      <h3>{title}</h3>
      <div>{contents}</div>
      {userId && (
        <p>
          <em>
            Written by{' '}
            <strong>
              <User id={userId} />
            </strong>
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

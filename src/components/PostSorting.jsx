// src/components/PostSorting.jsx
import PropTypes from 'prop-types';

export function PostSorting({
  fields = [],
  value = '',
  onChange = () => {}, // safe no-op
  orderValue = 'descending', // default
  onOrderChange = () => {}, // safe no-op
}) {
  const hasFields = Array.isArray(fields) && fields.length > 0;

  return (
    <div>
      <label htmlFor='sortBy'>Sort By: </label>
      <select
        name='sortBy'
        id='sortBy'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!hasFields}
      >
        {hasFields ? (
          fields.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))
        ) : (
          <option value='' disabled>
            No fields
          </option>
        )}
      </select>{' '}
      <label htmlFor='sortOrder'>Sort Order: </label>
      <select
        name='sortOrder'
        id='sortOrder'
        value={orderValue}
        onChange={(e) => onOrderChange(e.target.value)}
      >
        <option value='ascending'>ascending</option>
        <option value='descending'>descending</option>
      </select>
    </div>
  );
}

PostSorting.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.string),
  value: PropTypes.string,
  onChange: PropTypes.func,
  orderValue: PropTypes.string,
  onOrderChange: PropTypes.func,
};

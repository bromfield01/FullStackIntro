/* global use, db */

// Switch to your simulation database
use('blog-simulated');

// Aggregate total number of "startView" actions per post
db.getCollection('events').aggregate([
  {
    $match: { action: 'startView' },
  },
  {
    $group: {
      _id: '$post',
      views: { $count: {} },
    },
  },
]);

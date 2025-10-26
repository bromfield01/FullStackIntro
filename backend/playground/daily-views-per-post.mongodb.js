/* global use, db */

// Switch to the simulated blog database
use('blog-simulated');

// Aggregate to calculate daily views per post
db.getCollection('events').aggregate([
  {
    $match: { action: 'startView' },
  },
  {
    $project: {
      post: '$post',
      day: { $dateTrunc: { date: '$date', unit: 'day' } },
    },
  },
  {
    $group: {
      _id: { post: '$post', day: '$day' },
      views: { $count: {} },
    },
  },
]);

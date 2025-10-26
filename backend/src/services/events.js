// backend/src/services/events.js

import { v4 as uuidv4 } from 'uuid';
import { Event } from '../db/models/event.js';

// -------------------------
// Track event (existing)
// -------------------------
export async function trackEvent({
  postId,
  action,
  session = uuidv4(),
  date = Date.now(),
}) {
  const event = new Event({
    post: postId,
    action,
    session,
    date,
  });

  return await event.save();
}

// -------------------------
// Total views (existing)
// -------------------------
export async function getTotalViews(postId) {
  return {
    views: await Event.countDocuments({ post: postId, action: 'startView' }),
  };
}

// -------------------------
// Daily views (existing)
// -------------------------
export async function getDailyViews(postId) {
  return await Event.aggregate([
    { $match: { post: postId, action: 'startView' } },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          day: { $dayOfMonth: '$date' },
        },
        views: { $count: {} },
      },
    },
    { $sort: { _id: 1 } },
  ]);
}

// -------------------------
// NEW: Daily session durations
// -------------------------
export async function getDailyDurations(postId) {
  return await Event.aggregate([
    // Match events for the given post
    { $match: { post: postId } },

    // Create startDate and endDate fields for each event
    {
      $project: {
        post: '$post',
        session: '$session',
        startDate: {
          $cond: [{ $eq: ['$action', 'startView'] }, '$date', undefined],
        },
        endDate: {
          $cond: [{ $eq: ['$action', 'endView'] }, '$date', undefined],
        },
      },
    },

    // Group by session and get min/max timestamps
    {
      $group: {
        _id: '$session',
        post: { $first: '$post' },
        startDate: { $min: '$startDate' },
        endDate: { $max: '$endDate' },
      },
    },

    // Filter out incomplete sessions (missing start or end)
    {
      $match: { startDate: { $ne: null }, endDate: { $ne: null } },
    },

    // Compute duration per session
    {
      $project: {
        post: 1,
        session: '$_id',
        duration: { $subtract: ['$endDate', '$startDate'] },
        day: { $dateTrunc: { date: '$startDate', unit: 'day' } },
      },
    },

    // Group by post + day to calculate average session duration
    {
      $group: {
        _id: { post: '$post', day: '$day' },
        averageDurationMs: { $avg: '$duration' },
        totalDurationMs: { $sum: '$duration' },
        sessionCount: { $count: {} },
      },
    },

    // Sort chronologically
    { $sort: { '_id.day': 1 } },
  ]);
}

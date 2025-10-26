// src/components/PostStats.jsx
import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import {
  getTotalViews,
  getDailyViews,
  getDailyDurations,
} from '../api/events.js';

import {
  VictoryChart,
  VictoryTooltip,
  VictoryBar,
  VictoryLine,
  VictoryVoronoiContainer,
  VictoryAxis,
} from 'victory';

// --- Helper to extract the right date field ---
function coerceDayToDate(d) {
  // 1. Top-level day field from $dateTrunc
  if (d.day) return new Date(d.day);

  // 2. Nested _id.day (from grouping pipelines)
  if (d._id?.day) return new Date(d._id.day);

  // 3. Separate year/month/day fields
  if (d._id?.year && d._id?.month && d._id?.day) {
    return new Date(d._id.year, d._id.month - 1, d._id.day);
  }

  // 4. Fallback: try parsing _id directly if string
  if (typeof d._id === 'string') return new Date(d._id);

  return null;
}

// --- Format milliseconds to human readable seconds/minutes ---
function fmtSecs(ms) {
  const s = Math.max(0, Math.round((Number(ms) || 0) / 1000));
  const mm = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, '0');
  return mm ? `${mm}m ${ss}s` : `${ss}s`;
}

export function PostStats({ postId }) {
  const totalViews = useQuery({
    queryKey: ['totalViews', postId],
    queryFn: () => getTotalViews(postId),
  });

  const dailyViews = useQuery({
    queryKey: ['dailyViews', postId],
    queryFn: () => getDailyViews(postId),
  });

  const dailyDurations = useQuery({
    queryKey: ['dailyDurations', postId],
    queryFn: () => getDailyDurations(postId),
  });

  if (
    totalViews.isLoading ||
    dailyViews.isLoading ||
    dailyDurations.isLoading
  ) {
    return <div>loading stats...</div>;
  }

  // --- Prepare data for Daily Views (VictoryBar) ---
  const viewsData = (dailyViews.data ?? [])
    .map((d) => {
      const x = coerceDayToDate(d);
      const y = Number(d.views) || 0;
      return {
        x,
        y,
        label: `${x?.toLocaleDateString?.() ?? ''}: ${y} views`,
      };
    })
    .filter((pt) => pt.x instanceof Date && !isNaN(pt.x));

  // --- Prepare data for Daily Durations (VictoryLine) ---
  const durationData = (dailyDurations.data ?? [])
    .map((d) => {
      const x = coerceDayToDate(d);
      const avgMs =
        d.averageDurationMs ?? d.avgDurationMs ?? d.averageMs ?? d.avgMs ?? 0;
      const y = Number(avgMs) / 1000; // Convert ms → seconds
      return {
        x,
        y,
        label: `${x?.toLocaleDateString?.() ?? ''}: ${fmtSecs(avgMs)}`,
      };
    })
    .filter((pt) => pt.x instanceof Date && !isNaN(pt.x));

  return (
    <div>
      <b>{totalViews.data?.views} total views</b>

      {/* --- Chart 1: Daily Views (Bar) --- */}
      <VictoryChart domainPadding={16} scale={{ x: 'time' }}>
        <VictoryAxis tickFormat={(t) => new Date(t).toLocaleDateString()} />
        <VictoryAxis dependentAxis />
        <VictoryBar
          labelComponent={<VictoryTooltip />}
          data={viewsData}
          style={{
            data: { fill: '#4e79a7' },
            labels: { fontSize: 10 },
          }}
        />
      </VictoryChart>

      {/* --- Chart 2: Daily Average Duration (Line) --- */}
      <VictoryChart
        domainPadding={16}
        scale={{ x: 'time' }}
        containerComponent={<VictoryVoronoiContainer />}
      >
        <VictoryAxis tickFormat={(t) => new Date(t).toLocaleDateString()} />
        <VictoryAxis dependentAxis tickFormat={(t) => `${Math.round(t)}s`} />
        <VictoryLine
          data={durationData}
          labels={({ datum }) => datum.label}
          labelComponent={<VictoryTooltip />}
          style={{
            data: { stroke: '#ff6b35', strokeWidth: 2 },
            labels: { fontSize: 10 },
          }}
        />
      </VictoryChart>
    </div>
  );
}

PostStats.propTypes = {
  postId: PropTypes.string.isRequired,
};

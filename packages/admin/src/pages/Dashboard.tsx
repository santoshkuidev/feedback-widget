import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Button,
  useTheme,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getFeedbackStats } from '../api/feedback';

interface StatsData {
  averageRating: {
    average: number;
    count: number;
  };
  ratingDistribution: {
    _id: number;
    count: number;
  }[];
  feedbackOverTime: {
    _id: string;
    count: number;
    averageRating: number;
  }[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getFeedbackStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Prepare data for rating distribution chart
  const ratingDistributionData = stats?.ratingDistribution.map((item) => ({
    rating: item._id,
    count: item.count,
  })) || [];

  // Fill in missing ratings with zero count
  const allRatings = [1, 2, 3, 4, 5];
  const existingRatings = ratingDistributionData.map((item) => item.rating);
  allRatings.forEach((rating) => {
    if (!existingRatings.includes(rating)) {
      ratingDistributionData.push({ rating, count: 0 });
    }
  });
  
  // Sort by rating
  ratingDistributionData.sort((a, b) => a.rating - b.rating);

  // Prepare data for feedback over time chart
  const feedbackOverTimeData = stats?.feedbackOverTime.map((item) => ({
    date: item._id,
    count: item.count,
    averageRating: parseFloat(item.averageRating.toFixed(1)),
  })) || [];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={() => window.location.reload()}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Feedback
              </Typography>
              <Typography variant="h3">
                {stats?.averageRating.count || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Rating
              </Typography>
              <Typography variant="h3">
                {stats?.averageRating.average 
                  ? stats.averageRating.average.toFixed(1) 
                  : 'N/A'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Box 
                    key={star}
                    sx={{ 
                      color: star <= Math.round(stats?.averageRating.average || 0) 
                        ? theme.palette.warning.main 
                        : theme.palette.grey[300],
                      fontSize: '1.5rem',
                      mr: 0.5
                    }}
                  >
                    ★
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Feedback This Week
              </Typography>
              <Typography variant="h3">
                {feedbackOverTimeData
                  .slice(-7)
                  .reduce((sum, item) => sum + item.count, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Rating Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Rating Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ratingDistributionData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="count"
                      name="Number of Ratings"
                      fill={theme.palette.primary.main}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Feedback Over Time Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Feedback Over Time
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={feedbackOverTimeData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="count"
                      name="Number of Feedback"
                      stroke={theme.palette.primary.main}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="averageRating"
                      name="Average Rating"
                      stroke={theme.palette.secondary.main}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

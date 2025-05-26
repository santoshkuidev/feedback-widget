import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Rating,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Language as LanguageIcon,
  Computer as ComputerIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { getFeedbackById, deleteFeedback } from '../api/feedback';

interface Feedback {
  _id: string;
  rating: number;
  comment: string;
  email?: string;
  metadata: {
    url: string;
    userAgent: string;
    timestamp: number;
    referrer: string;
    sessionId: string;
    clientId: string;
  };
  createdAt: string;
  updatedAt: string;
}

const FeedbackDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getFeedbackById(id);
        setFeedback(data);
      } catch (err) {
        setError('Failed to load feedback details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteFeedback(id);
      navigate('/feedback');
    } catch (err) {
      setError('Failed to delete feedback');
      console.error(err);
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    }).format(date);
  };

  const getBrowserInfo = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('edg')) return 'Microsoft Edge';
    if (ua.includes('chrome')) return 'Chrome';
    if (ua.includes('safari')) return 'Safari';
    if (ua.includes('opera') || ua.includes('opr')) return 'Opera';
    if (ua.includes('msie') || ua.includes('trident')) return 'Internet Explorer';
    
    return 'Unknown Browser';
  };

  const getOSInfo = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('mac os')) return 'macOS';
    if (ua.includes('iphone')) return 'iOS';
    if (ua.includes('ipad')) return 'iPadOS';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('linux')) return 'Linux';
    
    return 'Unknown OS';
  };

  const getDeviceType = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('iphone') || ua.includes('android') && ua.includes('mobile')) return 'Mobile';
    if (ua.includes('ipad') || ua.includes('android') && !ua.includes('mobile')) return 'Tablet';
    
    return 'Desktop';
  };

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
          <Button color="inherit" size="small" onClick={() => navigate('/feedback')}>
            Back to List
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (!feedback) {
    return (
      <Alert 
        severity="warning"
        action={
          <Button color="inherit" size="small" onClick={() => navigate('/feedback')}>
            Back to List
          </Button>
        }
      >
        Feedback not found
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/feedback')}
        >
          Back to List
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteDialogOpen(true)}
        >
          Delete
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Feedback Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Rating
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Rating value={feedback.rating} readOnly />
                <Typography variant="body1" sx={{ ml: 1 }}>
                  {feedback.rating}/5
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Comment
              </Typography>
              {feedback.comment ? (
                <Typography variant="body1">{feedback.comment}</Typography>
              ) : (
                <Typography variant="body2" color="textSecondary" fontStyle="italic">
                  No comment provided
                </Typography>
              )}
            </Box>
            
            {feedback.email && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Email
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">{feedback.email}</Typography>
                </Box>
              </Box>
            )}
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Submitted From
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LanguageIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  <a 
                    href={feedback.metadata.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: theme.palette.primary.main }}
                  >
                    {feedback.metadata.url}
                  </a>
                </Typography>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Submission Time
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  {formatDate(feedback.createdAt)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Device Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Device Type
                </Typography>
                <Chip 
                  icon={<ComputerIcon />} 
                  label={getDeviceType(feedback.metadata.userAgent)}
                  size="small"
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Browser
                </Typography>
                <Typography variant="body2">
                  {getBrowserInfo(feedback.metadata.userAgent)}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Operating System
                </Typography>
                <Typography variant="body2">
                  {getOSInfo(feedback.metadata.userAgent)}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  User Agent
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {feedback.metadata.userAgent}
                </Typography>
              </Box>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Additional Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {feedback.metadata.referrer && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Referrer
                  </Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    {feedback.metadata.referrer}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Session ID
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {feedback.metadata.sessionId}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Client ID
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {feedback.metadata.clientId}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Feedback</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this feedback? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedbackDetail;

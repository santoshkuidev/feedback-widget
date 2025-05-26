import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Rating,
  useTheme,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  GetApp as DownloadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAllFeedback, deleteFeedback, exportFeedbackCsv } from '../api/feedback';

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
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const FeedbackList: React.FC = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    minRating: '',
    maxRating: '',
    startDate: '',
    endDate: '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const appliedFilters: Record<string, any> = {};
      
      if (filters.minRating) appliedFilters.minRating = filters.minRating;
      if (filters.maxRating) appliedFilters.maxRating = filters.maxRating;
      if (filters.startDate) appliedFilters.startDate = filters.startDate;
      if (filters.endDate) appliedFilters.endDate = filters.endDate;
      if (searchTerm) appliedFilters.search = searchTerm;
      
      const data = await getAllFeedback(pagination.page, pagination.limit, appliedFilters);
      setFeedback(data.feedback);
      setPagination(data.pagination);
    } catch (err) {
      setError('Failed to load feedback');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [pagination.page, pagination.limit]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPagination({ ...pagination, page: newPage + 1 });
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPagination({
      ...pagination,
      limit: parseInt(event.target.value, 10),
      page: 1,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchFeedback();
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleApplyFilters = () => {
    setPagination({ ...pagination, page: 1 });
    fetchFeedback();
  };

  const handleResetFilters = () => {
    setFilters({
      minRating: '',
      maxRating: '',
      startDate: '',
      endDate: '',
    });
    setSearchTerm('');
    setPagination({ ...pagination, page: 1 });
    setTimeout(fetchFeedback, 0);
  };

  const handleViewFeedback = (id: string) => {
    navigate(`/feedback/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setFeedbackToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!feedbackToDelete) return;
    
    try {
      await deleteFeedback(feedbackToDelete);
      setFeedback(feedback.filter((item) => item._id !== feedbackToDelete));
      setPagination({
        ...pagination,
        total: pagination.total - 1,
      });
    } catch (err) {
      setError('Failed to delete feedback');
      console.error(err);
    } finally {
      setDeleteDialogOpen(false);
      setFeedbackToDelete(null);
    }
  };

  const handleExportCsv = () => {
    exportFeedbackCsv();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Feedback</Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportCsv}
        >
          Export CSV
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <form onSubmit={handleSearch}>
              <TextField
                fullWidth
                placeholder="Search in comments or emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button type="submit" variant="contained" size="small">
                        Search
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
            </form>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </Grid>

          {showFilters && (
            <>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Min Rating"
                  type="number"
                  name="minRating"
                  value={filters.minRating}
                  onChange={handleFilterChange}
                  inputProps={{ min: 1, max: 5 }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Max Rating"
                  type="number"
                  name="maxRating"
                  value={filters.maxRating}
                  onChange={handleFilterChange}
                  inputProps={{ min: 1, max: 5 }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={handleResetFilters}>
                  Reset
                </Button>
                <Button variant="contained" onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={fetchFeedback}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : feedback.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No feedback found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Try adjusting your search or filters
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rating</TableCell>
                  <TableCell>Comment</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {feedback.map((item) => (
                  <TableRow key={item._id} hover>
                    <TableCell>
                      <Rating value={item.rating} readOnly size="small" />
                    </TableCell>
                    <TableCell>
                      {item.comment ? (
                        item.comment.length > 100 ? (
                          `${item.comment.substring(0, 100)}...`
                        ) : (
                          item.comment
                        )
                      ) : (
                        <Typography variant="body2" color="textSecondary" fontStyle="italic">
                          No comment
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={new URL(item.metadata.url).hostname}
                        sx={{ maxWidth: 150 }}
                      />
                    </TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleViewFeedback(item._id)}
                        size="small"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(item._id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={pagination.total}
            page={pagination.page - 1}
            onPageChange={handleChangePage}
            rowsPerPage={pagination.limit}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>
      )}

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
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedbackList;

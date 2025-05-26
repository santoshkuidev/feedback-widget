import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
  Snackbar,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  ContentCopy as ContentCopyIcon,
  Refresh as RefreshIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { generateApiKey } from '../api/auth';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem('apiKey') || '');
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [widgetSettings, setWidgetSettings] = useState({
    probability: '0.1',
    delay: '30',
    primaryColor: '#4a6cf7',
    position: 'bottom-right',
    darkMode: 'false',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleGenerateApiKey = async () => {
    if (!user?.id) return;
    
    try {
      setIsGeneratingKey(true);
      const response = await generateApiKey(user.id);
      setApiKey(response.apiKey);
      localStorage.setItem('apiKey', response.apiKey);
      setSnackbarMessage('API key generated successfully');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage('Failed to generate API key');
      setSnackbarOpen(true);
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setSnackbarMessage('API key copied to clipboard');
    setSnackbarOpen(true);
  };

  const handleWidgetSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWidgetSettings({
      ...widgetSettings,
      [e.target.name]: e.target.value,
    });
  };

  const generateEmbedCode = () => {
    return `<!-- Feedback Widget -->
<script 
  src="https://feedback-widget.example.com/widget.js" 
  data-auto-init
  data-probability="${widgetSettings.probability}"
  data-delay="${parseInt(widgetSettings.delay) * 1000}"
  data-primary-color="${widgetSettings.primaryColor}"
  data-position="${widgetSettings.position}"
  data-dark-mode="${widgetSettings.darkMode}"
  data-api-url="https://api.feedback-widget.example.com"
></script>`;
  };

  const handleCopyEmbedCode = () => {
    navigator.clipboard.writeText(generateEmbedCode());
    setSnackbarMessage('Embed code copied to clipboard');
    setSnackbarOpen(true);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Widget Configuration" />
          <Tab label="API Keys" />
          <Tab label="Account" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Widget Configuration
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Customize how the feedback widget appears and behaves on your website.
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Trigger Probability"
                  name="probability"
                  type="number"
                  value={widgetSettings.probability}
                  onChange={handleWidgetSettingChange}
                  helperText="Probability (0-1) of showing the widget to a user"
                  inputProps={{ step: 0.1, min: 0, max: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Trigger Delay (seconds)"
                  name="delay"
                  type="number"
                  value={widgetSettings.delay}
                  onChange={handleWidgetSettingChange}
                  helperText="Time in seconds before showing the widget"
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Primary Color"
                  name="primaryColor"
                  type="color"
                  value={widgetSettings.primaryColor}
                  onChange={handleWidgetSettingChange}
                  helperText="Main color for the widget"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            backgroundColor: widgetSettings.primaryColor,
                            borderRadius: 1,
                            border: '1px solid #ddd',
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Widget Position"
                  name="position"
                  value={widgetSettings.position}
                  onChange={handleWidgetSettingChange}
                  helperText="Position of the widget on the page"
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Dark Mode"
                  name="darkMode"
                  value={widgetSettings.darkMode}
                  onChange={handleWidgetSettingChange}
                  helperText="Enable dark mode for the widget"
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="false">Disabled</option>
                  <option value="true">Enabled</option>
                </TextField>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Embed Code
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Copy and paste this code into your website to add the feedback widget.
              </Typography>

              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent sx={{ p: 0 }}>
                  <SyntaxHighlighter language="html" style={docco} customStyle={{ margin: 0 }}>
                    {generateEmbedCode()}
                  </SyntaxHighlighter>
                </CardContent>
              </Card>

              <Button
                variant="contained"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyEmbedCode}
              >
                Copy Embed Code
              </Button>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              API Keys
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Your API key is used to authenticate requests to the Feedback Widget API.
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Alert severity="warning" sx={{ mb: 3 }}>
              Keep your API key secure. Do not share it publicly or commit it to version control.
            </Alert>

            <TextField
              fullWidth
              label="Your API Key"
              value={apiKey}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Copy API Key">
                      <IconButton edge="end" onClick={handleCopyApiKey}>
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              variant="outlined"
              startIcon={isGeneratingKey ? <CircularProgress size={20} /> : <RefreshIcon />}
              onClick={handleGenerateApiKey}
              disabled={isGeneratingKey}
            >
              {isGeneratingKey ? 'Generating...' : 'Generate New API Key'}
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={user?.name || ''}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={user?.email || ''}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Role"
                  value={user?.role || ''}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Alert severity="info">
                Account settings management will be available in a future update.
              </Alert>
            </Box>
          </Box>
        </TabPanel>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default Settings;

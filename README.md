# Feedback Widget System

A lightweight, embeddable feedback widget system that businesses can easily integrate into any website or mobile app. The widget prompts a random selection of users to leave feedback without interrupting their experience.

## Features

### Embeddable Widget
- Can be inserted via a `<script>` tag in any HTML page
- React-based with a small footprint
- Supports customization (colors, logo, position, etc.)

### Randomized Trigger
- Controlled by a probability setting (e.g., 10% of users)
- Configurable delay (e.g., after 30s on page)
- Non-intrusive user experience

### Feedback Form
- Star rating
- Open text comment
- Optional email field for follow-ups

### Admin Dashboard
- View and filter feedback responses
- Analytics and statistics
- Export to CSV
- API key management

### API
- Secure endpoints for submitting feedback
- Admin endpoints for viewing/managing data

### Responsive UI
- Works on mobile and desktop
- Light/dark mode support

## Project Structure

The project is organized as a monorepo with the following components:

```
feedback-widget/
├── packages/
│   ├── widget/       # Embeddable widget (React)
│   └── admin/        # Admin dashboard (React)
├── server/           # Backend API (Node.js/Express)
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- MongoDB (for production)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/feedback-widget.git
cd feedback-widget
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Create .env file in the server directory
cp server/.env.example server/.env
# Edit the .env file with your settings
```

4. Start the development servers
```bash
npm run dev
```

This will start:
- Widget development server at http://localhost:3001
- Admin dashboard at http://localhost:3002
- API server at http://localhost:3000

## Usage

### Embedding the Widget

Add the following script tag to your website:

```html
<!-- Feedback Widget -->
<script 
  src="https://your-widget-url.com/feedback-widget.js" 
  data-auto-init
  data-probability="0.1"
  data-delay="30000"
  data-primary-color="#4a6cf7"
  data-position="bottom-right"
  data-dark-mode="false"
  data-api-url="https://your-api-url.com"
></script>
```

### Accessing the Admin Dashboard

The admin dashboard is where you can view and manage all feedback submissions.

1. **URL**: Access the admin dashboard at `https://your-admin-url.com` (or locally at http://localhost:3002 during development)

2. **First-time Setup**:
   - The first time you access the dashboard, you'll need to create an admin account
   - Click on "Sign Up" and complete the registration form
   - This first account will automatically be assigned admin privileges

3. **Login**: After registration, log in with your email and password

4. **Dashboard Features**:
   - **Dashboard**: View analytics and statistics about your feedback
   - **Feedback List**: Browse, search, and filter all feedback submissions
   - **Feedback Details**: View detailed information about each submission
   - **Settings**: Configure your widget appearance and manage API keys

### Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| data-auto-init | Automatically initialize the widget | - |
| data-probability | Probability (0-1) of showing the widget | 0.1 |
| data-delay | Delay in milliseconds before showing | 30000 |
| data-primary-color | Primary color for the widget | #4a6cf7 |
| data-position | Widget position (bottom-right, bottom-left, top-right, top-left) | bottom-right |
| data-dark-mode | Enable dark mode (true/false) | false |
| data-api-url | URL to the API server | https://api.example.com |
| data-company-name | Your company name | Your Company |
| data-company-logo | URL to your company logo | - |

### Manual Initialization

You can also initialize the widget manually:

```javascript
const widget = FeedbackWidget.init({
  apiUrl: 'https://your-api-url.com',
  triggerProbability: 0.1,
  triggerDelay: 30000,
  theme: {
    primaryColor: '#4a6cf7',
    textColor: '#333333',
    backgroundColor: '#ffffff',
    starColor: '#ffc107',
    darkMode: false,
  },
  companyName: 'Your Company',
  companyLogo: 'https://your-company.com/logo.png',
  position: 'bottom-right',
});

// You can also control the widget programmatically
widget.open();  // Open the feedback form
widget.close(); // Close the feedback form
```

## Deployment

### Building for Production

```bash
npm run build
```

This will create production builds for:
- Widget: `packages/widget/dist/feedback-widget.js`
- Admin Dashboard: `packages/admin/dist/`
- Server: `server/dist/`

### Deployment Options

#### Widget Deployment (GitHub Pages)

1. Navigate to the widget directory:
   ```bash
   cd packages/widget
   ```

2. Build and deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

3. Your widget will be available at `https://[your-username].github.io/feedback-widget/feedback-widget.js`

4. Use this URL in your script tag:
   ```html
   <script 
     src="https://[your-username].github.io/feedback-widget/feedback-widget.js" 
     data-api-url="https://your-vercel-api-url.vercel.app" 
     data-probability="0.1"
     data-delay="30000"
     data-primary-color="#4a6cf7"
     data-position="bottom-right"
     data-dark-mode="false"
     data-company-name="Your Company"
   ></script>
   ```

#### Server API Deployment (Vercel)

1. Install Vercel CLI if you haven't already:
   ```bash
   npm install -g vercel
   ```

2. Navigate to the server directory:
   ```bash
   cd server
   ```

3. Login to Vercel (if not already logged in):
   ```bash
   vercel login
   ```

4. Deploy to Vercel:
   ```bash
   npm run deploy
   ```

5. Your API will be available at the URL provided by Vercel

6. Update the `data-api-url` attribute in your widget script tag with this URL

#### Admin Dashboard Deployment

Deploy to Netlify, Vercel, or any static hosting service:
- Deploy the contents of `packages/admin/dist/` to your hosting service
- Configure environment variables for the API URL
- Set up proper redirects for client-side routing (example Netlify `_redirects` file below)

```
/*    /index.html   200
```

### Environment Variables

#### Firebase Setup

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com/)
2. Set up Firestore database
   - Go to Firestore Database in the Firebase console
   - Click "Create database"
   - Choose "Start in production mode"
   - Select a location close to your users
3. Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely

#### Server `.env` file
```
PORT=3000
CORS_ORIGIN=http://localhost:3002,https://your-admin-dashboard-url.com,https://your-portfolio-url.com

# Firebase configuration
FIREBASE_PROJECT_ID=feedback-widget-8da54
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@feedback-widget-8da54.iam.gserviceaccount.com
```

#### Admin Dashboard `.env` file
```
VITE_API_URL=https://your-vercel-api-url.vercel.app/api
```

## Security Considerations

1. **API Keys**: Keep your API keys secure and never expose them in client-side code
2. **CORS**: Configure your server to only accept requests from trusted domains
3. **Rate Limiting**: The server includes rate limiting to prevent abuse
4. **Data Privacy**: Consider implementing data anonymization for sensitive feedback

## Troubleshooting

### Widget Not Appearing
- Check that the script is correctly loaded (no 404 errors in console)
- Verify that your API URL is correct and the server is running
- Try increasing the probability setting for testing

### Admin Dashboard Issues
- Clear browser cache and cookies
- Check network requests for API errors
- Verify that your API key is valid

### API Connection Problems
- Ensure CORS is properly configured on the server
- Check that the API URL is correct in both widget and admin dashboard
- Verify that your MongoDB connection is working

## Maintenance

### Updating the Widget

When you make changes to the widget code:

1. Build a new version: `npm run build:widget`
2. Replace the deployed widget file with the new version
3. Users will automatically get the updated widget on page reload

### Database Backups

Regularly backup your MongoDB database to prevent data loss.

## Future Enhancements

- Slack, Email, Zapier integrations for real-time notifications
- CRM or analytics tools integrations
- Advanced user targeting options
- Multi-language support
- Custom question flows
- User segmentation and targeting

## Support

For questions or support, please contact us at support@example.com

## License

MIT

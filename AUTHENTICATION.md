# MCS Authentication Configuration

## Google OAuth Setup

To enable Gmail login/signup functionality, you need to:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sign-In API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Copy your Client ID

### Configuration Steps:

1. **Update login.html**: Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Google Client ID
   ```html
   data-client_id="YOUR_ACTUAL_GOOGLE_CLIENT_ID_HERE"
   ```

2. **Update auth.js**: Replace the placeholder in the GOOGLE_CLIENT_ID constant
   ```javascript
   const GOOGLE_CLIENT_ID = "YOUR_ACTUAL_GOOGLE_CLIENT_ID_HERE";
   ```

### Admin Access

Admin users are defined in `js/admin.js`. Currently configured admin emails:
- `admin@mcs.org`
- `admin@gmail.com` 
- `myanmarcosplaysociety@gmail.com`

To add more admin users, edit the `adminEmails` array in the `isAdminUser()` function.

### Data Storage

- User accounts are stored in `localStorage` under key `mcs_users`
- Login activity is stored in `localStorage` under key `mcs_login_data`
- Current session is stored in `sessionStorage` under key `currentUser`

For production use, consider implementing a proper backend database.

### Security Notes

- Passwords are stored in plain text (for demo only)
- In production, implement proper password hashing
- Consider adding CSRF protection
- Implement proper session management
- Add rate limiting for login attempts
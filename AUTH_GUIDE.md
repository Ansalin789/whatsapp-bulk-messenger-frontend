# Access & Refresh Token Authentication Guide

## Overview
This authentication system implements a secure token-based approach with:
- **Access Token**: Short-lived token (1 hour) for API requests
- **Refresh Token**: Long-lived token (7 days) for obtaining new access tokens
- **Automatic Refresh**: Tokens refresh 5 minutes before expiration
- **LocalStorage Persistence**: Tokens survive page refreshes

## How It Works

### 1. Login Flow
```
User enters credentials
        ↓
login(username, password)
        ↓
POST /api/auth/login
        ↓
Receive: { accessToken, refreshToken, expiresIn }
        ↓
Store in localStorage
        ↓
Schedule automatic refresh
```

### 2. Access Token Usage
Use the access token for all API requests:
```typescript
import { authenticatedFetch } from '@/lib/api-client';

// Automatic token refresh on 401
const result = await authenticatedFetch('/api/campaigns');
if (result.success) {
  console.log(result.data);
}
```

### 3. Refresh Token Flow
```
Access Token Expires
        ↓
(5 minutes before expiration)
        ↓
refreshAccessToken()
        ↓
POST /api/auth/refresh { refreshToken }
        ↓
Receive new accessToken
        ↓
Automatically retry original request
```

## Available Functions

### Authentication (`lib/auth.ts`)
```typescript
// Login with credentials
await login(username, password)
// Returns: { success, data?: { accessToken, refreshToken, expiresIn }, error? }

// Refresh access token
await refreshAccessToken()
// Returns: { success, data?: { accessToken, refreshToken, expiresIn }, error? }

// Get current access token
getAccessToken() // Returns: string | null

// Get refresh token
getRefreshToken() // Returns: string | null

// Check authentication status
isAuthenticated() // Returns: boolean

// Logout
logout() // Clears tokens and localStorage

// Get authorization headers
getAuthHeaders() // Returns: { Authorization: "Bearer <token>" }
```

### Context Provider (`lib/auth-context.tsx`)
```typescript
import { AuthProvider, useAuth } from '@/lib/auth-context';

function App() {
  return (
    <AuthProvider>
      <YourComponent />
    </AuthProvider>
  );
}

function YourComponent() {
  const { isAuthenticated, isLoading, error, login, logout } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  if (isAuthenticated) {
    return <button onClick={logout}>Logout</button>;
  }
  
  return (
    <button onClick={() => login('demo', 'password123')}>
      Login
    </button>
  );
}
```

### API Client (`lib/api-client.ts`)
```typescript
import { authenticatedFetch } from '@/lib/api-client';

// Automatic token refresh on 401
const response = await authenticatedFetch<{ campaigns: any[] }>(
  '/api/campaigns',
  { method: 'GET' }
);

if (response.success) {
  console.log(response.data);
} else {
  console.error(response.error);
}
```

## API Endpoints

### POST /api/auth/login
**Request:**
```json
{
  "username": "demo",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "token_...",
    "refreshToken": "token_...",
    "expiresIn": 3600
  }
}
```

### POST /api/auth/refresh
**Request:**
```json
{
  "refreshToken": "token_..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "token_...",
    "refreshToken": "token_...",
    "expiresIn": 3600
  }
}
```

## Demo Credentials
- **Username:** demo
- **Password:** password123

Or

- **Username:** admin
- **Password:** admin123

## Token Storage
Tokens are stored in `localStorage` with key: `authTokens`
```typescript
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiresIn": 3600
}
```

## Security Notes
1. **Access Token**: Valid for 1 hour, used in Bearer authentication header
2. **Refresh Token**: Valid for 7 days, should be stored securely (httpOnly in production)
3. **Automatic Refresh**: Refreshes 5 minutes before expiration (background process)
4. **On 401**: If request fails with 401, automatically refreshes token and retries
5. **On Refresh Failure**: User is logged out and redirected to login

## Implementation Example

```typescript
// 1. Initialize auth on app start
import { initializeAuth } from '@/lib/auth';

useEffect(() => {
  initializeAuth();
}, []);

// 2. Make authenticated API calls
async function fetchCampaigns() {
  const result = await authenticatedFetch('/api/campaigns');
  if (result.success) {
    setCampaigns(result.data);
  }
}

// 3. Handle logout
function handleLogout() {
  logout();
  // Redirect to login page
}
```

## Token Lifecycle
```
1. User logs in
   ├─ Access Token: 1 hour
   └─ Refresh Token: 7 days

2. After 55 minutes
   └─ Background refresh triggered
   ├─ New Access Token issued
   └─ Refresh Token unchanged

3. After 7 days
   └─ Refresh Token expires
   ├─ User must login again
   └─ All tokens cleared
```

## Error Handling
```typescript
const result = await login('user', 'pass');

if (result.success) {
  // Login successful
  // result.data contains { accessToken, refreshToken, expiresIn }
} else {
  // result.error contains error message
  console.error(result.error);
  // Possible errors:
  // - "Invalid credentials"
  // - "No refresh token available"
  // - "Token refresh failed"
  // - Network/server errors
}
```

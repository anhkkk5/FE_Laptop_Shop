# Migration to HTTP-only Cookie Authentication

## Overview

Successfully migrated both frontend applications (Client and Admin) from localStorage-based JWT authentication to HTTP-only cookie authentication for improved security against XSS attacks.

## Changes Made

### 1. Frontend Client (FeShopLaptop)

#### `src/lib/api.ts`

- ✅ Changed `withCredentials: false` → `withCredentials: true`
- ✅ Removed Authorization header injection from request interceptor
- ✅ Updated refresh token logic to use cookie-based endpoint
- ✅ Removed all localStorage token operations
- ✅ Updated API_URL default port from 3100 → 3001

#### `src/lib/auth-service.ts`

- ✅ Removed `AuthTokens` interface (no longer needed)
- ✅ Updated `register()` to return `User` instead of tokens
- ✅ Updated `login()` to return `User` instead of tokens
- ✅ Removed all `localStorage.setItem()` and `localStorage.getItem()` calls
- ✅ Simplified `logout()` - no longer needs to send refresh token in body
- ✅ Removed `isAuthenticated()` method (replaced with `checkAuth()`)
- ✅ Added `checkAuth()` method that calls `/auth/me` endpoint

#### `src/context/auth-context.tsx`

- ✅ Removed `isAuthenticated()` check from `refreshUser()`
- ✅ Removed localStorage cleanup from error handling
- ✅ Authentication now relies solely on cookie presence (checked via API)

### 2. Frontend Admin (fe-admin-laptop)

#### `src/lib/api.ts`

- ✅ Changed `withCredentials: false` → `withCredentials: true`
- ✅ Removed Authorization header injection from request interceptor
- ✅ Updated refresh token logic to use cookie-based endpoint
- ✅ Removed all localStorage token operations (admin_accessToken, admin_refreshToken)
- ✅ Updated API_URL default port from 3100 → 3001

#### `src/lib/auth-service.ts`

- ✅ Removed `AuthTokens` interface
- ✅ Updated `login()` to return `AdminUser` instead of tokens
- ✅ Removed all localStorage operations
- ✅ Simplified `logout()` - no longer needs to send refresh token in body
- ✅ Removed `isAuthenticated()` method
- ✅ Added `checkAuth()` method

#### `src/context/auth-context.tsx`

- ✅ Removed `isAuthenticated()` check from `refreshUser()`
- ✅ Removed localStorage cleanup from error handling
- ✅ Updated `login()` to use returned user data directly

### 3. Backend (BeShopLapTop)

#### `src/main.ts`

- ✅ Already configured with `credentials: true` in CORS
- ✅ Already includes `cookie-parser` middleware
- ✅ Updated default port from 3100 → 3001

#### Auth Controller & Services

- ✅ Already refactored to use HTTP-only cookies
- ✅ `setAuthCookies()` sets access_token and refresh_token cookies
- ✅ `clearAuthCookies()` clears cookies on logout
- ✅ All endpoints return user data instead of tokens in response body

## Security Improvements

### Before (localStorage)

- ❌ Tokens stored in localStorage (accessible to JavaScript)
- ❌ Vulnerable to XSS attacks
- ❌ Tokens could be stolen by malicious scripts
- ❌ Manual token management in every request

### After (HTTP-only Cookies)

- ✅ Tokens stored in HTTP-only cookies (not accessible to JavaScript)
- ✅ Protected against XSS attacks
- ✅ Tokens cannot be read by malicious scripts
- ✅ Automatic token management by browser
- ✅ `sameSite: 'strict'` prevents CSRF attacks
- ✅ `secure: true` in production (HTTPS only)

## Cookie Configuration

```typescript
// Access Token Cookie
{
  httpOnly: true,
  secure: true (production),
  sameSite: 'strict',
  maxAge: 900000, // 15 minutes
  path: '/'
}

// Refresh Token Cookie
{
  httpOnly: true,
  secure: true (production),
  sameSite: 'strict',
  maxAge: 604800000, // 7 days
  path: '/'
}
```

## Authentication Flow

### Login Flow

1. User submits credentials
2. Backend validates credentials
3. Backend generates JWT tokens
4. Backend sets HTTP-only cookies with tokens
5. Backend returns user data (no tokens in response body)
6. Frontend stores user data in state
7. Browser automatically includes cookies in subsequent requests

### Auto-Refresh Flow

1. API request receives 401 Unauthorized
2. Frontend calls `/auth/refresh` endpoint
3. Browser automatically sends refresh_token cookie
4. Backend validates refresh token from cookie
5. Backend generates new tokens
6. Backend sets new HTTP-only cookies
7. Frontend retries original request
8. Browser automatically includes new access_token cookie

### Logout Flow

1. User clicks logout
2. Frontend calls `/auth/logout` endpoint
3. Backend invalidates refresh token
4. Backend clears cookies (sets maxAge: 0)
5. Frontend clears user state
6. Browser removes cookies

## Testing Checklist

- [ ] Test login on client frontend (port 3002)
- [ ] Test login on admin frontend (port 3003)
- [ ] Verify cookies are set in browser DevTools (Application → Cookies)
- [ ] Verify cookies have `HttpOnly` and `Secure` flags
- [ ] Test protected routes require authentication
- [ ] Test auto-refresh when access token expires
- [ ] Test logout clears cookies
- [ ] Test Google OAuth login sets cookies correctly
- [ ] Verify tokens are NOT in response body
- [ ] Verify tokens are NOT in localStorage

## Port Configuration

- Backend: `http://localhost:3001`
- Frontend Client: `http://localhost:3002`
- Frontend Admin: `http://localhost:3003`

## Environment Variables

### Backend (.env)

```env
PORT=3001
FRONTEND_URL=http://localhost:3002
NODE_ENV=development
```

### Frontend Client (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Frontend Admin (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## Next Steps

1. Start backend: `cd BeShopLapTop && npm run start:dev`
2. Start client frontend: `cd FeShopLaptop && npm run dev`
3. Start admin frontend: `cd fe-admin-laptop && npm run dev`
4. Test complete authentication flow
5. Verify cookies in browser DevTools
6. Test auto-refresh functionality
7. Test logout functionality

## Notes

- All localStorage token operations have been removed
- Authentication state is now managed via API calls to `/auth/me`
- Cookies are automatically sent with every request (no manual header management)
- The backend already had cookie support - only frontend needed updates
- CORS is properly configured with `credentials: true`

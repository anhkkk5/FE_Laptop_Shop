# Backend Foundation - Tasks Document

> **Feature:** Backend Foundation Setup
> **Type:** Infrastructure
> **Estimated Effort:** 11 ngày
> **Status:** Not Started

---

## TASK BREAKDOWN

### Phase 1: Project Setup & Infrastructure (2 ngày)

#### Task 1: NestJS Project Initialization (0.5 ngày)

- [x] 1.1 Initialize NestJS project in BeShopLapTop directory
- [x] 1.2 Configure TypeScript with strict mode
- [x] 1.3 Setup ESLint + Prettier
- [x] 1.4 Create folder structure (modules, common, config, database)
- [x] 1.5 Setup .env.example with all required variables
- [x] 1.6 Configure hot reload for development

**Acceptance Criteria:**

- NestJS server starts on port 3001
- TypeScript compiles without errors
- ESLint and Prettier run successfully
- Folder structure matches design document

---

#### Task 2: Docker Compose Setup (0.5 ngày)

- [ ] 2.1 Create docker-compose.yml with MySQL 8 service
- [ ] 2.2 Add Redis 7 service to docker-compose
- [ ] 2.3 Configure MySQL with persistent volume
- [ ] 2.4 Configure Redis with persistent volume
- [ ] 2.5 Add environment variables for database connection
- [ ] 2.6 Test docker-compose up and verify services

**Acceptance Criteria:**

- `docker-compose up -d` starts MySQL and Redis
- MySQL accessible on port 3306
- Redis accessible on port 6379
- Data persists after container restart

---

#### Task 3: Database Configuration (0.5 ngày)

- [ ] 3.1 Install TypeORM and MySQL2 packages
- [ ] 3.2 Create database.config.ts with connection settings
- [ ] 3.3 Create data-source.ts for TypeORM CLI
- [ ] 3.4 Configure TypeORM module in app.module.ts
- [ ] 3.5 Setup connection pooling (min: 5, max: 20)
- [ ] 3.6 Test database connection

**Acceptance Criteria:**

- TypeORM connects to MySQL successfully
- Connection pooling is configured
- Database logs show successful connection

---

#### Task 4: Redis Configuration (0.5 ngày)

- [ ] 4.1 Install @nestjs-modules/ioredis and ioredis packages
- [ ] 4.2 Create redis.config.ts with connection settings
- [ ] 4.3 Configure Redis module in app.module.ts
- [ ] 4.4 Create RedisService wrapper for common operations
- [ ] 4.5 Test Redis connection and basic operations

**Acceptance Criteria:**

- Redis connects successfully
- Can set and get values from Redis
- RedisService is injectable in other modules

---

### Phase 2: Global Infrastructure (1 ngày)

#### Task 5: Global Exception Filter (0.25 ngày)

- [ ] 5.1 Create GlobalExceptionFilter in common/filters
- [ ] 5.2 Implement error response format (success, error, timestamp, path)
- [ ] 5.3 Handle HttpException, ValidationException, and unknown errors
- [ ] 5.4 Map exceptions to error codes (AUTH_001, VAL_001, etc.)
- [ ] 5.5 Register filter globally in main.ts
- [ ] 5.6 Test with intentional errors

**Acceptance Criteria:**

- All errors return consistent format
- Error codes are mapped correctly
- Stack traces hidden in production

---

#### Task 6: Validation Pipe (0.25 ngày)

- [ ] 6.1 Install class-validator and class-transformer
- [ ] 6.2 Configure ValidationPipe globally in main.ts
- [ ] 6.3 Enable whitelist, forbidNonWhitelisted, transform
- [ ] 6.4 Test with invalid DTOs
- [ ] 6.5 Verify validation errors return proper format

**Acceptance Criteria:**

- Invalid requests return 400 with field errors
- Unknown properties are stripped or rejected
- DTOs are auto-transformed to correct types

---

#### Task 7: Transform Interceptor (0.25 ngày)

- [ ] 7.1 Create TransformInterceptor in common/interceptors
- [ ] 7.2 Wrap all responses in {success: true, data, timestamp}
- [ ] 7.3 Register interceptor globally in main.ts
- [ ] 7.4 Test with various endpoints

**Acceptance Criteria:**

- All successful responses have consistent format
- Timestamp is included in ISO 8601 format

---

#### Task 8: Logging Interceptor (0.25 ngày)

- [ ] 8.1 Create LoggingInterceptor in common/interceptors
- [ ] 8.2 Log request method, URL, user, duration
- [ ] 8.3 Log response status code
- [ ] 8.4 Register interceptor globally in main.ts
- [ ] 8.5 Test and verify logs

**Acceptance Criteria:**

- All requests are logged with timing
- User info included if authenticated
- Logs are structured and readable

---

### Phase 3: User Module & Entities (1 ngày)

#### Task 9: User Entity & Enums (0.5 ngày)

- [ ] 9.1 Create UserRole enum (customer, staff, technician, warehouse, admin)
- [ ] 9.2 Create User entity with all fields (id, email, password, role, etc.)
- [ ] 9.3 Add TypeORM decorators (@Entity, @Column, @PrimaryGeneratedColumn)
- [ ] 9.4 Add indexes (email, google_id, role, deleted_at)
- [ ] 9.5 Add soft delete (@DeleteDateColumn)
- [ ] 9.6 Create initial migration for users table

**Acceptance Criteria:**

- User entity matches database schema in design doc
- Migration creates users table with all columns and indexes
- Soft delete works correctly

---

#### Task 10: Address Entity (0.25 ngày)

- [ ] 10.1 Create Address entity with all fields
- [ ] 10.2 Add relationship to User (@ManyToOne)
- [ ] 10.3 Add indexes (user_id, is_default)
- [ ] 10.4 Create migration for addresses table

**Acceptance Criteria:**

- Address entity matches database schema
- Foreign key to users table is created
- Cascade delete works (delete user → delete addresses)

---

#### Task 11: User Module Setup (0.25 ngày)

- [ ] 11.1 Generate User module, controller, service
- [ ] 11.2 Register User entity in TypeORM
- [ ] 11.3 Inject User repository in UserService
- [ ] 11.4 Export UserService for use in other modules
- [ ] 11.5 Create basic DTOs (CreateUserDto, UpdateUserDto, UserDto)

**Acceptance Criteria:**

- User module is properly configured
- UserService is injectable in other modules
- DTOs have validation decorators

---

### Phase 4: Authentication Core (2.5 ngày)

#### Task 12: JWT Configuration (0.5 ngày)

- [ ] 12.1 Install @nestjs/jwt and @nestjs/passport packages
- [ ] 12.2 Create jwt.config.ts with access/refresh token settings
- [ ] 12.3 Configure JwtModule in AuthModule
- [ ] 12.4 Create TokenService for token generation and verification
- [ ] 12.5 Implement generateAccessToken (15 min expiry)
- [ ] 12.6 Implement generateRefreshToken (7 days expiry)
- [ ] 12.7 Implement verifyToken methods

**Acceptance Criteria:**

- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- JWT payload includes userId, email, role
- Tokens can be verified successfully

---

#### Task 13: JWT Strategy & Auth Guard (0.5 ngày)

- [ ] 13.1 Create JwtStrategy to extract token from cookies
- [ ] 13.2 Validate token and return user payload
- [ ] 13.3 Create JwtAuthGuard using @nestjs/passport
- [ ] 13.4 Create @Public() decorator to skip auth
- [ ] 13.5 Create @CurrentUser() decorator to extract user from request
- [ ] 13.6 Register JwtAuthGuard globally with APP_GUARD

**Acceptance Criteria:**

- JwtStrategy extracts token from `access_token` cookie
- Protected routes require valid JWT
- @Public() decorator bypasses authentication
- @CurrentUser() returns user from JWT payload

---

#### Task 14: Cookie Utility (0.25 ngày)

- [x] 14.1 Create CookieService in common/utils
- [ ] 14.2 Implement setAuthCookies(res, accessToken, refreshToken)
- [ ] 14.3 Implement clearAuthCookies(res)
- [ ] 14.4 Configure cookie options (httpOnly, secure, sameSite, maxAge)
- [ ] 14.5 Handle development vs production cookie settings

**Acceptance Criteria:**

- Cookies have httpOnly: true
- Cookies have sameSite: 'strict'
- Cookies have secure: true in production
- Access token cookie expires in 15 minutes
- Refresh token cookie expires in 7 days

---

#### Task 15: Register Endpoint (0.5 ngày)

- [ ] 15.1 Create RegisterDto with validation
- [ ] 15.2 Implement AuthService.register()
- [ ] 15.3 Check if email already exists (throw ConflictException)
- [ ] 15.4 Hash password with bcrypt (salt rounds: 10)
- [ ] 15.5 Create user with role 'customer'
- [ ] 15.6 Generate email verification token
- [ ] 15.7 Store verification token in Redis (24h TTL)
- [ ] 15.8 Send verification email (integrate with MailService)
- [ ] 15.9 Create POST /api/auth/register endpoint
- [ ] 15.10 Return user without password

**Acceptance Criteria:**

- Email uniqueness is enforced
- Password is hashed (not stored in plain text)
- Verification email is sent
- Response returns user info without password
- Returns 201 Created on success
- Returns 409 Conflict if email exists

---

#### Task 16: Login Endpoint (0.5 ngày)

- [ ] 16.1 Create LoginDto with validation
- [ ] 16.2 Implement AuthService.login()
- [ ] 16.3 Find user by email (exclude soft-deleted)
- [ ] 16.4 Compare password with bcrypt
- [ ] 16.5 Generate access token and refresh token
- [ ] 16.6 Store refresh token in Redis with metadata
- [ ] 16.7 Update user.last_login_at
- [ ] 16.8 Create POST /api/auth/login endpoint
- [ ] 16.9 Set access_token and refresh_token cookies
- [ ] 16.10 Return user info (no tokens in body)

**Acceptance Criteria:**

- Invalid credentials return 401 Unauthorized
- Soft-deleted users cannot login
- Tokens are set in HTTP-only cookies
- last_login_at is updated
- Response contains only user info

---

#### Task 17: Logout Endpoint (0.25 ngày)

- [ ] 17.1 Create POST /api/auth/logout endpoint
- [ ] 17.2 Extract refresh token from cookie
- [ ] 17.3 Delete refresh token from Redis
- [ ] 17.4 Clear access_token and refresh_token cookies
- [ ] 17.5 Return success message

**Acceptance Criteria:**

- Refresh token is removed from Redis
- Cookies are cleared (Max-Age=0)
- Returns 200 OK
- Requires authentication

---

#### Task 18: Refresh Token Endpoint (0.5 ngày)

- [ ] 18.1 Create POST /api/auth/refresh endpoint
- [ ] 18.2 Extract refresh token from cookie
- [ ] 18.3 Verify refresh token JWT
- [ ] 18.4 Check token exists in Redis
- [ ] 18.5 Generate new access token
- [ ] 18.6 Generate new refresh token (rotation)
- [ ] 18.7 Delete old refresh token from Redis
- [ ] 18.8 Store new refresh token in Redis
- [ ] 18.9 Update cookies with new tokens
- [ ] 18.10 Return success message

**Acceptance Criteria:**

- Old refresh token is invalidated
- New tokens are generated
- Cookies are updated
- Invalid/expired tokens return 401 and clear cookies
- Token rotation prevents reuse attacks

---

#### Task 19: Get Current User Endpoint (0.25 ngày)

- [ ] 19.1 Create GET /api/auth/me endpoint
- [ ] 19.2 Use @CurrentUser() decorator to get user from JWT
- [ ] 19.3 Fetch full user details from database
- [ ] 19.4 Return user info (exclude password)

**Acceptance Criteria:**

- Requires authentication
- Returns current user info
- Password is excluded from response

---

### Phase 5: Google OAuth (1 ngày)

#### Task 20: Google OAuth Strategy (0.5 ngày)

- [ ] 20.1 Install passport-google-oauth20
- [ ] 20.2 Create GoogleStrategy in auth/strategies
- [ ] 20.3 Configure with Google Client ID and Secret
- [ ] 20.4 Implement validate() to return user profile
- [ ] 20.5 Register GoogleStrategy in AuthModule

**Acceptance Criteria:**

- Google OAuth credentials are configured
- Strategy validates Google tokens
- User profile is extracted correctly

---

#### Task 21: Google OAuth Endpoints (0.5 ngày)

- [ ] 21.1 Create GET /api/auth/google endpoint (redirect to Google)
- [ ] 21.2 Create GET /api/auth/google/callback endpoint
- [ ] 21.3 Implement AuthService.googleLogin()
- [ ] 21.4 Check if user exists by email
- [ ] 21.5 If exists, update google_id
- [ ] 21.6 If not exists, create new user (is_verified: true, no password)
- [ ] 21.7 Generate access and refresh tokens
- [ ] 21.8 Set cookies
- [ ] 21.9 Redirect to frontend with success message

**Acceptance Criteria:**

- Google OAuth flow works end-to-end
- Existing users can link Google account
- New users are created with verified status
- Tokens are set in cookies
- Redirects to frontend after success

---

### Phase 6: Email Verification (1 ngày)

#### Task 22: Mail Module Setup (0.5 ngày)

- [ ] 22.1 Install nodemailer and @types/nodemailer
- [ ] 22.2 Create mail.config.ts with Brevo SMTP settings
- [ ] 22.3 Create MailModule and MailService
- [ ] 22.4 Implement sendEmail() method using Brevo API
- [ ] 22.5 Create email templates (verification, password-reset, welcome)
- [ ] 22.6 Test email sending with Brevo

**Acceptance Criteria:**

- MailService can send emails via Brevo
- Email templates are properly formatted
- Emails are sent successfully

---

#### Task 23: Email Verification Endpoints (0.5 ngày)

- [ ] 23.1 Create POST /api/auth/verify-email endpoint
- [ ] 23.2 Extract token from request body
- [ ] 23.3 Verify JWT token
- [ ] 23.4 Check token exists in Redis
- [ ] 23.5 Update user.is_verified = true
- [ ] 23.6 Delete token from Redis
- [ ] 23.7 Create POST /api/auth/resend-verification endpoint
- [ ] 23.8 Implement rate limiting (1 email / 5 minutes)
- [ ] 23.9 Generate new verification token
- [ ] 23.10 Send verification email

**Acceptance Criteria:**

- Verification token works correctly
- Token can only be used once
- is_verified is updated in database
- Resend endpoint has rate limiting
- Invalid tokens return 400 Bad Request

---

### Phase 7: Password Reset (1 ngày)

#### Task 24: Forgot Password Endpoint (0.5 ngày)

- [ ] 24.1 Create POST /api/auth/forgot-password endpoint
- [ ] 24.2 Create ForgotPasswordDto with email validation
- [ ] 24.3 Find user by email
- [ ] 24.4 Generate password reset token (JWT, 1h expiry)
- [ ] 24.5 Store token in Redis (1h TTL)
- [ ] 24.6 Send password reset email with token
- [ ] 24.7 Return success message (don't reveal if user exists)

**Acceptance Criteria:**

- Reset token expires after 1 hour
- Email is sent with reset link
- Response doesn't reveal if email exists (security)
- Returns 200 OK always

---

#### Task 25: Reset Password Endpoint (0.5 ngày)

- [ ] 25.1 Create POST /api/auth/reset-password endpoint
- [ ] 25.2 Create ResetPasswordDto (token, newPassword)
- [ ] 25.3 Verify reset token JWT
- [ ] 25.4 Check token exists in Redis
- [ ] 25.5 Hash new password
- [ ] 25.6 Update user password
- [ ] 25.7 Delete reset token from Redis
- [ ] 25.8 Revoke all refresh tokens (force re-login)
- [ ] 25.9 Send password changed confirmation email
- [ ] 25.10 Return success message

**Acceptance Criteria:**

- Token is validated correctly
- Password is updated and hashed
- All refresh tokens are revoked
- Confirmation email is sent
- Invalid/expired tokens return 400

---

### Phase 8: RBAC & Authorization (0.5 ngày)

#### Task 26: Role Guard & Decorators (0.5 ngày)

- [ ] 26.1 Create RolesGuard in common/guards
- [ ] 26.2 Create @Roles() decorator
- [ ] 26.3 Implement role checking logic
- [ ] 26.4 Register RolesGuard globally
- [ ] 26.5 Test with different roles
- [ ] 26.6 Create role-specific endpoints (admin only, staff only)

**Acceptance Criteria:**

- @Roles() decorator restricts access by role
- Unauthorized access returns 403 Forbidden
- Multiple roles can be specified
- Works with JwtAuthGuard

---

### Phase 9: User Management (1 ngày)

#### Task 27: User CRUD Endpoints (Admin) (0.5 ngày)

- [ ] 27.1 Create GET /api/users endpoint (Admin only)
- [ ] 27.2 Implement pagination (page, limit)
- [ ] 27.3 Implement filters (role, is_verified)
- [ ] 27.4 Implement search (email, full_name)
- [ ] 27.5 Implement sorting (created_at, last_login_at)
- [ ] 27.6 Create PATCH /api/users/:id endpoint (Admin only)
- [ ] 27.7 Implement role update (prevent self-role change)
- [ ] 27.8 Create DELETE /api/users/:id endpoint (Admin only)
- [ ] 27.9 Implement soft delete
- [ ] 27.10 Revoke all refresh tokens on deactivation

**Acceptance Criteria:**

- Only admins can access these endpoints
- Pagination works correctly
- Filters and search work
- Admin cannot change own role
- Soft delete works (deleted_at is set)

---

#### Task 28: Profile Management (0.25 ngày)

- [ ] 28.1 Create GET /api/users/profile endpoint
- [ ] 28.2 Create PATCH /api/users/profile endpoint
- [ ] 28.3 Allow updating: full_name, phone, avatar
- [ ] 28.4 Prevent updating: email, role, password
- [ ] 28.5 Create PATCH /api/users/change-password endpoint
- [ ] 28.6 Validate current password
- [ ] 28.7 Hash and update new password
- [ ] 28.8 Revoke all refresh tokens (force re-login)

**Acceptance Criteria:**

- Users can view and update own profile
- Cannot update restricted fields
- Password change requires current password
- All sessions are invalidated after password change

---

#### Task 29: Address Management (0.25 ngày)

- [ ] 29.1 Create GET /api/users/addresses endpoint
- [ ] 29.2 Create POST /api/users/addresses endpoint
- [ ] 29.3 Auto-set is_default=true for first address
- [ ] 29.4 Create PATCH /api/users/addresses/:id endpoint
- [ ] 29.5 When setting is_default=true, set others to false
- [ ] 29.6 Create DELETE /api/users/addresses/:id endpoint
- [ ] 29.7 Prevent deleting default address (must set another as default first)
- [ ] 29.8 Ensure users can only manage own addresses

**Acceptance Criteria:**

- Users can CRUD own addresses
- First address is automatically default
- Only one address can be default
- Cannot delete default address without setting another

---

### Phase 10: Security & Middleware (0.5 ngày)

#### Task 30: Security Headers & CORS (0.25 ngày)

- [ ] 30.1 Install helmet package
- [ ] 30.2 Configure Helmet in main.ts
- [ ] 30.3 Configure CORS with credentials: true
- [ ] 30.4 Whitelist frontend URLs (localhost:3002, localhost:3003)
- [ ] 30.5 Test CORS with frontend

**Acceptance Criteria:**

- Security headers are set (X-Frame-Options, etc.)
- CORS allows frontend origins
- Credentials (cookies) are sent with requests

---

#### Task 31: Rate Limiting (0.25 ngày)

- [ ] 31.1 Install @nestjs/throttler
- [ ] 31.2 Configure ThrottlerModule (100 requests / 15 min)
- [ ] 31.3 Apply rate limiting globally
- [ ] 31.4 Add stricter limits on sensitive endpoints (login, register)
- [ ] 31.5 Test rate limiting

**Acceptance Criteria:**

- Rate limiting works globally
- Sensitive endpoints have stricter limits
- Returns 429 Too Many Requests when exceeded

---

### Phase 11: Documentation & Testing (1 ngày)

#### Task 32: Swagger Documentation (0.5 ngày)

- [ ] 32.1 Install @nestjs/swagger
- [ ] 32.2 Configure Swagger in main.ts
- [ ] 32.3 Add @ApiTags() to controllers
- [ ] 32.4 Add @ApiOperation() to endpoints
- [ ] 32.5 Add @ApiResponse() decorators
- [ ] 32.6 Document DTOs with @ApiProperty()
- [ ] 32.7 Add authentication to Swagger (cookie-based)
- [ ] 32.8 Test Swagger UI at /api/docs

**Acceptance Criteria:**

- Swagger UI is accessible at /api/docs
- All endpoints are documented
- Request/response schemas are shown
- Can test endpoints from Swagger UI

---

#### Task 33: Unit Tests (0.5 ngày)

- [ ] 33.1 Write unit tests for AuthService
- [ ] 33.2 Write unit tests for UserService
- [ ] 33.3 Write unit tests for TokenService
- [ ] 33.4 Mock dependencies (database, Redis, mail)
- [ ] 33.5 Test edge cases and error scenarios
- [ ] 33.6 Achieve > 80% coverage for services

**Acceptance Criteria:**

- All services have unit tests
- Tests pass successfully
- Coverage > 80% for services

---

### Phase 12: Integration & E2E Testing (1 ngày)

#### Task 34: Integration Tests (0.5 ngày)

- [ ] 34.1 Setup test database (Testcontainers or in-memory)
- [ ] 34.2 Write integration tests for auth endpoints
- [ ] 34.3 Test cookie setting and extraction
- [ ] 34.4 Test database operations
- [ ] 34.5 Test Redis operations
- [ ] 34.6 Clean up test data after each test

**Acceptance Criteria:**

- Integration tests cover all auth endpoints
- Tests use real database and Redis
- Tests are isolated and repeatable

---

#### Task 35: E2E Tests (0.5 ngày)

- [ ] 35.1 Write E2E test for registration flow
- [ ] 35.2 Write E2E test for login → access protected route → logout
- [ ] 35.3 Write E2E test for refresh token flow
- [ ] 35.4 Write E2E test for password reset flow
- [ ] 35.5 Write E2E test for Google OAuth flow (mock)

**Acceptance Criteria:**

- E2E tests cover complete user journeys
- Tests pass successfully
- Tests are automated and repeatable

---

### Phase 13: Frontend Integration (1 ngày)

#### Task 36: Update Frontend Auth Service (0.5 ngày)

- [ ] 36.1 Update FeShopLaptop/src/lib/auth-service.ts
- [ ] 36.2 Remove localStorage token management
- [ ] 36.3 Update API calls to use credentials: 'include'
- [ ] 36.4 Handle 401 errors (redirect to login)
- [ ] 36.5 Implement auto-refresh on 401
- [ ] 36.6 Update auth context to check /api/auth/me on mount
- [ ] 36.7 Test login, logout, refresh flows

**Acceptance Criteria:**

- Frontend uses cookies for authentication
- No tokens in localStorage
- Auto-refresh works on token expiry
- Protected routes redirect to login if not authenticated

---

#### Task 37: Update Admin Frontend Auth Service (0.5 ngày)

- [ ] 37.1 Update fe-admin-laptop/src/lib/auth-service.ts
- [ ] 37.2 Same changes as Task 36 for admin frontend
- [ ] 37.3 Test admin login and role-based access

**Acceptance Criteria:**

- Admin frontend uses cookies
- Role-based access works
- Admin can access admin-only endpoints

---

## TASK DEPENDENCIES

```
Task 1 (NestJS Init)
  ↓
Task 2 (Docker Compose)
  ↓
Task 3 (Database Config) + Task 4 (Redis Config)
  ↓
Task 5-8 (Global Infrastructure)
  ↓
Task 9-11 (User Module & Entities)
  ↓
Task 12-13 (JWT Config & Strategy)
  ↓
Task 14 (Cookie Utility)
  ↓
Task 15-19 (Auth Endpoints)
  ↓
Task 20-21 (Google OAuth)
  ↓
Task 22-23 (Email Verification)
  ↓
Task 24-25 (Password Reset)
  ↓
Task 26 (RBAC)
  ↓
Task 27-29 (User Management)
  ↓
Task 30-31 (Security)
  ↓
Task 32 (Swagger)
  ↓
Task 33-35 (Testing)
  ↓
Task 36-37 (Frontend Integration)
```

---

## TESTING CHECKLIST

### Unit Tests

- [ ] AuthService tests (register, login, logout, refresh)
- [ ] UserService tests (CRUD, profile, addresses)
- [ ] TokenService tests (generate, verify)
- [ ] MailService tests (send email)

### Integration Tests

- [ ] POST /api/auth/register
- [ ] POST /api/auth/login (cookie setting)
- [ ] POST /api/auth/logout (cookie clearing)
- [ ] POST /api/auth/refresh (token rotation)
- [ ] GET /api/auth/me
- [ ] POST /api/auth/verify-email
- [ ] POST /api/auth/forgot-password
- [ ] POST /api/auth/reset-password
- [ ] GET /api/users (admin only)
- [ ] PATCH /api/users/:id (admin only)
- [ ] GET /api/users/profile
- [ ] PATCH /api/users/profile
- [ ] PATCH /api/users/change-password
- [ ] Address CRUD endpoints

### E2E Tests

- [ ] Complete registration → verification → login flow
- [ ] Login → access protected route → logout flow
- [ ] Refresh token rotation flow
- [ ] Password reset flow
- [ ] Google OAuth flow (mocked)
- [ ] Role-based access control

### Manual Tests

- [ ] Test with Postman/Insomnia
- [ ] Test cookie behavior in browser
- [ ] Test CORS with frontend
- [ ] Test rate limiting
- [ ] Test Swagger UI

---

## DEFINITION OF DONE

A task is considered DONE when:

1. **Code Complete:**
   - Implementation matches design document
   - Code follows NestJS best practices
   - TypeScript types are properly defined
   - No ESLint errors

2. **Tested:**
   - Unit tests written and passing
   - Integration tests written and passing
   - Manual testing completed
   - Edge cases covered

3. **Documented:**
   - Swagger documentation added
   - Code comments for complex logic
   - README updated if needed

4. **Reviewed:**
   - Code is clean and readable
   - No security vulnerabilities
   - Performance is acceptable

5. **Integrated:**
   - Works with other modules
   - Database migrations run successfully
   - Frontend can consume the API

---

## RISK MITIGATION

| Risk                         | Mitigation                                           |
| ---------------------------- | ---------------------------------------------------- |
| Brevo API rate limit         | Implement email queue, add retry logic               |
| Redis connection failure     | Add graceful degradation, log errors                 |
| Cookie not sent by browser   | Ensure CORS credentials: true, test thoroughly       |
| Token expiry during request  | Implement auto-refresh on frontend                   |
| Database migration conflicts | Test migrations before applying, use version control |

---

**Document Version:** 1.0
**Last Updated:** May 2, 2026
**Status:** Ready for Implementation

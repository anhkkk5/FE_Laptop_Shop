# Backend Foundation - Requirements Document

> **Feature:** Backend Foundation Setup
> **Type:** Infrastructure
> **Priority:** P0 (Critical)
> **Estimated Effort:** 11 ngày
> **Status:** Not Started

---

## 1. OVERVIEW

### 1.1 Business Context

Hiện tại dự án chỉ có Frontend (Client + Admin) mà chưa có Backend. Để hệ thống hoạt động end-to-end, cần xây dựng Backend với NestJS theo kiến trúc Modular Monolith + Layered Architecture.

### 1.2 Goals

- ✅ Setup NestJS project với cấu trúc production-ready
- ✅ Setup database (MySQL + TypeORM) với migrations
- ✅ Setup Redis cho caching và token management
- ✅ Implement Auth system hoàn chỉnh (JWT + Refresh Token + OAuth)
- ✅ Implement User management với RBAC
- ✅ Setup global infrastructure (logging, validation, error handling, Swagger)

### 1.3 Success Criteria

- [ ] Backend server chạy được trên port 3001
- [ ] Database migrations chạy thành công
- [ ] User có thể register/login/logout
- [ ] JWT authentication hoạt động
- [ ] Refresh token hoạt động
- [ ] Google OAuth hoạt động
- [ ] Email verification hoạt động
- [ ] RBAC phân quyền 5 roles hoạt động
- [ ] Swagger documentation có thể truy cập
- [ ] Frontend có thể connect và call APIs

---

## 2. USER STORIES

### 2.1 As a Developer

#### US-1: Project Setup

**Story:** Là developer, tôi muốn có một NestJS project với cấu trúc rõ ràng để dễ dàng phát triển và maintain.

**Acceptance Criteria:**

- [ ] NestJS project được init với TypeScript
- [ ] Folder structure theo Modular Monolith pattern
- [ ] Environment variables được quản lý bằng @nestjs/config
- [ ] Docker Compose setup MySQL + Redis
- [ ] TypeORM được config với MySQL
- [ ] Hot reload hoạt động khi dev
- [ ] ESLint + Prettier được setup

#### US-2: Database Setup

**Story:** Là developer, tôi muốn có database schema và migrations để quản lý data structure.

**Acceptance Criteria:**

- [ ] TypeORM DataSource được config
- [ ] Migration system hoạt động
- [ ] Seed data script hoạt động
- [ ] Database entities được tạo cho: User, Address, RefreshToken
- [ ] Foreign keys và indexes được setup đúng
- [ ] Database connection pooling được config

#### US-3: Global Infrastructure

**Story:** Là developer, tôi muốn có các global utilities để xử lý errors, validation, logging.

**Acceptance Criteria:**

- [ ] Global Exception Filter xử lý tất cả errors
- [ ] Validation Pipe validate tất cả DTOs
- [ ] Transform Interceptor format response
- [ ] Logging Interceptor log requests/responses
- [ ] Swagger documentation tự động generate
- [ ] CORS được config cho Frontend URLs

---

### 2.2 As a User (Customer/Staff/Admin)

#### US-4: User Registration

**Story:** Là user, tôi muốn đăng ký tài khoản bằng email/password để sử dụng hệ thống.

**Acceptance Criteria:**

- [ ] POST /api/auth/register endpoint hoạt động
- [ ] Email phải unique
- [ ] Password được hash bằng bcrypt
- [ ] Validation: email format, password min 8 chars
- [ ] Gửi email verification sau khi đăng ký
- [ ] User được tạo với role mặc định là 'customer'
- [ ] Response trả về user info (không có password)

#### US-5: User Login

**Story:** Là user, tôi muốn đăng nhập bằng email/password để truy cập hệ thống.

**Acceptance Criteria:**

- [ ] POST /api/auth/login endpoint hoạt động
- [ ] Validate email và password
- [ ] Tạo access token (JWT, expires 15 phút)
- [ ] Tạo refresh token (expires 7 ngày)
- [ ] **Lưu access token vào HTTP-only cookie** với name `access_token`
- [ ] **Lưu refresh token vào HTTP-only cookie** với name `refresh_token`
- [ ] Refresh token được lưu vào Redis với key: `refresh_token:{userId}:{tokenId}`
- [ ] Response chỉ trả về user info (không trả tokens trong body)
- [ ] Sai email/password trả về 401 Unauthorized

#### US-6: User Logout

**Story:** Là user, tôi muốn đăng xuất để revoke access token.

**Acceptance Criteria:**

- [ ] POST /api/auth/logout endpoint hoạt động
- [ ] Require authentication (đọc token từ cookie)
- [ ] Xóa refresh token khỏi Redis
- [ ] **Clear access_token cookie** (set maxAge = 0)
- [ ] **Clear refresh_token cookie** (set maxAge = 0)
- [ ] Response 200 OK

#### US-7: Refresh Access Token

**Story:** Là user, tôi muốn refresh access token khi hết hạn mà không cần login lại.

**Acceptance Criteria:**

- [ ] POST /api/auth/refresh endpoint hoạt động
- [ ] **Đọc refresh token từ cookie** (không cần gửi trong body)
- [ ] Validate refresh token với Redis
- [ ] Tạo access token mới
- [ ] Tạo refresh token mới (rotate)
- [ ] **Update access_token cookie** với token mới
- [ ] **Update refresh_token cookie** với token mới
- [ ] Xóa refresh token cũ khỏi Redis
- [ ] Refresh token không hợp lệ trả về 401 và clear cookies

#### US-8: Get Current User

**Story:** Là user, tôi muốn lấy thông tin profile của mình.

**Acceptance Criteria:**

- [ ] GET /api/auth/me endpoint hoạt động
- [ ] Require authentication (đọc token từ cookie)
- [ ] Trả về user info từ JWT payload
- [ ] Response bao gồm: id, email, role, full_name, avatar, is_verified

---

### 2.3 As a User (Google OAuth)

#### US-9: Login with Google

**Story:** Là user, tôi muốn đăng nhập bằng Google account để không phải tạo password.

**Acceptance Criteria:**

- [ ] GET /api/auth/google redirect đến Google OAuth
- [ ] GET /api/auth/google/callback xử lý callback
- [ ] Nếu email đã tồn tại, link Google account
- [ ] Nếu email chưa tồn tại, tạo user mới
- [ ] Tạo access token và refresh token
- [ ] **Lưu tokens vào HTTP-only cookies**
- [ ] User được đánh dấu is_verified = true
- [ ] Redirect về Frontend với success message (tokens đã trong cookies)

---

### 2.4 As a User (Email Verification)

#### US-10: Verify Email

**Story:** Là user, tôi muốn verify email để kích hoạt tài khoản.

**Acceptance Criteria:**

- [ ] POST /api/auth/verify-email endpoint hoạt động
- [ ] Nhận verification token từ email
- [ ] Validate token (JWT với expiration 24h)
- [ ] Update user.is_verified = true
- [ ] Token chỉ dùng được 1 lần
- [ ] Response 200 OK hoặc 400 Bad Request

#### US-11: Resend Verification Email

**Story:** Là user, tôi muốn gửi lại email verification nếu không nhận được.

**Acceptance Criteria:**

- [ ] POST /api/auth/resend-verification endpoint hoạt động
- [ ] Nhận email từ request body
- [ ] Kiểm tra user tồn tại và chưa verify
- [ ] Gửi email verification mới
- [ ] Rate limit: 1 email / 5 phút

---

### 2.5 As a User (Password Reset)

#### US-12: Forgot Password

**Story:** Là user, tôi muốn reset password nếu quên.

**Acceptance Criteria:**

- [ ] POST /api/auth/forgot-password endpoint hoạt động
- [ ] Nhận email từ request body
- [ ] Kiểm tra user tồn tại
- [ ] Gửi email với reset token (JWT, expires 1h)
- [ ] Response 200 OK (không tiết lộ user có tồn tại hay không)

#### US-13: Reset Password

**Story:** Là user, tôi muốn đặt password mới bằng reset token.

**Acceptance Criteria:**

- [ ] POST /api/auth/reset-password endpoint hoạt động
- [ ] Nhận reset token và new password
- [ ] Validate token
- [ ] Hash password mới
- [ ] Update user password
- [ ] Revoke tất cả refresh tokens của user
- [ ] Response 200 OK

---

### 2.6 As an Admin

#### US-14: Manage Users

**Story:** Là admin, tôi muốn xem danh sách users và quản lý.

**Acceptance Criteria:**

- [ ] GET /api/users endpoint hoạt động (Admin only)
- [ ] Pagination: page, limit
- [ ] Filter: role, is_verified
- [ ] Search: email, full_name
- [ ] Sort: created_at, last_login_at
- [ ] Response bao gồm: users[], total, page, limit

#### US-15: Update User Role

**Story:** Là admin, tôi muốn thay đổi role của user.

**Acceptance Criteria:**

- [ ] PATCH /api/users/:id endpoint hoạt động (Admin only)
- [ ] Validate role: customer, staff, technician, warehouse, admin
- [ ] Không thể tự thay đổi role của chính mình
- [ ] Response trả về user đã update

#### US-16: Deactivate User

**Story:** Là admin, tôi muốn deactivate user (soft delete).

**Acceptance Criteria:**

- [ ] DELETE /api/users/:id endpoint hoạt động (Admin only)
- [ ] Soft delete: set deleted_at timestamp
- [ ] Revoke tất cả refresh tokens
- [ ] User không thể login sau khi bị deactivate
- [ ] Response 200 OK

---

### 2.7 As a User (Profile Management)

#### US-17: Update Profile

**Story:** Là user, tôi muốn cập nhật thông tin cá nhân.

**Acceptance Criteria:**

- [ ] PATCH /api/users/profile endpoint hoạt động
- [ ] Require authentication
- [ ] Có thể update: full_name, phone, avatar
- [ ] Không thể update: email, role, password
- [ ] Validation: phone format
- [ ] Response trả về user đã update

#### US-18: Change Password

**Story:** Là user, tôi muốn đổi password.

**Acceptance Criteria:**

- [ ] PATCH /api/users/change-password endpoint hoạt động
- [ ] Require authentication
- [ ] Nhận: current_password, new_password
- [ ] Validate current_password
- [ ] Hash new_password
- [ ] Revoke tất cả refresh tokens (force re-login)
- [ ] Response 200 OK

---

### 2.8 As a User (Address Management)

#### US-19: Add Address

**Story:** Là user, tôi muốn thêm địa chỉ giao hàng.

**Acceptance Criteria:**

- [ ] POST /api/users/addresses endpoint hoạt động
- [ ] Require authentication
- [ ] Validate: full_name, phone, province, district, ward, street
- [ ] Nếu là địa chỉ đầu tiên, set is_default = true
- [ ] Response trả về address đã tạo

#### US-20: Get Addresses

**Story:** Là user, tôi muốn xem danh sách địa chỉ của mình.

**Acceptance Criteria:**

- [ ] GET /api/users/addresses endpoint hoạt động
- [ ] Require authentication
- [ ] Trả về danh sách addresses của user
- [ ] Sort: is_default DESC, created_at DESC

#### US-21: Update Address

**Story:** Là user, tôi muốn cập nhật địa chỉ.

**Acceptance Criteria:**

- [ ] PATCH /api/users/addresses/:id endpoint hoạt động
- [ ] Require authentication
- [ ] Chỉ update được address của chính mình
- [ ] Có thể update: full_name, phone, province, district, ward, street, is_default
- [ ] Nếu set is_default = true, set các address khác = false
- [ ] Response trả về address đã update

#### US-22: Delete Address

**Story:** Là user, tôi muốn xóa địa chỉ.

**Acceptance Criteria:**

- [ ] DELETE /api/users/addresses/:id endpoint hoạt động
- [ ] Require authentication
- [ ] Chỉ xóa được address của chính mình
- [ ] Không thể xóa address đang là default (phải set default cho address khác trước)
- [ ] Response 200 OK

---

## 3. FUNCTIONAL REQUIREMENTS

### 3.1 Authentication & Authorization

#### FR-1: JWT Authentication

- Access token expires sau 15 phút
- Refresh token expires sau 7 ngày
- JWT payload bao gồm: userId, email, role
- JWT secret phải được lưu trong environment variables
- **Access token và Refresh token được lưu trong HTTP-only cookies** (không dùng localStorage để tránh XSS)
- Cookie settings:
  - `httpOnly: true` - Không thể truy cập từ JavaScript
  - `secure: true` - Chỉ gửi qua HTTPS (production)
  - `sameSite: 'strict'` - Chống CSRF attacks
  - `path: '/'` - Available cho tất cả routes
- Access token cookie name: `access_token`
- Refresh token cookie name: `refresh_token`

#### FR-2: Refresh Token Management

- Refresh token được lưu trong Redis với key: `refresh_token:{userId}:{tokenId}`
- Mỗi user có thể có nhiều refresh tokens (multi-device)
- Refresh token rotation: mỗi lần refresh tạo token mới và xóa token cũ
- Logout xóa refresh token khỏi Redis

#### FR-3: Password Security

- Password phải hash bằng bcrypt với salt rounds = 10
- Password minimum 8 characters
- Password không được trả về trong response
- Password reset token expires sau 1 giờ

#### FR-4: Email Verification

- Verification token là JWT với expiration 24h
- Email verification template sử dụng Brevo
- Verification link: `{FRONTEND_URL}/verify-email?token={token}`
- Token chỉ dùng được 1 lần

#### FR-5: Google OAuth

- Sử dụng Passport Google Strategy
- Callback URL: `{BACKEND_URL}/api/auth/google/callback`
- Nếu email đã tồn tại, link Google account (lưu google_id)
- Nếu email chưa tồn tại, tạo user mới với is_verified = true

#### FR-6: Role-Based Access Control (RBAC)

- 5 roles: customer, staff, technician, warehouse, admin
- Role guard kiểm tra role từ JWT payload
- Decorator `@Roles('admin', 'staff')` để protect endpoints
- Admin có full access
- Staff có access đến orders, customers
- Technician có access đến warranty tickets
- Warehouse có access đến inventory
- Customer chỉ có access đến own data

---

### 3.2 User Management

#### FR-7: User Entity

```typescript
{
  id: number;
  email: string; // unique
  password: string; // hashed, nullable (Google OAuth)
  role: "customer" | "staff" | "technician" | "warehouse" | "admin";
  full_name: string;
  phone: string | null;
  avatar: string | null;
  is_verified: boolean; // default false
  google_id: string | null; // unique
  last_login_at: Date | null;
  deleted_at: Date | null; // soft delete
  created_at: Date;
  updated_at: Date;
}
```

#### FR-8: Address Entity

```typescript
{
  id: number;
  user_id: number; // FK → users.id
  full_name: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  is_default: boolean; // default false
  created_at: Date;
}
```

#### FR-9: User Validation

- Email: valid email format, max 255 chars
- Password: min 8 chars, max 100 chars
- Full name: min 2 chars, max 100 chars
- Phone: valid Vietnamese phone format (10-11 digits)

---

### 3.3 API Response Format

#### FR-10: Success Response

```typescript
{
  success: true;
  data: any;
  message?: string;
}
```

#### FR-11: Error Response

```typescript
{
  success: false;
  error: {
    code: string; // e.g., 'AUTH_001', 'VALIDATION_ERROR'
    message: string;
    details?: any;
  };
  timestamp: string;
  path: string;
}
```

#### FR-12: Pagination Response

```typescript
{
  success: true;
  data: {
    items: any[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}
```

---

## 4. NON-FUNCTIONAL REQUIREMENTS

### 4.1 Performance

- API response time < 200ms (95th percentile)
- Database query optimization với indexes
- Redis caching cho frequently accessed data
- Connection pooling: min 5, max 20 connections

### 4.2 Security

- HTTPS only in production
- CORS restricted to Frontend URLs với credentials enabled
- **HTTP-only cookies để lưu tokens** (tránh XSS attacks)
- **SameSite cookies** để chống CSRF attacks
- Rate limiting: 100 requests/15 minutes per IP
- Helmet security headers
- Input sanitization để prevent XSS
- Parameterized queries để prevent SQL injection
- Cookie security settings:
  - `httpOnly: true` - JavaScript không thể đọc
  - `secure: true` - Chỉ gửi qua HTTPS (production)
  - `sameSite: 'strict'` - Chống CSRF
  - `domain` - Set theo environment (localhost hoặc production domain)

### 4.3 Scalability

- Stateless authentication (JWT)
- Horizontal scaling ready (no session storage)
- Database connection pooling
- Redis for distributed caching

### 4.4 Reliability

- Global exception handling
- Structured logging với Winston
- Health check endpoint: GET /health
- Database transaction rollback on errors

### 4.5 Maintainability

- Modular architecture
- Layered architecture per module
- TypeScript strict mode
- ESLint + Prettier
- Swagger API documentation
- Unit tests coverage > 80%

---

## 5. CONSTRAINTS & ASSUMPTIONS

### 5.1 Technical Constraints

- Node.js version: 20+
- NestJS version: 10+
- MySQL version: 8+
- Redis version: 7+
- TypeScript strict mode enabled

### 5.2 Business Constraints

- Email verification không bắt buộc để login (có thể login ngay)
- Google OAuth chỉ support Google accounts
- Password reset token expires sau 1 giờ
- Refresh token expires sau 7 ngày

### 5.3 Assumptions

- Frontend đã có auth pages và auth service
- Brevo API key sẽ được cung cấp
- Google OAuth credentials sẽ được cung cấp
- MySQL và Redis chạy trên Docker

---

## 6. DEPENDENCIES

### 6.1 External Dependencies

- **Brevo (Sendinblue):** Email service
- **Google OAuth:** Authentication provider
- **MySQL:** Database
- **Redis:** Caching and token storage

### 6.2 Internal Dependencies

- Frontend Client (FeShopLaptop) cần connect đến Backend APIs
- Frontend Admin (fe-admin-laptop) cần connect đến Backend APIs

---

## 7. RISKS & MITIGATION

### 7.1 Risks

| Risk                              | Impact | Probability | Mitigation                                       |
| --------------------------------- | ------ | ----------- | ------------------------------------------------ |
| Brevo API rate limit              | Medium | Low         | Implement email queue với BullMQ                 |
| Google OAuth credentials không có | High   | Medium      | Fallback to email/password only                  |
| Redis connection failure          | High   | Low         | Graceful degradation, log errors                 |
| Database migration conflicts      | Medium | Medium      | Version control migrations, test before deploy   |
| JWT secret leaked                 | High   | Low         | Rotate secrets, use environment variables        |
| Concurrent refresh token requests | Medium | Medium      | Implement token rotation với Redis lock          |
| Email verification spam           | Low    | Medium      | Rate limit: 1 email / 5 minutes                  |
| Brute force login attacks         | High   | High        | Rate limiting + account lockout after 5 attempts |

---

## 8. ACCEPTANCE CRITERIA SUMMARY

### 8.1 Must Have (P0)

- [x] NestJS project setup với TypeScript
- [x] Docker Compose (MySQL + Redis)
- [x] TypeORM setup với migrations
- [x] Auth Module: Register, Login, Logout, Refresh
- [x] JWT authentication
- [x] User Module: CRUD, Profile, Addresses
- [x] RBAC với 5 roles
- [x] Global exception filter
- [x] Validation pipe
- [x] Swagger documentation

### 8.2 Should Have (P1)

- [x] Google OAuth
- [x] Email verification
- [x] Password reset
- [x] Logging với Winston
- [x] Health check endpoint

### 8.3 Nice to Have (P2)

- [ ] Rate limiting per user
- [ ] Account lockout after failed attempts
- [ ] Audit logs
- [ ] Email templates customization

---

## 9. OUT OF SCOPE

Những tính năng **KHÔNG** nằm trong Phase 1:

- ❌ Product Module
- ❌ Order Module
- ❌ Payment Module
- ❌ Inventory Module
- ❌ Notification Module
- ❌ Dashboard Module
- ❌ Warranty Module
- ❌ PC Build Module
- ❌ Review Module
- ❌ Shipping Module
- ❌ BullMQ job queue
- ❌ Socket.IO real-time
- ❌ Sentry error tracking
- ❌ Firebase Crashlytics
- ❌ CI/CD pipeline
- ❌ Production deployment

---

## 10. NEXT STEPS

Sau khi hoàn thành Requirements Document:

1. ✅ Review và approve requirements
2. ⏭️ Tạo Design Document (architecture, API contracts, database schema)
3. ⏭️ Tạo Tasks Document (implementation breakdown)
4. ⏭️ Start implementation

---

**Document Version:** 1.0
**Last Updated:** May 1, 2026
**Author:** Development Team
**Status:** Draft → Ready for Review

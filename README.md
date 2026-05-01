# 🚀 Smart Laptop Store & Technical Service Platform

> **Trạng thái:** 🔴 **5% hoàn thành** - Đang trong giai đoạn phát triển
>
> **Mục tiêu:** Xây dựng hệ thống e-commerce laptop đầy đủ tính năng, đạt chuẩn production-ready để đi làm

---

## 📊 TỔNG QUAN DỰ ÁN

### Tech Stack

- **Backend:** NestJS + TypeORM + MySQL + Redis + BullMQ + Socket.IO
- **Frontend Client:** Next.js 16 + TailwindCSS + shadcn/ui + Zustand
- **Frontend Admin:** Next.js 16 + TailwindCSS + Radix UI
- **Architecture:** Modular Monolith với Layered Architecture

### Roles

- 👤 **Customer** - Khách hàng
- 👔 **Staff** - Nhân viên bán hàng
- 🔧 **Technician** - Kỹ thuật viên sửa chữa
- 📦 **Warehouse** - Nhân viên kho
- 👑 **Admin** - Quản trị viên

---

## 🎯 12 TIÊU CHÍ ĐI LÀM - TRẠNG THÁI HIỆN TẠI

### ✅ 1. Auth / Phân quyền (20% ✓)

**Đã có:**

- ✅ FE: Auth pages (login, register, forgot-password, verify-email)
- ✅ FE: Auth context & auth service
- ✅ 5 roles đã định nghĩa

**Chưa có:**

- ❌ Backend Auth Module (JWT + Refresh Token)
- ❌ Redis token revocation
- ❌ Google OAuth integration
- ❌ Email verification (Brevo)
- ❌ RBAC Guards & Middleware
- ❌ Password reset flow backend

**Ước tính:** 11 ngày

---

### ❌ 2. Payment giả lập (0%)

**Chưa có:**

- ❌ Payment Module (VietQR, MoMo, COD)
- ❌ Fake gateway implementation
- ❌ Webhook handlers
- ❌ QR code generation
- ❌ Payment timeout handling
- ❌ Idempotency cho webhooks
- ❌ Payment UI (QR display, MoMo redirect)

**Ước tính:** 2 ngày

---

### ❌ 3. Quản lý đơn hàng (10% ✓)

**Đã có:**

- ✅ FE: Order pages
- ✅ FE: Order service

**Chưa có:**

- ❌ Order Module backend
- ❌ Order status workflow (9 statuses)
- ❌ Order confirmation logic
- ❌ Cancel/Refund logic
- ❌ Order tracking system
- ❌ Staff order processing
- ❌ Order history & filters

**Ước tính:** 3 ngày

---

### ❌ 4. Giỏ hàng / Checkout (10% ✓)

**Đã có:**

- ✅ FE: Cart pages
- ✅ FE: Cart context & service

**Chưa có:**

- ❌ Cart Module backend
- ❌ Cart validation (price, stock)
- ❌ Voucher application
- ❌ Shipping fee calculation
- ❌ Checkout flow backend
- ❌ Cart persistence

**Ước tính:** 1.5 ngày

---

### ❌ 5. Dashboard quản lý (5% ✓)

**Đã có:**

- ✅ FE: Dashboard layout
- ✅ FE: Analytics page structure

**Chưa có:**

- ❌ Dashboard Module backend
- ❌ Revenue queries & aggregation
- ❌ Order statistics
- ❌ Top products query
- ❌ Charts data API
- ❌ Real-time metrics
- ❌ Recharts integration

**Ước tính:** 2 ngày

---

### ❌ 6. Xử lý nhiều user cùng lúc (0%)

**Chưa có:**

- ❌ Database connection pooling
- ❌ Redis caching strategy
- ❌ Rate limiting (Throttler)
- ❌ Load testing setup
- ❌ Horizontal scaling config
- ❌ Database indexing
- ❌ Query optimization
- ❌ N+1 query prevention
- ❌ Firebase Crashlytics
- ❌ Winston structured logging

**Ước tính:** 1.5 ngày + testing

---

### ❌ 7. Quản lý tồn kho - Tránh bán âm hàng (0%)

**Chưa có:**

- ❌ Inventory Module
- ❌ Stock reservation system
- ❌ Transaction locking (SELECT FOR UPDATE)
- ❌ Stock movements tracking
- ❌ Low stock alerts
- ❌ Import/Export management
- ❌ Warehouse role pages
- ❌ Cron job: Release expired reservations (BullMQ)

**Ước tính:** 2 ngày

---

### ❌ 8. Notification / Email (0%)

**Chưa có:**

- ❌ Notification Module
- ❌ BullMQ queue setup
- ❌ Socket.IO gateway (real-time)
- ❌ Brevo email service
- ❌ FCM push notifications
- ❌ Email templates
- ❌ Real-time notifications FE
- ❌ Event-driven architecture
- ❌ Notification preferences

**Ước tính:** 2 ngày

---

### ❌ 9. Tích hợp vận chuyển (0%)

**Chưa có:**

- ❌ Shipping Module
- ❌ Shipping fee calculation (by weight, distance)
- ❌ Tracking system
- ❌ Shipping status updates
- ❌ Delivery confirmation
- ❌ Shipping provider integration

**Ước tính:** 1 ngày

---

### ❌ 10. Logging & Monitoring (0%)

**Chưa có:**

- ❌ Winston logger setup
- ❌ Sentry integration (BE + FE)
- ❌ Firebase Crashlytics
- ❌ Cloud Run monitoring
- ❌ Structured logging
- ❌ Audit logs
- ❌ Error tracking & alerting
- ❌ Performance monitoring
- ❌ Health check endpoints (Terminus)

**Ước tính:** 1 ngày

---

### ❌ 11. Bảo mật dữ liệu (0%)

**Chưa có:**

- ❌ Input validation (class-validator)
- ❌ SQL injection prevention
- ❌ XSS prevention
- ❌ CSRF protection
- ❌ Helmet security headers
- ❌ Rate limiting per endpoint
- ❌ Secure cookies (httpOnly, secure)
- ❌ Password hashing (bcrypt)
- ❌ Sensitive data masking in logs
- ❌ File upload security (size, type validation)

**Ước tính:** 1.5 ngày

---

### ❌ 12. Deploy / CI-CD (0%)

**Chưa có:**

- ❌ Docker setup (BE + FE)
- ❌ docker-compose.yml
- ❌ Dockerfile production-ready
- ❌ GitHub Actions CI/CD pipeline
- ❌ Railway/Render deployment (BE)
- ❌ Vercel deployment (FE)
- ❌ Environment variables management
- ❌ Production database (Clever Cloud MySQL)
- ❌ Redis Cloud setup
- ❌ Domain & SSL certificate
- ❌ Automated testing in CI

**Ước tính:** 3 ngày

---

## 📈 TIẾN ĐỘ TỔNG THỂ

| Hạng mục               | Hoàn thành | Thiếu                                    |
| ---------------------- | ---------- | ---------------------------------------- |
| Auth / Phân quyền      | 20%        | Backend, OAuth, Email, RBAC              |
| Payment giả lập        | 0%         | Toàn bộ                                  |
| Quản lý đơn hàng       | 10%        | Backend, workflow, tracking              |
| Giỏ hàng / Checkout    | 10%        | Backend, validation, voucher             |
| Dashboard quản lý      | 5%         | Backend, queries, charts                 |
| Xử lý nhiều user       | 0%         | Caching, pooling, monitoring             |
| Quản lý tồn kho        | 0%         | Toàn bộ                                  |
| Notification / Email   | 0%         | BullMQ, Socket.IO, Brevo, FCM            |
| Tích hợp vận chuyển    | 0%         | Toàn bộ                                  |
| Logging & Monitoring   | 0%         | Winston, Sentry, Crashlytics             |
| Bảo mật dữ liệu        | 0%         | Validation, security headers, encryption |
| Deploy / CI-CD         | 0%         | Docker, GitHub Actions, hosting          |
| **TỔNG TIẾN ĐỘ DỰ ÁN** | **~5%**    | **95% còn lại**                          |

---

## 🗺️ ROADMAP - KẾ HOẠCH THỰC HIỆN

### 🔴 PHASE 1: Backend Foundation (Tuần 1-2) - **11 ngày**

**Mục tiêu:** Setup backend hoàn chỉnh + Auth system

#### Tasks:

1. **Project Setup (1 ngày)**
   - [ ] Init NestJS project
   - [ ] Setup TypeORM + MySQL
   - [ ] Setup Redis
   - [ ] Docker Compose (MySQL + Redis)
   - [ ] Environment config module

2. **Database Setup (0.5 ngày)**
   - [ ] Data source configuration
   - [ ] Migration setup
   - [ ] Seed data structure

3. **Auth Module (2 ngày)**
   - [ ] Register endpoint
   - [ ] Login endpoint (JWT + Refresh Token)
   - [ ] Logout endpoint (Redis revocation)
   - [ ] Refresh token endpoint
   - [ ] JWT Strategy
   - [ ] Local Strategy

4. **Google OAuth (1 ngày)**
   - [ ] Passport Google Strategy
   - [ ] OAuth callback handler
   - [ ] Link Google account

5. **Email Verification (1 ngày)**
   - [ ] Brevo email service integration
   - [ ] Send verification email
   - [ ] Verify email endpoint
   - [ ] Forgot password email
   - [ ] Reset password endpoint

6. **RBAC Guards (0.5 ngày)**
   - [ ] Auth Guard
   - [ ] Role Guard
   - [ ] Custom decorators (@Roles, @Public, @CurrentUser)

7. **User Module (1 ngày)**
   - [ ] User CRUD
   - [ ] Profile management
   - [ ] Address management
   - [ ] User entity + repository

8. **Global Setup (1 ngày)**
   - [ ] Global exception filter
   - [ ] Validation pipe
   - [ ] Transform interceptor
   - [ ] Logging interceptor
   - [ ] Swagger documentation

9. **Auth Pages FE (2 ngày)**
   - [ ] Connect FE to BE APIs
   - [ ] Token management
   - [ ] Protected routes
   - [ ] Error handling

**Deliverable:** ✅ Auth system hoàn chỉnh, có thể login/register/logout

---

### 🟠 PHASE 2: Core Commerce (Tuần 3-5) - **20 ngày**

**Mục tiêu:** Product + Cart + Order hoạt động end-to-end

#### Tasks:

1. **Category + Brand Module (1 ngày)**
   - [ ] Category CRUD (tree structure)
   - [ ] Brand CRUD
   - [ ] Category entity + repository
   - [ ] Brand entity + repository

2. **Product Module (3 ngày)**
   - [ ] Product CRUD
   - [ ] Product search (full-text)
   - [ ] Product filter (category, brand, price)
   - [ ] Product sort & pagination
   - [ ] Product specs management
   - [ ] Product images management
   - [ ] Product entity + repository

3. **Upload Module (0.5 ngày)**
   - [ ] Cloudinary integration
   - [ ] Image upload endpoint
   - [ ] Image delete endpoint

4. **Supplier Module (0.5 ngày)**
   - [ ] Supplier CRUD
   - [ ] Link supplier to products

5. **Cart Module (1.5 ngày)**
   - [ ] Add to cart
   - [ ] Update cart item
   - [ ] Remove from cart
   - [ ] Get cart
   - [ ] Cart validation (price, stock)
   - [ ] Cart entity + repository

6. **Voucher Module (1 ngày)**
   - [ ] Voucher CRUD
   - [ ] Validate voucher
   - [ ] Apply voucher to order
   - [ ] Voucher usage tracking

7. **Order Module (3 ngày)**
   - [ ] Create order (from cart)
   - [ ] Order status workflow (9 statuses)
   - [ ] Confirm order (staff)
   - [ ] Cancel order
   - [ ] Refund order
   - [ ] Order entity + repository
   - [ ] Order items entity

8. **Shipping Module (1 ngày)**
   - [ ] Calculate shipping fee
   - [ ] Tracking system
   - [ ] Update shipping status

9. **Homepage FE (2 ngày)**
   - [ ] Banner slider
   - [ ] Featured products
   - [ ] Categories grid
   - [ ] Connect to BE APIs

10. **Product Pages FE (3 ngày)**
    - [ ] Product listing page
    - [ ] Product detail page
    - [ ] Product filters
    - [ ] Product search
    - [ ] Connect to BE APIs

11. **Cart + Checkout FE (2 ngày)**
    - [ ] Cart drawer
    - [ ] Checkout page
    - [ ] Address selection
    - [ ] Voucher input
    - [ ] Connect to BE APIs

12. **Order Pages FE (1.5 ngày)**
    - [ ] Order list page
    - [ ] Order detail page
    - [ ] Order tracking
    - [ ] Connect to BE APIs

**Deliverable:** ✅ Khách hàng có thể browse → add to cart → checkout → track order

---

### 🟡 PHASE 3: Payment & Inventory (Tuần 6-7) - **10 ngày**

**Mục tiêu:** Payment flow + Stock reservation chống bán âm kho

#### Tasks:

1. **Payment Module (2 ngày)**
   - [ ] VietQR fake gateway
   - [ ] MoMo fake gateway
   - [ ] COD payment method
   - [ ] Webhook handlers
   - [ ] Payment status tracking
   - [ ] Payment timeout handling
   - [ ] Idempotency middleware

2. **Stock Reservation System (2 ngày)**
   - [ ] Reserve stock on checkout
   - [ ] Release stock on cancel
   - [ ] Confirm stock on payment success
   - [ ] Transaction locking (SELECT FOR UPDATE)
   - [ ] Handle payment timeout

3. **Inventory Module (2 ngày)**
   - [ ] Inventory CRUD
   - [ ] Import goods
   - [ ] Export goods
   - [ ] Adjust stock
   - [ ] Stock movements tracking
   - [ ] Low stock alerts
   - [ ] Inventory entity + repository

4. **Payment UI FE (1.5 ngày)**
   - [ ] QR code display
   - [ ] MoMo redirect
   - [ ] COD confirmation
   - [ ] Payment status polling
   - [ ] Connect to BE APIs

5. **Warehouse Pages FE (2 ngày)**
   - [ ] Stock overview page
   - [ ] Import goods form
   - [ ] Export goods form
   - [ ] Low stock alerts page
   - [ ] Movement history
   - [ ] Connect to BE APIs

6. **Cron Job (0.5 ngày)**
   - [ ] BullMQ setup
   - [ ] Release expired reservations job
   - [ ] Schedule every 5 minutes

**Deliverable:** ✅ Full payment flow + inventory management + không bán âm kho

---

### 🟢 PHASE 4: Business Logic (Tuần 8-10) - **14 ngày**

**Mục tiêu:** PC Build + Warranty - tính năng tạo sự khác biệt

#### Tasks:

1. **PC Build Module (3 ngày)**
   - [ ] Compatibility rules CRUD
   - [ ] Compatibility check engine
   - [ ] Suggest compatible components
   - [ ] Compatibility rules entity

2. **PC Build UI FE (3 ngày)**
   - [ ] Interactive builder
   - [ ] Component selection
   - [ ] Compatibility indicator
   - [ ] Build summary
   - [ ] Connect to BE APIs

3. **Warranty Module (2.5 ngày)**
   - [ ] Warranty ticket CRUD
   - [ ] Assign technician
   - [ ] Status workflow (8 statuses)
   - [ ] Repair logs
   - [ ] Warranty entity + repository

4. **Warranty UI FE (2 ngày)**
   - [ ] Submit warranty form
   - [ ] Ticket list page
   - [ ] Ticket detail page
   - [ ] Status tracking
   - [ ] Connect to BE APIs

5. **Technician Panel FE (1.5 ngày)**
   - [ ] My tickets page
   - [ ] Ticket management
   - [ ] Repair workflow
   - [ ] Connect to BE APIs

6. **Review Module (1 ngày)**
   - [ ] Review CRUD
   - [ ] Verified purchase check
   - [ ] Rating calculation
   - [ ] Review entity + repository

7. **Review UI FE (1 ngày)**
   - [ ] Review form
   - [ ] Review list on product detail
   - [ ] Rating display
   - [ ] Connect to BE APIs

**Deliverable:** ✅ PC builder engine + warranty system + review system

---

### 🔵 PHASE 5: Notification & Dashboard (Tuần 11-12) - **12 ngày**

**Mục tiêu:** Real-time notifications + Admin analytics

#### Tasks:

1. **Notification Module (2 ngày)**
   - [ ] BullMQ queue setup
   - [ ] Socket.IO gateway
   - [ ] Brevo email service
   - [ ] FCM push notifications
   - [ ] Email templates
   - [ ] Notification entity + repository

2. **Integrate Notifications (1.5 ngày)**
   - [ ] Order events → queue
   - [ ] Payment events → queue
   - [ ] Shipping events → queue
   - [ ] Warranty events → queue
   - [ ] Event emitters

3. **Notification UI FE (1.5 ngày)**
   - [ ] Bell icon + dropdown
   - [ ] Notification page
   - [ ] Real-time updates (Socket.IO)
   - [ ] Mark as read
   - [ ] Connect to BE APIs

4. **Dashboard Module (2 ngày)**
   - [ ] Revenue queries
   - [ ] Order statistics
   - [ ] Top products query
   - [ ] Warranty stats
   - [ ] Charts data API

5. **Dashboard UI FE (3 ngày)**
   - [ ] Revenue charts (Recharts)
   - [ ] Stats cards
   - [ ] Top products table
   - [ ] Order stats charts
   - [ ] Connect to BE APIs

6. **Staff Panel FE (2 ngày)**
   - [ ] Order processing page
   - [ ] Customer support page
   - [ ] Order filters
   - [ ] Connect to BE APIs

**Deliverable:** ✅ Real-time notifications + admin dashboard with charts

---

### ⚫ PHASE 6: Production Ready (Tuần 13-14) - **11 ngày**

**Mục tiêu:** Security + Logging + Deploy + CI/CD

#### Tasks:

1. **Security Hardening (1.5 ngày)**
   - [ ] Input sanitization
   - [ ] XSS prevention
   - [ ] CSRF protection
   - [ ] Secure cookies
   - [ ] Rate limiting per endpoint
   - [ ] Helmet security headers
   - [ ] File upload validation

2. **Logging (1 ngày)**
   - [ ] Winston logger setup
   - [ ] Structured logs
   - [ ] Audit logs
   - [ ] Log rotation
   - [ ] Sensitive data masking

3. **Error Monitoring (0.5 ngày)**
   - [ ] Sentry integration (BE)
   - [ ] Sentry integration (FE)
   - [ ] Firebase Crashlytics

4. **Health Check (0.5 ngày)**
   - [ ] Terminus health check
   - [ ] Database health
   - [ ] Redis health
   - [ ] Memory health

5. **Docker (1 ngày)**
   - [ ] Dockerfile (BE)
   - [ ] Dockerfile (FE Client)
   - [ ] Dockerfile (FE Admin)
   - [ ] docker-compose.yml
   - [ ] Multi-stage builds

6. **CI/CD (1 ngày)**
   - [ ] GitHub Actions workflow
   - [ ] Lint + Type check
   - [ ] Unit tests
   - [ ] Build Docker images
   - [ ] Deploy to Railway/Render
   - [ ] Deploy to Vercel

7. **Deploy BE (0.5 ngày)**
   - [ ] Railway/Render setup
   - [ ] Environment variables
   - [ ] Database connection

8. **Deploy FE (0.5 ngày)**
   - [ ] Vercel setup (Client)
   - [ ] Vercel setup (Admin)
   - [ ] Environment variables

9. **Deploy DB (0.5 ngày)**
   - [ ] Clever Cloud MySQL
   - [ ] Redis Cloud
   - [ ] Run migrations

10. **Testing (3 ngày)**
    - [ ] Unit tests (services)
    - [ ] Integration tests (controllers)
    - [ ] E2E tests (critical flows)
    - [ ] Load testing
    - [ ] Security testing

11. **Documentation (1 ngày)**
    - [ ] README.md
    - [ ] API documentation (Swagger)
    - [ ] .env.example
    - [ ] Setup guide
    - [ ] Deployment guide

**Deliverable:** ✅ Production system chạy trên internet, CI/CD, monitoring

---

## 📊 TIMELINE SUMMARY

```
Tuần 1-2   ████████████  Phase 1 — Foundation (Auth + User)
Tuần 3-5   ████████████████████  Phase 2 — Core Commerce
Tuần 6-7   ██████████  Phase 3 — Payment & Inventory
Tuần 8-10  ██████████████  Phase 4 — Business Logic
Tuần 11-12 ████████████  Phase 5 — Notification & Dashboard
Tuần 13-14 ███████████  Phase 6 — Production Ready

Tổng cộng: ~14 tuần (~3.5 tháng)
```

---

## 🚀 QUICK START (Khi Backend đã setup)

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- MySQL 8+
- Redis 7+

### Installation

```bash
# Clone repository
git clone <repo-url>

# Install dependencies
cd FeShopLaptop && npm install
cd ../fe-admin-laptop && npm install
cd ../BeShopLapTop && npm install

# Setup environment variables
cp .env.example .env

# Start infrastructure
docker-compose up -d

# Run migrations
cd BeShopLapTop && npm run migration:run

# Seed data
npm run seed

# Start development servers
npm run dev  # Backend (port 3001)
cd ../FeShopLaptop && npm run dev  # Client (port 3002)
cd ../fe-admin-laptop && npm run dev  # Admin (port 3003)
```

---

## 📁 PROJECT STRUCTURE

```
.
├── BeShopLapTop/          # Backend (NestJS) - CHƯA TỒN TẠI
│   ├── src/
│   │   ├── modules/       # Business modules
│   │   ├── common/        # Shared utilities
│   │   ├── config/        # Configuration
│   │   └── database/      # Migrations & seeds
│   └── docker-compose.yml
│
├── FeShopLaptop/          # Frontend Client (Next.js)
│   ├── src/
│   │   ├── app/           # Pages (App Router)
│   │   ├── components/    # React components
│   │   ├── lib/           # Services & utilities
│   │   └── context/       # React context
│   └── package.json
│
├── fe-admin-laptop/       # Frontend Admin (Next.js)
│   ├── src/
│   │   ├── app/           # Admin pages
│   │   ├── components/    # Admin components
│   │   ├── lib/           # Admin services
│   │   └── context/       # Admin context
│   └── package.json
│
└── PROJECT_PLAN.md        # Detailed architecture plan
```

---

## 🔗 LINKS

- **Documentation:** [PROJECT_PLAN.md](./PROJECT_PLAN.md)
- **API Docs:** http://localhost:3001/api/docs (Swagger)
- **Client:** http://localhost:3002
- **Admin:** http://localhost:3003

---

## 👥 TEAM

- **Developer:** [Your Name]
- **Architecture:** Modular Monolith + Layered Architecture
- **Methodology:** Agile + Spec-driven Development

---

## 📝 LICENSE

Private Project

---

## 🆘 SUPPORT

Nếu gặp vấn đề, vui lòng tạo issue hoặc liên hệ qua email.

---

**Last Updated:** May 1, 2026
**Version:** 0.1.0 (5% complete)

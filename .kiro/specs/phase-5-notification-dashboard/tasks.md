# Phase 5 — Notification & Dashboard Implementation Tasks

**Spec Type:** Feature
**Phase:** 5 - Notification & Dashboard
**Status:** In Progress
**Created:** 2026-05-03

---

## 📋 Task Overview

Phase 5 focuses on completing the notification system infrastructure and building comprehensive admin analytics dashboard with charts and visualizations.

**Current Status:**

- ✅ Notification backend APIs (90%)
- ✅ SSE realtime delivery (100%)
- ✅ Dashboard backend APIs (100%)
- ⚠️ Missing: BullMQ, Socket.IO, Email service
- ⚠️ Missing: Dashboard charts UI, Notification bell component

---

## 🎯 Implementation Tasks

### 1. Backend Infrastructure Enhancement

#### 1.1 BullMQ Integration

- [ ] 1.1.1 Install BullMQ dependencies (`@nestjs/bull`, `bull`)
  - Add to package.json
  - Configure BullModule in app.module.ts
  - Create queue configuration file

- [ ] 1.1.2 Create notification queue processor
  - Create `notification.processor.ts` in notification module
  - Implement job handlers for notification delivery
  - Add retry logic with exponential backoff
  - Implement dead letter queue handling

- [ ] 1.1.3 Migrate from Redis manual queue to BullMQ
  - Update NotificationService to use BullMQ Queue
  - Replace `redis.rpush` with `queue.add()`
  - Update queue stats endpoints to use BullMQ APIs
  - Test migration with existing notification flows

- [ ] 1.1.4 Add scheduled jobs for cleanup
  - Create cron job to clean old notifications (>30 days)
  - Create cron job to retry failed notifications
  - Add job monitoring endpoints

**Acceptance Criteria:**

- BullMQ successfully processes notification jobs
- Retry mechanism works with exponential backoff
- DLQ captures failed jobs after max retries
- Queue stats API returns BullMQ metrics

---

#### 1.2 Socket.IO Gateway Implementation

- [ ] 1.2.1 Install Socket.IO dependencies
  - Add `@nestjs/platform-socket.io`, `socket.io`
  - Configure CORS for WebSocket connections

- [ ] 1.2.2 Create NotificationGateway
  - Create `notification.gateway.ts` with @WebSocketGateway decorator
  - Implement connection/disconnection handlers
  - Add JWT authentication for socket connections
  - Create user room management (join/leave)

- [ ] 1.2.3 Integrate gateway with notification service
  - Update NotificationStreamService to support both SSE and Socket.IO
  - Emit notifications to user rooms via Socket.IO
  - Add fallback to SSE if Socket.IO unavailable

- [ ] 1.2.4 Add Socket.IO admin endpoints
  - Create endpoint to get connected users count
  - Create endpoint to broadcast admin messages
  - Add socket connection monitoring

**Acceptance Criteria:**

- Socket.IO gateway accepts authenticated connections
- Notifications delivered via WebSocket in realtime
- Users automatically join their user-specific room
- SSE fallback works when Socket.IO unavailable

---

#### 1.3 Email Service Integration

- [ ] 1.3.1 Install email service dependencies
  - Add `@nestjs-modules/mailer`, `nodemailer`
  - Choose provider: Brevo (recommended) or SendGrid

- [ ] 1.3.2 Create MailModule
  - Create `mail.module.ts` with MailerModule configuration
  - Add email templates directory structure
  - Configure SMTP/API credentials from environment

- [ ] 1.3.3 Create email templates
  - Order confirmation template
  - Payment success/failed template
  - Warranty ticket created template
  - Warranty status update template
  - Welcome email template

- [ ] 1.3.4 Create MailService
  - Create `mail.service.ts` with template rendering
  - Implement `sendOrderConfirmation()`
  - Implement `sendPaymentNotification()`
  - Implement `sendWarrantyNotification()`
  - Add email queue for async delivery

- [ ] 1.3.5 Integrate with notification events
  - Update NotificationEventsListener to trigger emails
  - Add email delivery tracking
  - Implement email retry logic

**Acceptance Criteria:**

- Email templates render correctly with dynamic data
- Emails sent asynchronously via queue
- Email delivery tracked in database
- Failed emails retry with exponential backoff

---

### 2. Frontend Client (FeShopLaptop)

#### 2.1 Notification Bell Component

- [ ] 2.1.1 Create NotificationBell component
  - Create `components/layout/notification-bell.tsx`
  - Add bell icon with unread count badge
  - Implement dropdown with recent notifications (5 items)
  - Add "View All" link to /notifications page

- [ ] 2.1.2 Integrate Socket.IO client
  - Install `socket.io-client` dependency
  - Create `lib/socket-service.ts` for Socket.IO connection
  - Connect on user authentication
  - Listen for notification events
  - Update unread count in realtime

- [ ] 2.1.3 Add bell to header/layout
  - Import NotificationBell in main layout
  - Position in header (top-right)
  - Add responsive behavior for mobile
  - Test with SSE fallback

- [ ] 2.1.4 Add notification sound (optional)
  - Add notification sound file to public/sounds/
  - Play sound on new notification (with user preference)
  - Add mute/unmute toggle

**Acceptance Criteria:**

- Bell icon shows correct unread count
- Dropdown displays 5 most recent notifications
- Clicking notification marks as read and navigates
- Socket.IO connection established on login
- Realtime updates work without page refresh

---

### 3. Frontend Admin (fe-admin-laptop)

#### 3.1 Full Dashboard Analytics UI

- [ ] 3.1.1 Install chart library
  - Add `recharts` dependency
  - Create chart wrapper components in `components/dashboard/`

- [ ] 3.1.2 Create DashboardService
  - Create `lib/dashboard-service.ts`
  - Implement `getOverview(fromDate?, toDate?)`
  - Add date range formatting utilities

- [ ] 3.1.3 Create date range picker component
  - Create `components/dashboard/date-range-picker.tsx`
  - Add preset ranges (Today, Last 7 days, Last 30 days, This month)
  - Add custom date range selection
  - Persist selected range in localStorage

- [ ] 3.1.4 Build revenue chart
  - Create `components/dashboard/revenue-chart.tsx`
  - Use LineChart from recharts
  - Display revenue by payment status
  - Add tooltips with formatted currency

- [ ] 3.1.5 Build order stats chart
  - Create `components/dashboard/order-stats-chart.tsx`
  - Use BarChart or PieChart for order status distribution
  - Add color coding by status
  - Display count and percentage

- [ ] 3.1.6 Build top products table
  - Create `components/dashboard/top-products-table.tsx`
  - Display product name, total sold, revenue
  - Add sorting by sold/revenue
  - Limit to top 10 products

- [ ] 3.1.7 Build warranty stats visualization
  - Create `components/dashboard/warranty-stats.tsx`
  - Use PieChart for warranty status distribution
  - Display pending, in-progress, completed counts

- [ ] 3.1.8 Create main dashboard page
  - Update `app/(dashboard)/page.tsx` or create `/analytics`
  - Add summary cards (revenue, orders, products, warranty)
  - Add date range picker at top
  - Layout charts in responsive grid
  - Add loading states and error handling

- [ ] 3.1.9 Add export functionality
  - Add "Export Report" button
  - Generate PDF report with charts (optional)
  - Generate CSV export for data tables
  - Include date range in export filename

**Acceptance Criteria:**

- Dashboard loads with default date range (Last 30 days)
- All charts render correctly with real data
- Date range picker updates all charts
- Charts responsive on mobile/tablet
- Export generates valid CSV/PDF files

---

#### 3.2 Staff Panel Enhancement

- [ ] 3.2.1 Create staff-specific order processing page
  - Create `app/(dashboard)/staff/orders/page.tsx`
  - Focus on order confirmation workflow
  - Add quick actions (confirm, pack, ship)
  - Filter by status (pending, confirmed, processing)

- [ ] 3.2.2 Create customer support interface
  - Create `app/(dashboard)/staff/support/page.tsx`
  - Display recent customer inquiries
  - Add quick reply templates
  - Link to related orders/warranty tickets

- [ ] 3.2.3 Add staff dashboard view
  - Create `app/(dashboard)/staff/page.tsx`
  - Show staff-relevant metrics (pending orders, support tickets)
  - Add quick links to common tasks
  - Display personal performance stats (optional)

**Acceptance Criteria:**

- Staff users see staff-specific navigation
- Order processing page has streamlined workflow
- Support interface accessible to staff role
- Staff dashboard shows relevant metrics only

---

### 4. Testing & Quality Assurance

#### 4.1 Backend Tests

- [ ] 4.1.1 Unit tests for BullMQ processor
  - Test job processing success
  - Test retry logic
  - Test DLQ handling

- [ ] 4.1.2 Integration tests for Socket.IO gateway
  - Test connection/disconnection
  - Test authentication
  - Test notification delivery

- [ ] 4.1.3 Integration tests for email service
  - Test template rendering
  - Test email queue
  - Mock SMTP/API calls

#### 4.2 Frontend Tests

- [ ] 4.2.1 Component tests for NotificationBell
  - Test dropdown open/close
  - Test mark as read
  - Test navigation

- [ ] 4.2.2 Component tests for dashboard charts
  - Test chart rendering with mock data
  - Test date range filtering
  - Test responsive behavior

#### 4.3 E2E Tests

- [ ] 4.3.1 E2E notification flow
  - Create order → receive notification
  - Test realtime delivery
  - Test mark as read

- [ ] 4.3.2 E2E dashboard flow
  - Load dashboard → verify charts
  - Change date range → verify update
  - Export report → verify file

**Acceptance Criteria:**

- All unit tests pass
- Integration tests cover critical paths
- E2E tests validate user workflows

---

### 5. Documentation & Deployment

#### 5.1 Documentation

- [ ] 5.1.1 Update API documentation
  - Document BullMQ queue endpoints
  - Document Socket.IO events
  - Document email service configuration

- [ ] 5.1.2 Create deployment guide
  - Document BullMQ setup (Redis requirement)
  - Document Socket.IO CORS configuration
  - Document email service credentials setup

- [ ] 5.1.3 Create user guide
  - Document notification preferences
  - Document dashboard usage
  - Document staff panel workflows

#### 5.2 Environment Configuration

- [ ] 5.2.1 Add environment variables
  - `REDIS_URL` for BullMQ
  - `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASSWORD`
  - `MAIL_FROM_NAME`, `MAIL_FROM_ADDRESS`
  - `SOCKET_IO_CORS_ORIGIN`

- [ ] 5.2.2 Update .env.example
  - Add all new environment variables
  - Add comments explaining each variable

#### 5.3 Deployment

- [ ] 5.3.1 Deploy backend with BullMQ
  - Ensure Redis available in production
  - Configure BullMQ connection
  - Test queue processing

- [ ] 5.3.2 Deploy Socket.IO gateway
  - Configure WebSocket support on hosting platform
  - Test Socket.IO connections in production
  - Verify CORS settings

- [ ] 5.3.3 Configure email service
  - Set up Brevo/SendGrid account
  - Configure API keys/SMTP credentials
  - Test email delivery in production

**Acceptance Criteria:**

- All documentation complete and accurate
- Environment variables documented
- Production deployment successful
- All services operational in production

---

## 📊 Progress Tracking

### Completion Status

- [ ] Backend Infrastructure (0/13 tasks)
- [ ] Frontend Client (0/4 tasks)
- [ ] Frontend Admin (0/12 tasks)
- [ ] Testing (0/7 tasks)
- [ ] Documentation & Deployment (0/8 tasks)

**Total: 0/44 tasks completed**

---

## 🚀 Priority Order

### Sprint 1 (Week 1): Core Infrastructure

1. BullMQ Integration (1.1)
2. Socket.IO Gateway (1.2)
3. Notification Bell Component (2.1)

### Sprint 2 (Week 2): Email & Dashboard

4. Email Service Integration (1.3)
5. Dashboard Charts UI (3.1.1-3.1.7)
6. Main Dashboard Page (3.1.8)

### Sprint 3 (Week 3): Polish & Testing

7. Staff Panel Enhancement (3.2)
8. Testing (4.1-4.3)
9. Documentation & Deployment (5.1-5.3)

---

## 📝 Notes

- **BullMQ vs Redis Manual Queue**: BullMQ provides better job management, monitoring, and retry logic
- **Socket.IO vs SSE**: Socket.IO enables bidirectional communication, better for interactive features
- **Email Service**: Brevo recommended for free tier (300 emails/day), SendGrid alternative
- **Charts Library**: Recharts chosen for React compatibility and ease of use
- **Staff Panel**: Can be separate app or route group within admin, decide based on requirements

---

## ✅ Definition of Done

A task is considered complete when:

- [ ] Code implemented and follows project conventions
- [ ] Unit tests written and passing
- [ ] Integration tests passing (if applicable)
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Deployed to staging and tested
- [ ] No critical bugs or regressions

---

**Last Updated:** 2026-05-03
**Next Review:** After Sprint 1 completion

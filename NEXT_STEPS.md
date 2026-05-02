# 🎯 KẾ HOẠCH TRIỂN KHAI TIẾP THEO

> **Cập nhật:** May 1, 2026
> **Trạng thái hiện tại:** Frontend đã có cấu trúc cơ bản, Backend chưa tồn tại

---

## 📊 ĐÁNH GIÁ HIỆN TRẠNG

### ✅ ĐÃ CÓ (Frontend)

#### FE Client (FeShopLaptop)

- ✅ Cấu trúc pages: Auth, Products, Cart, Checkout, Orders, Warranty, PC Build, Notifications
- ✅ Context: Auth, Cart
- ✅ Services: 11 services (auth, cart, order, product, payment, warranty, etc.)
- ✅ UI Components: shadcn/ui (button, card, input, select, etc.)

#### FE Admin (fe-admin-laptop)

- ✅ Dashboard layout
- ✅ Pages: Analytics, Products, Orders, Users, Categories, Brands, Reviews, Warranty, Settings
- ✅ Context: Auth
- ✅ Services: 10 services
- ✅ UI Components: Radix UI + shadcn/ui

### ❌ CHƯA CÓ (Backend)

**Backend (BeShopLapTop) - HOÀN TOÀN CHƯA TỒN TẠI**

Cần tạo toàn bộ:

- NestJS project structure
- Database (MySQL + TypeORM)
- Redis
- All modules (Auth, Product, Order, Payment, etc.)
- API endpoints
- Business logic

---

## 🚀 KẾ HOẠCH TRIỂN KHAI ƯU TIÊN

### 🔴 BƯỚC 1: SETUP BACKEND FOUNDATION (3-4 ngày)

#### 1.1 Init Backend Project (2 giờ)

```bash
# Tạo folder backend
mkdir BeShopLapTop
cd BeShopLapTop

# Init NestJS project
npm i -g @nestjs/cli
nest new . --package-manager npm

# Install dependencies
npm install @nestjs/typeorm typeorm mysql2
npm install @nestjs/config
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @nestjs/swagger
npm install class-validator class-transformer
npm install bcrypt
npm install @types/bcrypt -D
```

#### 1.2 Setup Database & Docker (2 giờ)

**docker-compose.yml**

```yaml
version: "3.8"

services:
  mysql:
    image: mysql:8
    container_name: laptop_store_db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: laptop_store
      MYSQL_USER: admin
      MYSQL_PASSWORD: admin123
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    container_name: laptop_store_redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mysql_data:
  redis_data:
```

**.env**

```env
# App
NODE_ENV=development
PORT=3001
APP_URL=http://localhost:3001
FRONTEND_CLIENT_URL=http://localhost:3002
FRONTEND_ADMIN_URL=http://localhost:3003

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=admin
DB_PASSWORD=admin123
DB_DATABASE=laptop_store

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_ACCESS_SECRET=your-super-secret-jwt-access-key-change-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-change-in-production
JWT_REFRESH_EXPIRATION=7d

# Google OAuth (optional - setup later)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Cloudinary (optional - setup later)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Brevo Email (optional - setup later)
BREVO_API_KEY=
BREVO_SENDER_EMAIL=
BREVO_SENDER_NAME=
```

#### 1.3 Config Module (1 giờ)

**src/config/database.config.ts**

```typescript
import { registerAs } from "@nestjs/config";

export default registerAs("database", () => ({
  type: "mysql",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + "/../**/*.entity{.ts,.js}"],
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
}));
```

#### 1.4 Database Entities (4 giờ)

Tạo các entities cơ bản:

- User
- Product
- Category
- Brand
- Order
- OrderItem
- Cart
- CartItem

#### 1.5 Auth Module (1 ngày)

**Endpoints cần implement:**

- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh
- GET /api/auth/me

#### 1.6 User Module (0.5 ngày)

**Endpoints cần implement:**

- GET /api/users (Admin only)
- GET /api/users/:id
- PATCH /api/users/:id
- PATCH /api/users/profile
- GET /api/users/addresses
- POST /api/users/addresses

---

### 🟠 BƯỚC 2: DASHBOARD/ANALYTICS MODULE (1-2 ngày)

Đây là phần bạn đang muốn làm tiếp!

#### 2.1 Backend Dashboard Module

**File structure:**

```
src/modules/dashboard/
├── dto/
│   ├── dashboard-overview.dto.ts
│   ├── revenue-stats.dto.ts
│   ├── order-stats.dto.ts
│   └── top-products.dto.ts
├── dashboard.controller.ts
├── dashboard.service.ts
└── dashboard.module.ts
```

**API Endpoints cần implement:**

1. **GET /api/dashboard/overview**

   ```typescript
   {
     totalRevenue: number;
     totalOrders: number;
     totalCustomers: number;
     totalProducts: number;
     revenueGrowth: number; // % so với tháng trước
     ordersGrowth: number;
     customersGrowth: number;
   }
   ```

2. **GET /api/dashboard/revenue?period=7d|30d|90d|1y**

   ```typescript
   {
     labels: string[]; // ['2026-04-01', '2026-04-02', ...]
     data: number[]; // [1000000, 1500000, ...]
     total: number;
     average: number;
   }
   ```

3. **GET /api/dashboard/order-stats?period=7d|30d|90d|1y**

   ```typescript
   {
     byStatus: {
       pending: number;
       confirmed: number;
       processing: number;
       shipping: number;
       delivered: number;
       completed: number;
       cancelled: number;
     };
     byDate: {
       labels: string[];
       data: number[];
     };
   }
   ```

4. **GET /api/dashboard/top-products?limit=10&period=30d**

   ```typescript
   [
     {
       id: number;
       name: string;
       image: string;
       soldCount: number;
       revenue: number;
       category: string;
     }
   ]
   ```

5. **GET /api/dashboard/inventory-alerts**

   ```typescript
   {
     lowStock: [
       {
         productId: number;
         productName: string;
         currentStock: number;
         threshold: number;
       }
     ];
     outOfStock: [...];
   }
   ```

6. **GET /api/dashboard/warranty-stats**
   ```typescript
   {
     total: number;
     byStatus: {
       pending: number;
       received: number;
       diagnosing: number;
       repairing: number;
       completed: number;
     }
     avgResolutionTime: number; // days
   }
   ```

#### 2.2 Dashboard Service Implementation

**dashboard.service.ts** (Pseudo-code)

```typescript
@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Inventory) private inventoryRepo: Repository<Inventory>,
  ) {}

  async getOverview(): Promise<DashboardOverviewDto> {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Total revenue (all time)
    const totalRevenue = await this.orderRepo
      .createQueryBuilder("order")
      .select("SUM(order.total)", "total")
      .where("order.status IN (:...statuses)", {
        statuses: ["completed", "delivered"],
      })
      .getRawOne();

    // Revenue this month
    const revenueThisMonth = await this.orderRepo
      .createQueryBuilder("order")
      .select("SUM(order.total)", "total")
      .where("order.status IN (:...statuses)", {
        statuses: ["completed", "delivered"],
      })
      .andWhere("order.created_at >= :start", { start: now })
      .getRawOne();

    // Revenue last month
    const revenueLastMonth = await this.orderRepo
      .createQueryBuilder("order")
      .select("SUM(order.total)", "total")
      .where("order.status IN (:...statuses)", {
        statuses: ["completed", "delivered"],
      })
      .andWhere("order.created_at >= :start", { start: lastMonth })
      .andWhere("order.created_at < :end", { end: now })
      .getRawOne();

    // Calculate growth
    const revenueGrowth = this.calculateGrowth(
      revenueThisMonth.total,
      revenueLastMonth.total,
    );

    // Similar for orders, customers...

    return {
      totalRevenue: totalRevenue.total || 0,
      totalOrders: await this.orderRepo.count(),
      totalCustomers: await this.userRepo.count({
        where: { role: "customer" },
      }),
      totalProducts: await this.productRepo.count(),
      revenueGrowth,
      ordersGrowth: 0, // TODO
      customersGrowth: 0, // TODO
    };
  }

  async getRevenueStats(period: string): Promise<RevenueStatsDto> {
    const { startDate, endDate } = this.parsePeriod(period);

    const data = await this.orderRepo
      .createQueryBuilder("order")
      .select("DATE(order.created_at)", "date")
      .addSelect("SUM(order.total)", "revenue")
      .where("order.status IN (:...statuses)", {
        statuses: ["completed", "delivered"],
      })
      .andWhere("order.created_at >= :start", { start: startDate })
      .andWhere("order.created_at <= :end", { end: endDate })
      .groupBy("DATE(order.created_at)")
      .orderBy("date", "ASC")
      .getRawMany();

    return {
      labels: data.map((d) => d.date),
      data: data.map((d) => parseFloat(d.revenue)),
      total: data.reduce((sum, d) => sum + parseFloat(d.revenue), 0),
      average:
        data.length > 0
          ? data.reduce((sum, d) => sum + parseFloat(d.revenue), 0) /
            data.length
          : 0,
    };
  }

  async getTopProducts(limit: number, period: string) {
    const { startDate, endDate } = this.parsePeriod(period);

    return await this.orderRepo
      .createQueryBuilder("order")
      .innerJoin("order.items", "item")
      .innerJoin("item.product", "product")
      .select("product.id", "id")
      .addSelect("product.name", "name")
      .addSelect("product.image", "image")
      .addSelect("SUM(item.quantity)", "soldCount")
      .addSelect("SUM(item.price * item.quantity)", "revenue")
      .where("order.status IN (:...statuses)", {
        statuses: ["completed", "delivered"],
      })
      .andWhere("order.created_at >= :start", { start: startDate })
      .andWhere("order.created_at <= :end", { end: endDate })
      .groupBy("product.id")
      .orderBy("soldCount", "DESC")
      .limit(limit)
      .getRawMany();
  }

  private calculateGrowth(current: number, previous: number): number {
    if (!previous) return 100;
    return ((current - previous) / previous) * 100;
  }

  private parsePeriod(period: string): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate(),
        );
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate: now };
  }
}
```

#### 2.3 Frontend Admin Analytics Integration

**fe-admin-laptop/src/lib/dashboard-service.ts**

```typescript
import api from "./api";

export interface DashboardOverview {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
}

export interface RevenueStats {
  labels: string[];
  data: number[];
  total: number;
  average: number;
}

export interface TopProduct {
  id: number;
  name: string;
  image: string;
  soldCount: number;
  revenue: number;
  category: string;
}

export const dashboardService = {
  getOverview: async (): Promise<DashboardOverview> => {
    const response = await api.get("/dashboard/overview");
    return response.data;
  },

  getRevenueStats: async (period: string = "30d"): Promise<RevenueStats> => {
    const response = await api.get(`/dashboard/revenue?period=${period}`);
    return response.data;
  },

  getOrderStats: async (period: string = "30d") => {
    const response = await api.get(`/dashboard/order-stats?period=${period}`);
    return response.data;
  },

  getTopProducts: async (
    limit: number = 10,
    period: string = "30d",
  ): Promise<TopProduct[]> => {
    const response = await api.get(
      `/dashboard/top-products?limit=${limit}&period=${period}`,
    );
    return response.data;
  },

  getInventoryAlerts: async () => {
    const response = await api.get("/dashboard/inventory-alerts");
    return response.data;
  },

  getWarrantyStats: async () => {
    const response = await api.get("/dashboard/warranty-stats");
    return response.data;
  },
};
```

**fe-admin-laptop/src/app/(dashboard)/page.tsx** (Update)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { dashboardService, DashboardOverview } from '@/lib/dashboard-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewData, revenueStats] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getRevenueStats('30d'),
      ]);
      setOverview(overviewData);
      setRevenueData(revenueStats);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Tổng doanh thu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {overview?.totalRevenue.toLocaleString('vi-VN')} đ
            </p>
            <p className="text-sm text-green-600">
              +{overview?.revenueGrowth.toFixed(1)}% so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tổng đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{overview?.totalOrders}</p>
            <p className="text-sm text-green-600">
              +{overview?.ordersGrowth.toFixed(1)}% so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Khách hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{overview?.totalCustomers}</p>
            <p className="text-sm text-green-600">
              +{overview?.customersGrowth.toFixed(1)}% so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{overview?.totalProducts}</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Doanh thu 30 ngày qua</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData?.labels.map((label: string, index: number) => ({
              date: label,
              revenue: revenueData.data[index],
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### 🟡 BƯỚC 3: CORE MODULES (5-7 ngày)

Sau khi Dashboard xong, tiếp tục implement:

1. **Product Module** (2 ngày)
   - Product CRUD
   - Category CRUD
   - Brand CRUD
   - Product search & filter
   - Product images

2. **Cart Module** (1 ngày)
   - Add to cart
   - Update cart
   - Remove from cart
   - Cart validation

3. **Order Module** (2 ngày)
   - Create order
   - Order status workflow
   - Order tracking
   - Cancel/Refund

4. **Payment Module** (1 ngày)
   - VietQR fake gateway
   - MoMo fake gateway
   - COD
   - Webhook handlers

5. **Inventory Module** (1 ngày)
   - Stock reservation
   - Import/Export
   - Low stock alerts

---

## 📝 CHECKLIST TRIỂN KHAI

### Phase 1: Backend Foundation

- [ ] Init NestJS project
- [ ] Setup Docker Compose (MySQL + Redis)
- [ ] Setup TypeORM
- [ ] Create database entities (User, Product, Order, etc.)
- [ ] Auth Module (Register, Login, JWT)
- [ ] User Module (CRUD, Profile)
- [ ] Global setup (Exception filter, Validation pipe, Swagger)

### Phase 2: Dashboard/Analytics

- [ ] Dashboard Module backend
- [ ] GET /api/dashboard/overview
- [ ] GET /api/dashboard/revenue
- [ ] GET /api/dashboard/order-stats
- [ ] GET /api/dashboard/top-products
- [ ] GET /api/dashboard/inventory-alerts
- [ ] GET /api/dashboard/warranty-stats
- [ ] Frontend dashboard service
- [ ] Frontend analytics page với charts
- [ ] Install Recharts: `npm install recharts`
- [ ] Test all endpoints

### Phase 3: Core Commerce

- [ ] Product Module
- [ ] Category Module
- [ ] Brand Module
- [ ] Cart Module
- [ ] Order Module
- [ ] Payment Module
- [ ] Inventory Module

### Phase 4: Advanced Features

- [ ] Notification Module (BullMQ + Socket.IO)
- [ ] Warranty Module
- [ ] PC Build Module
- [ ] Review Module
- [ ] Shipping Module

### Phase 5: Production Ready

- [ ] Security hardening
- [ ] Logging (Winston)
- [ ] Error monitoring (Sentry)
- [ ] Docker production build
- [ ] CI/CD (GitHub Actions)
- [ ] Deploy to Railway/Render
- [ ] Deploy FE to Vercel

---

## 🎯 HÀNH ĐỘNG TIẾP THEO (NGAY BÂY GIỜ)

### Option 1: Làm Dashboard trước (Recommended)

Vì bạn đã có FE Admin analytics page, nên:

1. **Setup Backend cơ bản** (4 giờ)
   - Init NestJS project
   - Setup Docker Compose
   - Setup TypeORM
   - Create basic entities

2. **Implement Dashboard Module** (4 giờ)
   - Dashboard service với mock data
   - Dashboard controller
   - 6 endpoints dashboard

3. **Connect FE Admin** (2 giờ)
   - Update dashboard service
   - Update analytics page
   - Test với real data

**Tổng: 1 ngày** → Có dashboard hoạt động end-to-end!

### Option 2: Làm Auth trước (Chuẩn hơn)

1. Setup Backend foundation
2. Auth Module hoàn chỉnh
3. Connect FE Client + FE Admin
4. Sau đó mới làm Dashboard

**Tổng: 2-3 ngày** → Có auth system hoàn chỉnh

---

## 💡 GỢI Ý CỦA TÔI

**Làm theo thứ tự này:**

1. **Ngày 1-2:** Setup Backend + Auth Module
2. **Ngày 3:** Dashboard Module (vì bạn đã có FE)
3. **Ngày 4-6:** Product + Cart + Order Module
4. **Ngày 7-8:** Payment + Inventory Module
5. **Ngày 9-10:** Notification + Advanced features
6. **Ngày 11-12:** Testing + Deploy

**Sau 12 ngày** → Bạn có một hệ thống hoàn chỉnh đạt chuẩn đi làm!

---

## 🤔 BẠN MUỐN BẮT ĐẦU TỪ ĐÂU?

1. **Setup Backend ngay** → Tôi sẽ tạo toàn bộ boilerplate code
2. **Làm Dashboard trước** → Tôi sẽ tạo Dashboard Module chi tiết
3. **Xem gap analysis chi tiết hơn** → Tôi sẽ audit từng module

Cho tôi biết bạn muốn làm gì tiếp theo! 🚀

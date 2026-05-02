# Core Commerce - Requirements Document

> **Feature:** Core Commerce Modules
> **Type:** Feature
> **Priority:** P0 (Critical)
> **Estimated Effort:** 20 days
> **Status:** Draft

---

## 1. INTRODUCTION

### 1.1 Overview

This requirements document specifies the Core Commerce functionality for the Smart Laptop Store platform. Phase 2 builds upon the Backend Foundation (Phase 1) to enable complete e-commerce operations including product catalog management, shopping cart, order processing, voucher system, and shipping management.

### 1.2 Business Context

With authentication and user management complete (Phase 1), the system now needs core commerce capabilities to enable customers to browse products, add items to cart, apply vouchers, checkout, and track orders. Staff need tools to manage products, categories, brands, suppliers, and process orders.

### 1.3 Goals

- Enable customers to browse and search products by category, brand, and specifications
- Enable customers to add products to cart and checkout with voucher support
- Enable customers to create orders and track order status
- Enable staff to manage product catalog (categories, brands, products, suppliers)
- Enable staff to process orders through the complete order lifecycle
- Enable shipping fee calculation and tracking
- Enable image upload to Cloudinary for product images

### 1.4 Success Criteria

- Customers can browse products with filters and search
- Customers can add products to cart and see cart totals
- Customers can apply vouchers and see discounts
- Customers can checkout and create orders
- Customers can view order history and track order status
- Staff can manage complete product catalog
- Staff can process orders through 9 status stages
- Product images are stored in Cloudinary
- Cart validates price consistency and stock availability
- Shipping fees are calculated based on weight and distance

---

## 2. GLOSSARY

- **Product_Catalog_System**: The backend system managing categories, brands, products, and suppliers
- **Cart_System**: The backend system managing shopping cart operations
- **Order_System**: The backend system managing order creation and lifecycle
- **Voucher_System**: The backend system managing discount vouchers
- **Shipping_System**: The backend system managing shipping calculations and tracking
- **Upload_System**: The backend system managing image uploads to Cloudinary
- **Customer**: User with role 'customer' who can browse and purchase products
- **Staff**: User with role 'staff' who can manage products and process orders
- **Admin**: User with role 'admin' who has full system access
- **Warehouse**: User with role 'warehouse' who manages inventory
- **Product_Specification**: Dynamic key-value pairs describing product technical details
- **Order_Status**: One of 9 states: pending, confirmed, processing, shipping, delivered, completed, cancelled, refunded, failed
- **Voucher_Type**: Either percentage_discount or fixed_amount_discount
- **Cart_Item**: A product with quantity in a customer's cart
- **Order_Item**: A product with quantity and price snapshot in an order

---

## 3. REQUIREMENTS

### Requirement 1: Category Management

**User Story:** As a Staff member, I want to manage product categories with tree structure, so that I can organize products hierarchically.

#### Acceptance Criteria

1. THE Product_Catalog_System SHALL provide category CRUD operations
2. WHEN a category is created, THE Product_Catalog_System SHALL allow setting a parent category
3. THE Product_Catalog_System SHALL support unlimited category nesting depth
4. WHEN a category has child categories, THE Product_Catalog_System SHALL prevent deletion
5. THE Product_Catalog_System SHALL return category tree structure with parent-child relationships
6. THE Product_Catalog_System SHALL validate category name uniqueness within the same parent

---

### Requirement 2: Brand Management

**User Story:** As a Staff member, I want to manage product brands, so that I can associate products with manufacturers.

#### Acceptance Criteria

1. THE Product_Catalog_System SHALL provide brand CRUD operations
2. THE Product_Catalog_System SHALL validate brand name uniqueness
3. WHEN a brand is created, THE Product_Catalog_System SHALL store brand name, logo URL, and description
4. WHEN a brand has associated products, THE Product_Catalog_System SHALL prevent deletion
5. THE Product_Catalog_System SHALL return paginated brand lists

---

### Requirement 3: Supplier Management

**User Story:** As a Staff member, I want to manage suppliers, so that I can track product sources.

#### Acceptance Criteria

1. THE Product_Catalog_System SHALL provide supplier CRUD operations
2. THE Product_Catalog_System SHALL store supplier name, contact person, email, phone, and address
3. THE Product_Catalog_System SHALL validate supplier email format
4. THE Product_Catalog_System SHALL validate supplier phone format
5. THE Product_Catalog_System SHALL return paginated supplier lists

---

### Requirement 4: Product Management

**User Story:** As a Staff member, I want to manage products with full details, so that customers can view and purchase laptops.

#### Acceptance Criteria

1. THE Product_Catalog_System SHALL provide product CRUD operations
2. WHEN a product is created, THE Product_Catalog_System SHALL require name, SKU, price, category, and brand
3. THE Product_Catalog_System SHALL validate SKU uniqueness
4. THE Product_Catalog_System SHALL store product name, SKU, description, price, stock quantity, category ID, brand ID, and supplier ID
5. THE Product_Catalog_System SHALL support product status: active, inactive, out_of_stock
6. WHEN a product is inactive, THE Product_Catalog_System SHALL exclude it from customer product listings
7. THE Product_Catalog_System SHALL return paginated product lists with category and brand details

---

### Requirement 5: Product Specifications Management

**User Story:** As a Staff member, I want to manage dynamic product specifications, so that I can describe technical details without schema changes.

#### Acceptance Criteria

1. THE Product_Catalog_System SHALL store product specifications as key-value pairs
2. WHEN specifications are added, THE Product_Catalog_System SHALL validate key is not empty
3. THE Product_Catalog_System SHALL allow multiple specifications per product
4. THE Product_Catalog_System SHALL return specifications with product details
5. THE Product_Catalog_System SHALL support specification updates and deletions

---

### Requirement 6: Product Images Management

**User Story:** As a Staff member, I want to manage multiple images per product, so that customers can view products from different angles.

#### Acceptance Criteria

1. THE Product_Catalog_System SHALL support multiple images per product
2. WHEN images are added, THE Product_Catalog_System SHALL store image URL and display order
3. THE Product_Catalog_System SHALL allow setting one image as primary
4. THE Product_Catalog_System SHALL return images sorted by display order
5. WHEN an image is deleted, THE Product_Catalog_System SHALL remove it from the product

---

### Requirement 7: Image Upload to Cloudinary

**User Story:** As a Staff member, I want to upload product images to Cloudinary, so that images are stored reliably and delivered via CDN.

#### Acceptance Criteria

1. THE Upload_System SHALL accept image file uploads
2. WHEN an image is uploaded, THE Upload_System SHALL validate file type is JPEG, PNG, or WebP
3. WHEN an image is uploaded, THE Upload_System SHALL validate file size is less than 5MB
4. THE Upload_System SHALL upload images to Cloudinary using configured credentials
5. THE Upload_System SHALL return Cloudinary public URL after successful upload
6. THE Upload_System SHALL provide image deletion endpoint
7. WHEN an image is deleted, THE Upload_System SHALL remove it from Cloudinary

---

### Requirement 8: Product Search

**User Story:** As a Customer, I want to search products by name or description, so that I can find specific laptops quickly.

#### Acceptance Criteria

1. THE Product_Catalog_System SHALL provide full-text search on product name and description
2. WHEN a search query is provided, THE Product_Catalog_System SHALL return matching products ranked by relevance
3. THE Product_Catalog_System SHALL support partial word matching
4. THE Product_Catalog_System SHALL return search results with pagination
5. WHEN search query is empty, THE Product_Catalog_System SHALL return all active products

---

### Requirement 9: Product Filtering

**User Story:** As a Customer, I want to filter products by category, brand, price range, and specifications, so that I can narrow down options.

#### Acceptance Criteria

1. THE Product_Catalog_System SHALL filter products by category ID
2. THE Product_Catalog_System SHALL filter products by brand ID
3. THE Product_Catalog_System SHALL filter products by minimum price
4. THE Product_Catalog_System SHALL filter products by maximum price
5. THE Product_Catalog_System SHALL filter products by specification key-value pairs
6. THE Product_Catalog_System SHALL support combining multiple filters with AND logic
7. THE Product_Catalog_System SHALL return filtered results with pagination

---

### Requirement 10: Product Sorting

**User Story:** As a Customer, I want to sort products by price, name, or creation date, so that I can browse in my preferred order.

#### Acceptance Criteria

1. THE Product_Catalog_System SHALL sort products by price ascending
2. THE Product_Catalog_System SHALL sort products by price descending
3. THE Product_Catalog_System SHALL sort products by name alphabetically
4. THE Product_Catalog_System SHALL sort products by creation date newest first
5. THE Product_Catalog_System SHALL sort products by creation date oldest first
6. WHEN no sort option is specified, THE Product_Catalog_System SHALL sort by creation date descending

---

### Requirement 11: Cart Operations

**User Story:** As a Customer, I want to add products to my cart, so that I can purchase multiple items together.

#### Acceptance Criteria

1. THE Cart_System SHALL allow authenticated customers to add products to cart
2. WHEN a product is added, THE Cart_System SHALL require product ID and quantity
3. WHEN a product is added, THE Cart_System SHALL validate quantity is greater than zero
4. WHEN a product already exists in cart, THE Cart_System SHALL update quantity instead of creating duplicate
5. THE Cart_System SHALL allow updating cart item quantity
6. THE Cart_System SHALL allow removing items from cart
7. THE Cart_System SHALL return cart with all items, quantities, and current prices

---

### Requirement 12: Cart Validation

**User Story:** As a Customer, I want my cart to validate prices and stock, so that I cannot checkout with outdated information.

#### Acceptance Criteria

1. WHEN cart is retrieved, THE Cart_System SHALL validate each item's price matches current product price
2. WHEN cart is retrieved, THE Cart_System SHALL validate each item's quantity does not exceed available stock
3. WHEN price mismatch is detected, THE Cart_System SHALL flag the item with price_changed indicator
4. WHEN stock insufficient is detected, THE Cart_System SHALL flag the item with stock_insufficient indicator
5. THE Cart_System SHALL calculate cart subtotal from current product prices
6. THE Cart_System SHALL return validation status with cart details

---

### Requirement 13: Voucher Management

**User Story:** As an Admin, I want to create and manage discount vouchers, so that I can run promotions.

#### Acceptance Criteria

1. THE Voucher_System SHALL provide voucher CRUD operations restricted to admin role
2. WHEN a voucher is created, THE Voucher_System SHALL require code, type, value, and expiry date
3. THE Voucher_System SHALL validate voucher code uniqueness
4. THE Voucher_System SHALL support voucher types: percentage_discount and fixed_amount_discount
5. THE Voucher_System SHALL store minimum order value requirement
6. THE Voucher_System SHALL store maximum usage limit per voucher
7. THE Voucher_System SHALL store maximum usage limit per customer
8. THE Voucher_System SHALL track current usage count

---

### Requirement 14: Voucher Validation

**User Story:** As a Customer, I want to apply vouchers to my order, so that I can receive discounts.

#### Acceptance Criteria

1. THE Voucher_System SHALL validate voucher code exists
2. WHEN a voucher is applied, THE Voucher_System SHALL validate expiry date has not passed
3. WHEN a voucher is applied, THE Voucher_System SHALL validate maximum usage limit has not been reached
4. WHEN a voucher is applied, THE Voucher_System SHALL validate customer has not exceeded per-customer usage limit
5. WHEN a voucher is applied, THE Voucher_System SHALL validate order subtotal meets minimum order value
6. WHEN voucher type is percentage_discount, THE Voucher_System SHALL calculate discount as percentage of subtotal
7. WHEN voucher type is fixed_amount_discount, THE Voucher_System SHALL apply fixed discount amount
8. THE Voucher_System SHALL return discount amount and final total

---

### Requirement 15: Order Creation

**User Story:** As a Customer, I want to create an order from my cart, so that I can purchase products.

#### Acceptance Criteria

1. THE Order_System SHALL allow authenticated customers to create orders from cart
2. WHEN an order is created, THE Order_System SHALL require shipping address ID
3. WHEN an order is created, THE Order_System SHALL validate cart is not empty
4. WHEN an order is created, THE Order_System SHALL validate all cart items have sufficient stock
5. THE Order_System SHALL create order with status pending
6. THE Order_System SHALL create order items with product ID, quantity, and price snapshot
7. THE Order_System SHALL calculate order subtotal, shipping fee, discount, and total
8. WHEN an order is created, THE Order_System SHALL clear the customer's cart
9. THE Order_System SHALL generate unique order number

---

### Requirement 16: Order Status Workflow

**User Story:** As a Staff member, I want to manage order status through lifecycle stages, so that orders are processed correctly.

#### Acceptance Criteria

1. THE Order_System SHALL support 9 order statuses: pending, confirmed, processing, shipping, delivered, completed, cancelled, refunded, failed
2. WHEN an order is created, THE Order_System SHALL set status to pending
3. THE Order_System SHALL allow staff to transition order from pending to confirmed
4. THE Order_System SHALL allow staff to transition order from confirmed to processing
5. THE Order_System SHALL allow staff to transition order from processing to shipping
6. THE Order_System SHALL allow staff to transition order from shipping to delivered
7. THE Order_System SHALL allow staff to transition order from delivered to completed
8. THE Order_System SHALL validate status transitions follow allowed workflow
9. THE Order_System SHALL record status change timestamp and user who made the change

---

### Requirement 17: Order Cancellation

**User Story:** As a Customer, I want to cancel my order before it's confirmed, so that I can change my mind.

#### Acceptance Criteria

1. WHEN order status is pending, THE Order_System SHALL allow customer to cancel their own order
2. THE Order_System SHALL allow staff to cancel orders at any status
3. WHEN an order is cancelled, THE Order_System SHALL set status to cancelled
4. WHEN an order is cancelled, THE Order_System SHALL restore product stock quantities
5. THE Order_System SHALL prevent cancellation of orders with status completed or refunded

---

### Requirement 18: Order Refund

**User Story:** As an Admin, I want to refund orders, so that I can handle returns and disputes.

#### Acceptance Criteria

1. THE Order_System SHALL allow admin role to refund orders
2. WHEN an order is refunded, THE Order_System SHALL set status to refunded
3. WHEN an order is refunded, THE Order_System SHALL restore product stock quantities
4. THE Order_System SHALL record refund reason and timestamp
5. THE Order_System SHALL prevent refunding orders with status pending or cancelled

---

### Requirement 19: Order History and Tracking

**User Story:** As a Customer, I want to view my order history and track order status, so that I know where my orders are.

#### Acceptance Criteria

1. THE Order_System SHALL return paginated list of customer's own orders
2. THE Order_System SHALL return order details including items, prices, status, and timestamps
3. THE Order_System SHALL return order status history with timestamps
4. THE Order_System SHALL filter orders by status
5. THE Order_System SHALL sort orders by creation date descending

---

### Requirement 20: Shipping Fee Calculation

**User Story:** As a Customer, I want shipping fees calculated based on weight and distance, so that I pay fair shipping costs.

#### Acceptance Criteria

1. THE Shipping_System SHALL calculate shipping fee based on total order weight
2. THE Shipping_System SHALL calculate shipping fee based on distance from warehouse to delivery address
3. WHEN total weight is less than 2kg, THE Shipping_System SHALL apply base rate
4. WHEN total weight is 2kg or more, THE Shipping_System SHALL apply weight-based rate
5. WHEN distance is less than 50km, THE Shipping_System SHALL apply local rate
6. WHEN distance is 50km or more, THE Shipping_System SHALL apply regional rate
7. THE Shipping_System SHALL return calculated shipping fee

---

### Requirement 21: Shipping Tracking

**User Story:** As a Customer, I want to track my shipment, so that I know when to expect delivery.

#### Acceptance Criteria

1. THE Shipping_System SHALL store tracking number for each order
2. THE Shipping_System SHALL allow staff to update shipping status
3. THE Shipping_System SHALL store estimated delivery date
4. THE Shipping_System SHALL store actual delivery date
5. THE Shipping_System SHALL return shipping tracking information with order details

---

### Requirement 22: Delivery Confirmation

**User Story:** As a Staff member, I want to confirm delivery, so that orders are marked as delivered.

#### Acceptance Criteria

1. THE Shipping_System SHALL allow staff to confirm delivery
2. WHEN delivery is confirmed, THE Shipping_System SHALL update order status to delivered
3. WHEN delivery is confirmed, THE Shipping_System SHALL record actual delivery timestamp
4. THE Shipping_System SHALL prevent delivery confirmation for orders not in shipping status

---

### Requirement 23: Frontend Homepage

**User Story:** As a Customer, I want to see featured products and categories on homepage, so that I can start browsing.

#### Acceptance Criteria

1. THE Client_Frontend SHALL display banner slider component
2. THE Client_Frontend SHALL display featured products section
3. THE Client_Frontend SHALL display categories grid
4. THE Client_Frontend SHALL fetch data from backend product APIs
5. THE Client_Frontend SHALL handle loading and error states

---

### Requirement 24: Frontend Product Listing

**User Story:** As a Customer, I want to browse products with filters and search, so that I can find laptops I want.

#### Acceptance Criteria

1. THE Client_Frontend SHALL display product listing page with grid layout
2. THE Client_Frontend SHALL provide category filter dropdown
3. THE Client_Frontend SHALL provide brand filter dropdown
4. THE Client_Frontend SHALL provide price range filter inputs
5. THE Client_Frontend SHALL provide search input with debouncing
6. THE Client_Frontend SHALL provide sort options dropdown
7. THE Client_Frontend SHALL display pagination controls
8. THE Client_Frontend SHALL fetch filtered products from backend API

---

### Requirement 25: Frontend Product Detail

**User Story:** As a Customer, I want to view product details with specifications and images, so that I can make informed decisions.

#### Acceptance Criteria

1. THE Client_Frontend SHALL display product detail page with name, price, description
2. THE Client_Frontend SHALL display product image gallery with primary image
3. THE Client_Frontend SHALL display product specifications table
4. THE Client_Frontend SHALL display add to cart button
5. THE Client_Frontend SHALL display stock availability indicator
6. THE Client_Frontend SHALL fetch product details from backend API

---

### Requirement 26: Frontend Cart

**User Story:** As a Customer, I want to view and manage my cart, so that I can review items before checkout.

#### Acceptance Criteria

1. THE Client_Frontend SHALL display cart drawer or sidebar component
2. THE Client_Frontend SHALL display cart items with product name, image, price, quantity
3. THE Client_Frontend SHALL provide quantity update controls
4. THE Client_Frontend SHALL provide remove item button
5. THE Client_Frontend SHALL display cart subtotal
6. THE Client_Frontend SHALL display validation warnings for price changes or stock issues
7. THE Client_Frontend SHALL fetch cart data from backend API

---

### Requirement 27: Frontend Checkout

**User Story:** As a Customer, I want to checkout with address and voucher, so that I can complete my purchase.

#### Acceptance Criteria

1. THE Client_Frontend SHALL display checkout page with multi-step flow
2. THE Client_Frontend SHALL display address selection or creation form
3. THE Client_Frontend SHALL display voucher input field
4. THE Client_Frontend SHALL display order summary with subtotal, shipping, discount, total
5. THE Client_Frontend SHALL display place order button
6. THE Client_Frontend SHALL validate all required fields before submission
7. THE Client_Frontend SHALL call backend order creation API

---

### Requirement 28: Frontend Order Pages

**User Story:** As a Customer, I want to view my orders and track status, so that I can monitor my purchases.

#### Acceptance Criteria

1. THE Client_Frontend SHALL display order list page with order cards
2. THE Client_Frontend SHALL display order status filter tabs
3. THE Client_Frontend SHALL display order detail page with items and status timeline
4. THE Client_Frontend SHALL display cancel order button for pending orders
5. THE Client_Frontend SHALL fetch order data from backend API

---

## 4. NON-FUNCTIONAL REQUIREMENTS

### 4.1 Performance

- Product listing API response time SHALL be less than 300ms for 50 products
- Product search API response time SHALL be less than 500ms
- Cart operations SHALL complete within 200ms
- Order creation SHALL complete within 1 second including stock validation
- Image upload to Cloudinary SHALL complete within 5 seconds for 5MB files

### 4.2 Scalability

- Product catalog SHALL support at least 10,000 products
- Cart system SHALL support concurrent cart operations from 1,000 users
- Order system SHALL handle 100 orders per minute
- Redis caching SHALL be used for frequently accessed product lists

### 4.3 Security

- All product management endpoints SHALL require staff or admin role
- All voucher management endpoints SHALL require admin role
- Cart operations SHALL require authentication
- Order operations SHALL require authentication
- Customers SHALL only access their own carts and orders
- Image uploads SHALL validate file type and size to prevent malicious uploads

### 4.4 Data Integrity

- Order creation SHALL use database transactions to ensure atomicity
- Stock quantity updates SHALL use row-level locking to prevent race conditions
- Price snapshots SHALL be stored in order items to preserve historical pricing
- Cart validation SHALL check current prices before checkout

### 4.5 Reliability

- Failed image uploads SHALL return descriptive error messages
- Out of stock products SHALL be clearly indicated to customers
- Invalid voucher codes SHALL return specific error reasons
- Order status transitions SHALL be validated to prevent invalid workflows

---

## 5. CONSTRAINTS

### 5.1 Technical Constraints

- Backend: NestJS + TypeORM + MySQL + Redis
- Frontend Client: Next.js 16 (port 3002)
- Frontend Admin: Next.js 16 (port 3003)
- Backend API: port 3001
- Image storage: Cloudinary (credentials in .env)
- Authentication: HTTP-only cookies from Phase 1

### 5.2 Business Constraints

- Shipping fee calculation uses simplified weight and distance formula
- Voucher usage limits are enforced at application level
- Order cancellation is only allowed for pending orders by customers
- Product specifications are stored as JSON for flexibility

### 5.3 Dependencies

- Phase 1 (Backend Foundation) must be complete
- Cloudinary account and credentials must be configured
- Redis must be running for cart caching

---

## 6. ASSUMPTIONS

- Product weights are stored in kilograms
- Shipping distances are calculated using simplified formula
- All prices are in VND (Vietnamese Dong)
- Product stock is managed manually by staff (no automatic reordering)
- One cart per customer (no multiple carts)
- Vouchers cannot be combined (one voucher per order)

---

## 7. RISKS

| Risk                                            | Impact | Probability | Mitigation                                 |
| ----------------------------------------------- | ------ | ----------- | ------------------------------------------ |
| Cloudinary API rate limits                      | Medium | Low         | Implement upload queue, cache URLs         |
| Concurrent cart updates causing race conditions | High   | Medium      | Use Redis locks for cart operations        |
| Stock overselling during high traffic           | High   | Medium      | Use database row locking for stock updates |
| Large product catalog slowing search            | Medium | High        | Implement full-text indexes, Redis caching |
| Invalid voucher codes causing checkout failures | Low    | Medium      | Validate vouchers before checkout page     |
| Image upload failures                           | Medium | Medium      | Implement retry logic, show clear errors   |

---

## 8. OUT OF SCOPE

The following are explicitly NOT included in Phase 2:

- ❌ Payment processing (Phase 3)
- ❌ Inventory reservation system (Phase 3)
- ❌ Product reviews and ratings (Phase 4)
- ❌ PC Build compatibility checker (Phase 4)
- ❌ Warranty management (Phase 4)
- ❌ Real-time notifications (Phase 5)
- ❌ Admin dashboard analytics (Phase 5)
- ❌ Email notifications for orders (Phase 5)
- ❌ Advanced shipping provider integration (future)
- ❌ Multi-currency support (future)

---

## 9. ACCEPTANCE CRITERIA SUMMARY

### Must Have (P0)

- ✅ Category, Brand, Supplier CRUD
- ✅ Product CRUD with specifications and images
- ✅ Product search, filter, sort, pagination
- ✅ Image upload to Cloudinary
- ✅ Cart operations (add, update, remove, get)
- ✅ Cart validation (price, stock)
- ✅ Voucher CRUD and validation
- ✅ Order creation from cart
- ✅ Order status workflow (9 statuses)
- ✅ Order cancellation and refund
- ✅ Shipping fee calculation
- ✅ Frontend homepage with products
- ✅ Frontend product listing and detail pages
- ✅ Frontend cart and checkout
- ✅ Frontend order pages

### Should Have (P1)

- ✅ Shipping tracking system
- ✅ Order history with filters
- ✅ Product specifications filtering
- ✅ Multiple images per product

### Nice to Have (P2)

- ⬜ Product recommendations
- ⬜ Recently viewed products
- ⬜ Wishlist functionality
- ⬜ Product comparison

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Author:** Development Team  
**Status:** Draft → Ready for Review

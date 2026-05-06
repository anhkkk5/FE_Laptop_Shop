# Requirements Document: Voucher/Promotion System

## Introduction

The Voucher/Promotion System is a comprehensive discount and promotion management feature for the Smart Laptop Store e-commerce platform. This system enables the business to create, manage, and apply various types of promotional offers to increase sales, reward customer loyalty, and drive marketing campaigns. The system integrates with existing Cart, Order, and Payment modules to provide seamless discount application and tracking.

## Glossary

- **Voucher_System**: The complete voucher and promotion management system
- **Voucher**: A promotional code that provides discounts or benefits when applied to an order
- **Voucher_Code**: A unique alphanumeric identifier used to apply a voucher
- **Discount_Engine**: The component responsible for calculating discount amounts
- **Usage_Tracker**: The component that monitors and enforces voucher usage limits
- **Cart_Module**: The existing shopping cart system that calculates subtotals
- **Order_Module**: The existing order management system that processes purchases
- **Payment_Module**: The existing payment processing system
- **Customer**: A user who can browse, collect, and apply vouchers
- **Admin**: A user who can create, manage, and monitor vouchers
- **Discount_Amount**: The monetary value reduced from the order total
- **Order_Total**: The final amount after all discounts are applied
- **Minimum_Order_Value**: The minimum cart subtotal required to use a voucher
- **Maximum_Discount_Cap**: The upper limit on discount amount for percentage-based vouchers
- **Usage_Limit**: The maximum number of times a voucher can be used
- **User_Usage_Limit**: The maximum number of times a single customer can use a voucher
- **Valid_Period**: The date range during which a voucher can be applied
- **Stackable_Voucher**: A voucher that can be combined with other vouchers
- **Voucher_Priority**: The order in which multiple vouchers are applied
- **Applicable_Products**: The specific products, categories, or brands a voucher can be applied to
- **Percentage_Discount**: A discount calculated as a percentage of the order value
- **Fixed_Discount**: A discount of a specific monetary amount
- **Free_Shipping_Voucher**: A voucher that waives shipping costs
- **Buy_X_Get_Y_Voucher**: A voucher that provides free items based on purchase quantity
- **First_Time_Customer**: A customer who has never completed an order
- **Voucher_Collection**: The act of a customer saving a voucher for later use
- **Concurrent_Application**: Multiple users attempting to use the same voucher simultaneously
- **Voucher_Analytics**: Usage statistics and reporting data for vouchers

## Requirements

### Requirement 1: Voucher Creation and Management

**User Story:** As an Admin, I want to create and configure vouchers with various discount types and constraints, so that I can run targeted marketing campaigns and promotions.

#### Acceptance Criteria

1. THE Voucher_System SHALL support creation of Percentage_Discount vouchers with discount rates between 1% and 100%
2. THE Voucher_System SHALL support creation of Fixed_Discount vouchers with discount amounts greater than zero
3. THE Voucher_System SHALL support creation of Free_Shipping_Voucher types
4. THE Voucher_System SHALL support creation of Buy_X_Get_Y_Voucher types with configurable buy and get quantities
5. WHEN an Admin creates a voucher, THE Voucher_System SHALL generate a unique Voucher_Code
6. WHEN an Admin creates a voucher, THE Voucher_System SHALL validate that the Voucher_Code does not already exist
7. THE Voucher_System SHALL allow Admins to set a Minimum_Order_Value constraint for each voucher
8. THE Voucher_System SHALL allow Admins to set a Maximum_Discount_Cap for Percentage_Discount vouchers
9. THE Voucher_System SHALL allow Admins to set a Usage_Limit for each voucher
10. THE Voucher_System SHALL allow Admins to set a User_Usage_Limit for each voucher
11. THE Voucher_System SHALL allow Admins to set a Valid_Period with start date and end date for each voucher
12. THE Voucher_System SHALL allow Admins to specify Applicable_Products by product IDs, category IDs, or brand IDs
13. THE Voucher_System SHALL allow Admins to mark vouchers as First_Time_Customer only
14. THE Voucher_System SHALL allow Admins to configure whether a voucher is a Stackable_Voucher
15. WHEN multiple Stackable_Voucher types exist, THE Voucher_System SHALL allow Admins to set Voucher_Priority values
16. THE Voucher_System SHALL allow Admins to update voucher configurations before the Valid_Period starts
17. THE Voucher_System SHALL prevent Admins from modifying core discount parameters after the Valid_Period starts
18. THE Voucher_System SHALL allow Admins to deactivate vouchers at any time

### Requirement 2: Voucher Discovery and Collection

**User Story:** As a Customer, I want to browse available vouchers and collect them to my account, so that I can use them when making purchases.

#### Acceptance Criteria

1. THE Voucher_System SHALL display all active vouchers within their Valid_Period
2. THE Voucher_System SHALL display voucher details including discount type, discount value, Minimum_Order_Value, and expiration date
3. WHEN a Customer views vouchers, THE Voucher_System SHALL indicate which vouchers the Customer has already collected
4. WHEN a Customer collects a voucher, THE Voucher_System SHALL save the Voucher_Collection to the Customer's account
5. WHEN a Customer collects a voucher, THE Voucher_System SHALL record the collection timestamp
6. THE Voucher_System SHALL allow Customers to view all their collected vouchers
7. THE Voucher_System SHALL display remaining usage count for vouchers with User_Usage_Limit
8. WHEN a voucher is marked First_Time_Customer only, THE Voucher_System SHALL only display it to Customers who have never completed an order
9. THE Voucher_System SHALL hide expired vouchers from the browsing interface
10. THE Voucher_System SHALL allow Customers to search vouchers by Voucher_Code

### Requirement 3: Voucher Application to Cart

**User Story:** As a Customer, I want to apply vouchers to my cart and see the discount preview, so that I can understand the savings before checkout.

#### Acceptance Criteria

1. WHEN a Customer enters a Voucher_Code in the cart, THE Voucher_System SHALL validate the voucher exists
2. WHEN a Customer applies a voucher, THE Voucher_System SHALL validate the voucher is within its Valid_Period
3. WHEN a Customer applies a voucher, THE Voucher_System SHALL validate the cart subtotal meets the Minimum_Order_Value
4. WHEN a Customer applies a voucher, THE Voucher_System SHALL validate the Customer has not exceeded the User_Usage_Limit
5. WHEN a Customer applies a voucher, THE Voucher_System SHALL validate the voucher has not exceeded the Usage_Limit
6. WHEN a Customer applies a First_Time_Customer voucher, THE Voucher_System SHALL validate the Customer has never completed an order
7. WHEN a voucher has Applicable_Products constraints, THE Voucher_System SHALL validate at least one cart item matches the constraints
8. WHEN a Customer applies a valid voucher, THE Cart_Module SHALL display the Discount_Amount preview
9. WHEN a Customer applies a Percentage_Discount voucher, THE Discount_Engine SHALL calculate the discount and apply the Maximum_Discount_Cap if specified
10. WHEN a Customer applies a Fixed_Discount voucher, THE Discount_Engine SHALL apply the full discount amount if cart subtotal allows
11. WHEN a Customer applies a Free_Shipping_Voucher, THE Cart_Module SHALL display shipping cost as zero
12. WHEN a Customer applies a Buy_X_Get_Y_Voucher, THE Discount_Engine SHALL calculate the discount based on eligible items and quantities
13. WHEN a Customer applies multiple Stackable_Voucher codes, THE Voucher_System SHALL apply all valid vouchers
14. WHEN a Customer applies a non-Stackable_Voucher, THE Voucher_System SHALL remove any previously applied vouchers
15. WHEN multiple Stackable_Voucher codes are applied, THE Discount_Engine SHALL apply discounts in Voucher_Priority order
16. THE Cart_Module SHALL display the Order_Total after all discounts are applied
17. WHEN a Customer removes items from cart, THE Voucher_System SHALL re-validate all applied vouchers
18. WHEN voucher validation fails after cart modification, THE Voucher_System SHALL remove the invalid voucher and notify the Customer
19. THE Voucher_System SHALL ensure the Order_Total never becomes negative after discount application

### Requirement 4: Voucher Validation Performance

**User Story:** As a Customer, I want voucher validation to be fast, so that my shopping experience is not interrupted.

#### Acceptance Criteria

1. WHEN a Customer applies a voucher, THE Voucher_System SHALL complete validation within 100 milliseconds for 95% of requests
2. WHEN the Voucher_System validates a voucher, THE system SHALL use database indexes on Voucher_Code for lookup
3. WHEN the Voucher_System checks Usage_Limit, THE system SHALL use cached counters when available
4. WHEN multiple vouchers are applied, THE Voucher_System SHALL validate them in parallel where possible

### Requirement 5: Checkout and Order Integration

**User Story:** As a Customer, I want applied vouchers to be honored during checkout, so that I receive the promised discount on my order.

#### Acceptance Criteria

1. WHEN a Customer proceeds to checkout, THE Voucher_System SHALL re-validate all applied vouchers
2. WHEN a voucher becomes invalid between cart and checkout, THE Voucher_System SHALL notify the Customer and remove the voucher
3. WHEN an order is created, THE Order_Module SHALL store all applied Voucher_Code values
4. WHEN an order is created, THE Order_Module SHALL store the total Discount_Amount
5. WHEN an order is created, THE Order_Module SHALL store individual discount amounts per voucher
6. WHEN an order is created, THE Payment_Module SHALL calculate the final payment amount as Order_Total minus Discount_Amount
7. WHEN an order is successfully paid, THE Usage_Tracker SHALL increment the voucher usage count
8. WHEN an order is successfully paid, THE Usage_Tracker SHALL increment the Customer's usage count for each applied voucher
9. IF an order payment fails, THEN THE Usage_Tracker SHALL not increment any usage counts
10. WHEN an order is cancelled, THE Usage_Tracker SHALL decrement the voucher usage count
11. WHEN an order is cancelled, THE Usage_Tracker SHALL decrement the Customer's usage count for each applied voucher

### Requirement 6: Concurrent Voucher Usage Handling

**User Story:** As the System, I want to handle concurrent voucher applications correctly, so that usage limits are never exceeded even under high load.

#### Acceptance Criteria

1. WHEN multiple Customers apply the same voucher simultaneously, THE Usage_Tracker SHALL use database transactions to prevent race conditions
2. WHEN a voucher reaches its Usage_Limit, THE Voucher_System SHALL prevent any additional applications
3. WHEN a Customer reaches their User_Usage_Limit, THE Voucher_System SHALL prevent additional applications by that Customer
4. WHEN Concurrent_Application occurs, THE Voucher_System SHALL use pessimistic locking or atomic counters for usage tracking
5. IF a voucher application fails due to Usage_Limit being reached during Concurrent_Application, THEN THE Voucher_System SHALL return a clear error message to the Customer

### Requirement 7: Auto-Apply Best Voucher

**User Story:** As a Customer, I want the system to suggest or auto-apply the best available voucher, so that I maximize my savings without manual comparison.

#### Acceptance Criteria

1. WHEN a Customer views their cart, THE Voucher_System SHALL identify all applicable vouchers from the Customer's Voucher_Collection
2. WHEN multiple vouchers are applicable, THE Discount_Engine SHALL calculate the Discount_Amount for each voucher
3. WHEN multiple vouchers are applicable, THE Voucher_System SHALL rank vouchers by Discount_Amount in descending order
4. THE Voucher_System SHALL display a suggestion to the Customer showing the best available voucher
5. THE Voucher_System SHALL allow Customers to accept the auto-apply suggestion with one click
6. WHEN Stackable_Voucher options exist, THE Discount_Engine SHALL calculate the optimal combination of vouchers
7. WHEN suggesting voucher combinations, THE Voucher_System SHALL respect Voucher_Priority rules

### Requirement 8: Voucher Analytics and Reporting

**User Story:** As an Admin, I want to view voucher usage statistics and analytics, so that I can measure campaign effectiveness and make data-driven decisions.

#### Acceptance Criteria

1. THE Voucher_System SHALL track total usage count for each voucher
2. THE Voucher_System SHALL track total Discount_Amount provided by each voucher
3. THE Voucher_System SHALL track the number of unique Customers who used each voucher
4. THE Voucher_System SHALL track the number of orders associated with each voucher
5. THE Voucher_System SHALL calculate the average order value for orders using each voucher
6. THE Voucher_System SHALL display remaining usage count for vouchers with Usage_Limit
7. THE Voucher_System SHALL display the conversion rate (collections to actual usage) for each voucher
8. THE Voucher_System SHALL allow Admins to filter Voucher_Analytics by date range
9. THE Voucher_System SHALL allow Admins to export Voucher_Analytics data in CSV format
10. THE Voucher_System SHALL display real-time usage statistics with a maximum delay of 5 minutes

### Requirement 9: Voucher Abuse Prevention

**User Story:** As the System, I want to prevent voucher abuse and fraud, so that the business does not suffer financial losses.

#### Acceptance Criteria

1. THE Voucher_System SHALL enforce User_Usage_Limit per Customer account
2. THE Voucher_System SHALL enforce Usage_Limit per voucher across all Customers
3. WHEN a voucher is outside its Valid_Period, THE Voucher_System SHALL reject application attempts
4. WHEN a cart does not meet Minimum_Order_Value, THE Voucher_System SHALL reject the voucher
5. WHEN Applicable_Products constraints are not met, THE Voucher_System SHALL reject the voucher
6. THE Voucher_System SHALL log all voucher application attempts including Customer ID, Voucher_Code, timestamp, and result
7. THE Voucher_System SHALL detect and flag suspicious patterns such as multiple failed application attempts
8. WHEN a Customer attempts to apply the same invalid voucher more than 5 times within 10 minutes, THE Voucher_System SHALL temporarily block voucher applications for that Customer
9. THE Voucher_System SHALL prevent voucher application if the resulting Order_Total would be less than zero

### Requirement 10: Discount Calculation Accuracy

**User Story:** As a Customer, I want discount calculations to be accurate and transparent, so that I trust the pricing and understand my savings.

#### Acceptance Criteria

1. WHEN a Percentage_Discount voucher is applied, THE Discount_Engine SHALL calculate the discount as (cart_subtotal × discount_percentage / 100)
2. WHEN a Percentage_Discount voucher has a Maximum_Discount_Cap, THE Discount_Engine SHALL apply the minimum of (calculated_discount, Maximum_Discount_Cap)
3. WHEN a Fixed_Discount voucher is applied, THE Discount_Engine SHALL apply the full discount amount if cart subtotal is greater than or equal to the discount amount
4. WHEN a Fixed_Discount voucher amount exceeds the cart subtotal, THE Discount_Engine SHALL apply a discount equal to (cart_subtotal - 1) to ensure Order_Total remains positive
5. WHEN a Buy_X_Get_Y_Voucher is applied, THE Discount_Engine SHALL identify eligible items based on Applicable_Products constraints
6. WHEN a Buy_X_Get_Y_Voucher is applied, THE Discount_Engine SHALL calculate the discount as the price of Y cheapest eligible items when X or more eligible items are in the cart
7. WHEN multiple Stackable_Voucher codes are applied, THE Discount_Engine SHALL apply each discount sequentially based on Voucher_Priority
8. WHEN calculating sequential discounts, THE Discount_Engine SHALL apply each subsequent discount to the reduced total from the previous discount
9. THE Discount_Engine SHALL round all Discount_Amount values to 2 decimal places
10. THE Cart_Module SHALL display a breakdown showing original subtotal, each applied discount, and final Order_Total

### Requirement 11: Voucher Expiration and Cleanup

**User Story:** As an Admin, I want expired vouchers to be automatically handled, so that the system remains clean and customers are not confused.

#### Acceptance Criteria

1. WHEN the current date is after a voucher's Valid_Period end date, THE Voucher_System SHALL mark the voucher as expired
2. THE Voucher_System SHALL automatically check for expired vouchers daily at midnight
3. WHEN a voucher expires, THE Voucher_System SHALL remove it from the active voucher browsing interface
4. WHEN a voucher expires, THE Voucher_System SHALL retain the voucher data for Voucher_Analytics purposes
5. THE Voucher_System SHALL allow Admins to view expired vouchers in a separate archived section
6. WHEN a Customer has collected an expired voucher, THE Voucher_System SHALL display it as expired in the Customer's voucher list
7. WHEN a Customer attempts to apply an expired voucher, THE Voucher_System SHALL return an error message indicating the voucher has expired

### Requirement 12: API Integration and Error Handling

**User Story:** As a Developer, I want clear API endpoints and error responses for voucher operations, so that I can integrate the frontend seamlessly.

#### Acceptance Criteria

1. THE Voucher_System SHALL provide a REST API endpoint for creating vouchers (Admin only)
2. THE Voucher_System SHALL provide a REST API endpoint for updating vouchers (Admin only)
3. THE Voucher_System SHALL provide a REST API endpoint for listing active vouchers
4. THE Voucher_System SHALL provide a REST API endpoint for collecting vouchers (Customer)
5. THE Voucher_System SHALL provide a REST API endpoint for applying vouchers to cart (Customer)
6. THE Voucher_System SHALL provide a REST API endpoint for removing vouchers from cart (Customer)
7. THE Voucher_System SHALL provide a REST API endpoint for validating vouchers without applying them
8. THE Voucher_System SHALL provide a REST API endpoint for retrieving Voucher_Analytics (Admin only)
9. WHEN a voucher operation fails, THE Voucher_System SHALL return an HTTP error code appropriate to the failure type
10. WHEN a voucher operation fails, THE Voucher_System SHALL return a JSON response with a clear error message and error code
11. WHEN a voucher does not exist, THE Voucher_System SHALL return HTTP 404 with error code "VOUCHER_NOT_FOUND"
12. WHEN a voucher is expired, THE Voucher_System SHALL return HTTP 400 with error code "VOUCHER_EXPIRED"
13. WHEN a voucher usage limit is exceeded, THE Voucher_System SHALL return HTTP 400 with error code "USAGE_LIMIT_EXCEEDED"
14. WHEN minimum order value is not met, THE Voucher_System SHALL return HTTP 400 with error code "MINIMUM_ORDER_NOT_MET"
15. WHEN applicable products constraint is not met, THE Voucher_System SHALL return HTTP 400 with error code "PRODUCTS_NOT_APPLICABLE"

### Requirement 13: Database Schema and Data Integrity

**User Story:** As a Developer, I want a well-designed database schema for vouchers, so that data integrity is maintained and queries are efficient.

#### Acceptance Criteria

1. THE Voucher_System SHALL store voucher data in a dedicated database table with Voucher_Code as the primary key
2. THE Voucher_System SHALL enforce uniqueness constraint on Voucher_Code at the database level
3. THE Voucher_System SHALL store voucher usage data in a separate table linking Customer ID, Voucher_Code, Order ID, and usage timestamp
4. THE Voucher_System SHALL store voucher collection data in a separate table linking Customer ID, Voucher_Code, and collection timestamp
5. THE Voucher_System SHALL use database indexes on Voucher_Code for fast lookup
6. THE Voucher_System SHALL use database indexes on Valid_Period dates for efficient expiration queries
7. THE Voucher_System SHALL use database indexes on Customer ID in usage and collection tables for efficient user-specific queries
8. THE Voucher_System SHALL use foreign key constraints to maintain referential integrity between vouchers, orders, and customers
9. WHEN an order is deleted, THE Voucher_System SHALL retain voucher usage records for audit purposes
10. THE Voucher_System SHALL use database transactions to ensure atomicity of voucher application and usage tracking

### Requirement 14: Notification and Communication

**User Story:** As a Customer, I want to be notified about voucher-related events, so that I can take advantage of promotions and understand discount changes.

#### Acceptance Criteria

1. WHEN a Customer successfully collects a voucher, THE Voucher_System SHALL display a success confirmation message
2. WHEN a Customer successfully applies a voucher, THE Voucher_System SHALL display the Discount_Amount and updated Order_Total
3. WHEN a voucher application fails, THE Voucher_System SHALL display a clear error message explaining the reason
4. WHEN a voucher is removed due to cart changes, THE Voucher_System SHALL notify the Customer with the reason for removal
5. WHEN a collected voucher is about to expire within 3 days, THE Voucher_System SHALL send a reminder notification to the Customer
6. WHEN a voucher reaches 90% of its Usage_Limit, THE Voucher_System SHALL notify Admins
7. THE Voucher_System SHALL allow Admins to send promotional notifications about new vouchers to Customers

### Requirement 15: Mobile and Responsive Support

**User Story:** As a Customer, I want to use vouchers on mobile devices, so that I can shop and save from anywhere.

#### Acceptance Criteria

1. THE Voucher_System SHALL provide API endpoints that support both web and mobile clients
2. THE Voucher_System SHALL return voucher data in a format suitable for mobile rendering
3. WHEN a Customer applies a voucher on mobile, THE Voucher_System SHALL complete the operation with the same performance as web (within 100ms)
4. THE Voucher_System SHALL support QR code scanning for voucher application on mobile devices
5. WHEN a voucher has a QR code, THE Voucher_System SHALL generate and store the QR code data

## Notes

### Parser and Serializer Requirements

This feature does not require custom parsers or serializers. All data exchange uses standard JSON serialization provided by NestJS and TypeORM.

### Testing Considerations

The following areas are critical for property-based testing:

- **Discount calculation logic**: Test with various cart values, discount percentages, and caps
- **Voucher stacking logic**: Test combinations of stackable vouchers with different priorities
- **Concurrent usage tracking**: Test race conditions with multiple simultaneous applications
- **Validation rules**: Test all constraint combinations (dates, limits, products, customers)

### Integration Dependencies

This feature integrates with:

- **Cart Module**: For discount preview and total calculation
- **Order Module**: For storing applied vouchers and final discount amounts
- **Payment Module**: For calculating final payment amount after discounts
- **Customer Module**: For tracking first-time customers and user-specific usage limits
- **Product Module**: For validating applicable products constraints

### Performance Targets

- Voucher validation: < 100ms (95th percentile)
- Discount calculation: < 50ms
- Analytics query: < 500ms for 30-day range
- Concurrent usage tracking: Support 100 simultaneous applications per voucher

### Security Considerations

- Admin-only endpoints must enforce role-based access control
- Voucher usage logs must be immutable for audit purposes
- Rate limiting should be applied to voucher application endpoints
- Sensitive voucher data (usage limits, analytics) should only be visible to admins

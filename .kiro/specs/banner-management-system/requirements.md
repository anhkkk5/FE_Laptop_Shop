# Requirements Document - Banner Management System

> **Feature:** Banner Management System
> **Type:** Feature
> **Priority:** P1 (High)
> **Estimated Effort:** 8 days
> **Status:** Draft

---

## 1. INTRODUCTION

### 1.1 Overview

This requirements document specifies the Banner Management System for the Smart Laptop Store platform. The system enables administrators to upload, manage, and display promotional banners across the customer-facing website, with a modern homepage UI inspired by Thế Giới Di Động (TGDĐ).

### 1.2 Business Context

The e-commerce platform needs an attractive, dynamic homepage with promotional banners to drive sales and highlight special offers. Administrators need tools to manage banner content without developer intervention, including image uploads, positioning, scheduling, and performance tracking.

### 1.3 Goals

- Enable administrators to upload banner images directly (not via URL input)
- Enable administrators to manage banner placement, ordering, and visibility
- Enable administrators to schedule banners with start and end dates
- Enable customers to view attractive homepage with hero carousels, flash sale banners, and category sections
- Enable responsive banner display optimized for mobile and desktop
- Enable automatic image optimization for performance

### 1.4 Success Criteria

- Administrators can upload banner images through admin panel
- Administrators can create, update, and delete banners with full metadata
- Administrators can preview banners before publishing
- Customers see responsive homepage with hero carousel, flash sale section, and category banners
- Banner images are automatically optimized for different screen sizes
- Homepage loads within 2 seconds on 3G connection
- Banners automatically show/hide based on scheduled dates

---

## 2. GLOSSARY

- **Banner_Management_System**: The backend system managing banner CRUD operations, file uploads, and scheduling
- **Banner_Display_System**: The frontend system rendering banners on customer-facing pages
- **Image_Upload_System**: The backend system handling image file uploads to Cloudinary
- **Admin**: User with role 'admin' who can manage all banners
- **Customer**: User browsing the customer-facing website
- **Banner_Position**: Placement location on page: hero, flash_sale, category_section, sidebar, footer
- **Banner_Type**: Classification of banner: promotion, category_highlight, product_highlight, brand_campaign
- **Banner_Status**: State of banner: draft, active, inactive, scheduled, expired
- **Hero_Carousel**: Large rotating banner section at top of homepage
- **Flash_Sale_Section**: Promotional banner area with countdown timer
- **Category_Section**: Banner grid organized by product categories
- **Responsive_Image**: Image with multiple size variants for different devices
- **Cloudinary**: Cloud-based image storage and optimization service
- **Display_Order**: Integer determining banner sequence within same position

---

## 3. REQUIREMENTS

### Requirement 1: Banner Image Upload

**User Story:** As an Admin, I want to upload banner images directly from my computer, so that I can create promotional banners without needing image URLs.

#### Acceptance Criteria

1. THE Image_Upload_System SHALL accept image file uploads from authenticated admin users
2. WHEN an image is uploaded, THE Image_Upload_System SHALL validate file type is JPEG, PNG, WebP, or GIF
3. WHEN an image is uploaded, THE Image_Upload_System SHALL validate file size is less than 10MB
4. WHEN an image is uploaded, THE Image_Upload_System SHALL validate image dimensions are at least 800x400 pixels
5. THE Image_Upload_System SHALL upload images to Cloudinary using configured credentials
6. THE Image_Upload_System SHALL generate responsive image variants for mobile (640px), tablet (1024px), and desktop (1920px) widths
7. THE Image_Upload_System SHALL return Cloudinary public URL and responsive variant URLs after successful upload
8. WHEN upload fails, THE Image_Upload_System SHALL return descriptive error message indicating failure reason

---

### Requirement 2: Banner Creation

**User Story:** As an Admin, I want to create banners with full metadata, so that I can control how and when banners appear.

#### Acceptance Criteria

1. THE Banner_Management_System SHALL provide banner creation endpoint restricted to admin role
2. WHEN a banner is created, THE Banner_Management_System SHALL require title, image URL, position, and type
3. THE Banner_Management_System SHALL store banner title, description, image URL, responsive image URLs, position, type, status, display order, link URL, start date, and end date
4. THE Banner_Management_System SHALL validate position is one of: hero, flash_sale, category_section, sidebar, footer
5. THE Banner_Management_System SHALL validate type is one of: promotion, category_highlight, product_highlight, brand_campaign
6. THE Banner_Management_System SHALL validate status is one of: draft, active, inactive, scheduled, expired
7. WHEN start date is provided, THE Banner_Management_System SHALL validate start date is not in the past
8. WHEN end date is provided, THE Banner_Management_System SHALL validate end date is after start date
9. WHEN a banner is created, THE Banner_Management_System SHALL set status to draft by default
10. THE Banner_Management_System SHALL generate unique banner ID

---

### Requirement 3: Banner Update

**User Story:** As an Admin, I want to update banner details, so that I can modify promotional content without recreating banners.

#### Acceptance Criteria

1. THE Banner_Management_System SHALL provide banner update endpoint restricted to admin role
2. THE Banner_Management_System SHALL allow updating title, description, image URL, position, type, status, display order, link URL, start date, and end date
3. WHEN a banner is updated, THE Banner_Management_System SHALL validate all fields using same rules as creation
4. THE Banner_Management_System SHALL record last updated timestamp
5. WHEN image URL is changed, THE Banner_Management_System SHALL preserve old image URL in history

---

### Requirement 4: Banner Deletion

**User Story:** As an Admin, I want to delete banners, so that I can remove outdated promotional content.

#### Acceptance Criteria

1. THE Banner_Management_System SHALL provide banner deletion endpoint restricted to admin role
2. WHEN a banner is deleted, THE Banner_Management_System SHALL perform soft delete by setting deleted_at timestamp
3. THE Banner_Management_System SHALL exclude soft-deleted banners from all listing queries
4. THE Banner_Management_System SHALL allow hard delete to permanently remove banner and associated images from Cloudinary

---

### Requirement 5: Banner Listing and Filtering

**User Story:** As an Admin, I want to view and filter banners, so that I can manage large numbers of promotional banners efficiently.

#### Acceptance Criteria

1. THE Banner_Management_System SHALL return paginated list of banners
2. THE Banner_Management_System SHALL filter banners by position
3. THE Banner_Management_System SHALL filter banners by type
4. THE Banner_Management_System SHALL filter banners by status
5. THE Banner_Management_System SHALL sort banners by display order ascending
6. THE Banner_Management_System SHALL sort banners by creation date descending
7. THE Banner_Management_System SHALL return banner list with image URLs and metadata

---

### Requirement 6: Banner Display Order Management

**User Story:** As an Admin, I want to set banner display order, so that I can control the sequence of banners in each position.

#### Acceptance Criteria

1. THE Banner_Management_System SHALL store display order as integer for each banner
2. WHEN display order is not specified, THE Banner_Management_System SHALL assign next available order number within position
3. THE Banner_Management_System SHALL allow updating display order
4. WHEN display order conflicts with existing banner, THE Banner_Management_System SHALL reorder other banners to maintain sequence
5. THE Banner_Display_System SHALL render banners sorted by display order ascending within each position

---

### Requirement 7: Banner Status Management

**User Story:** As an Admin, I want to activate or deactivate banners, so that I can control banner visibility without deletion.

#### Acceptance Criteria

1. THE Banner_Management_System SHALL allow admin to change banner status
2. WHEN status is changed to active, THE Banner_Management_System SHALL validate banner has required fields populated
3. WHEN status is changed to active, THE Banner_Management_System SHALL validate image URL is accessible
4. THE Banner_Display_System SHALL only display banners with status active or scheduled
5. WHEN status is inactive or draft, THE Banner_Display_System SHALL exclude banner from customer-facing pages

---

### Requirement 8: Banner Scheduling

**User Story:** As an Admin, I want to schedule banners with start and end dates, so that promotional campaigns run automatically.

#### Acceptance Criteria

1. THE Banner_Management_System SHALL store start date and end date for each banner
2. WHEN start date is set and current time is before start date, THE Banner_Management_System SHALL set status to scheduled
3. WHEN start date is set and current time is after start date, THE Banner_Management_System SHALL set status to active
4. WHEN end date is set and current time is after end date, THE Banner_Management_System SHALL set status to expired
5. THE Banner_Management_System SHALL run scheduled job every 5 minutes to update banner statuses based on dates
6. THE Banner_Display_System SHALL only display banners where current time is between start date and end date

---

### Requirement 9: Banner Link Management

**User Story:** As an Admin, I want to set destination URLs for banners, so that customers are directed to relevant pages when clicking banners.

#### Acceptance Criteria

1. THE Banner_Management_System SHALL store link URL for each banner
2. WHEN link URL is provided, THE Banner_Management_System SHALL validate URL format
3. THE Banner_Management_System SHALL support internal links (relative paths) and external links (absolute URLs)
4. THE Banner_Display_System SHALL render banners as clickable links when link URL is provided
5. WHEN link URL is external, THE Banner_Display_System SHALL open link in new tab

---

### Requirement 10: Banner Preview

**User Story:** As an Admin, I want to preview banners before publishing, so that I can verify appearance and layout.

#### Acceptance Criteria

1. THE Banner_Management_System SHALL provide preview endpoint that returns banner data including draft banners
2. THE Admin_Frontend SHALL display preview modal showing banner at actual size for desktop and mobile
3. THE Admin_Frontend SHALL display banner metadata in preview including title, position, and link URL
4. THE Admin_Frontend SHALL allow admin to preview banner without changing status to active

---

### Requirement 11: Image Optimization

**User Story:** As a Customer, I want banner images to load quickly, so that I have smooth browsing experience.

#### Acceptance Criteria

1. THE Image_Upload_System SHALL generate WebP format variants for all uploaded images
2. THE Image_Upload_System SHALL compress images to reduce file size while maintaining visual quality
3. THE Image_Upload_System SHALL generate responsive image variants at 640px, 1024px, and 1920px widths
4. THE Banner_Display_System SHALL use responsive image srcset to serve appropriate size based on device
5. THE Banner_Display_System SHALL lazy load banners below the fold
6. THE Banner_Display_System SHALL use WebP format with JPEG fallback for browser compatibility

---

### Requirement 12: Hero Carousel Display

**User Story:** As a Customer, I want to see large rotating banners at top of homepage, so that I can discover current promotions.

#### Acceptance Criteria

1. THE Banner_Display_System SHALL display hero carousel component at top of homepage
2. THE Banner_Display_System SHALL fetch active banners with position hero
3. THE Banner_Display_System SHALL render banners in carousel with automatic rotation every 5 seconds
4. THE Banner_Display_System SHALL display navigation dots indicating total banners and current position
5. THE Banner_Display_System SHALL display previous and next arrow controls
6. THE Banner_Display_System SHALL pause carousel rotation when user hovers over banner
7. THE Banner_Display_System SHALL support swipe gestures on mobile devices
8. WHEN only one hero banner exists, THE Banner_Display_System SHALL display static banner without carousel controls

---

### Requirement 13: Flash Sale Section Display

**User Story:** As a Customer, I want to see flash sale banners with countdown timers, so that I can take advantage of limited-time offers.

#### Acceptance Criteria

1. THE Banner_Display_System SHALL display flash sale section below hero carousel
2. THE Banner_Display_System SHALL fetch active banners with position flash_sale
3. THE Banner_Display_System SHALL render banners in horizontal scrollable layout
4. WHEN banner has end date, THE Banner_Display_System SHALL display countdown timer showing time remaining
5. THE Banner_Display_System SHALL update countdown timer every second
6. WHEN countdown reaches zero, THE Banner_Display_System SHALL hide banner from display
7. THE Banner_Display_System SHALL display "Giảm đến X%" badge when banner description contains discount percentage

---

### Requirement 14: Category Section Display

**User Story:** As a Customer, I want to see category-specific banners, so that I can browse products by category.

#### Acceptance Criteria

1. THE Banner_Display_System SHALL display category section below flash sale section
2. THE Banner_Display_System SHALL fetch active banners with position category_section
3. THE Banner_Display_System SHALL render banners in responsive grid layout (3 columns desktop, 2 columns tablet, 1 column mobile)
4. THE Banner_Display_System SHALL display category name overlay on each banner
5. THE Banner_Display_System SHALL apply hover effect showing scale animation on desktop

---

### Requirement 15: Sidebar Banner Display

**User Story:** As a Customer, I want to see sidebar banners on product pages, so that I can discover related promotions while browsing.

#### Acceptance Criteria

1. THE Banner_Display_System SHALL display sidebar banners on product listing and detail pages
2. THE Banner_Display_System SHALL fetch active banners with position sidebar
3. THE Banner_Display_System SHALL render banners vertically stacked in sidebar
4. THE Banner_Display_System SHALL limit sidebar to maximum 3 banners
5. WHEN viewport width is less than 768px, THE Banner_Display_System SHALL hide sidebar banners

---

### Requirement 16: Footer Banner Display

**User Story:** As a Customer, I want to see footer banners, so that I can discover additional promotions at bottom of page.

#### Acceptance Criteria

1. THE Banner_Display_System SHALL display footer banners above site footer
2. THE Banner_Display_System SHALL fetch active banners with position footer
3. THE Banner_Display_System SHALL render banners in horizontal layout
4. THE Banner_Display_System SHALL display maximum 2 footer banners side by side on desktop
5. WHEN viewport width is less than 768px, THE Banner_Display_System SHALL stack footer banners vertically

---

### Requirement 17: Banner Click Tracking

**User Story:** As an Admin, I want to track banner clicks, so that I can measure promotional campaign effectiveness.

#### Acceptance Criteria

1. WHEN a customer clicks a banner, THE Banner_Display_System SHALL send click event to backend
2. THE Banner_Management_System SHALL increment click count for the banner
3. THE Banner_Management_System SHALL record click timestamp and user ID if authenticated
4. THE Banner_Management_System SHALL provide analytics endpoint returning click counts per banner
5. THE Admin_Frontend SHALL display click statistics on banner list page

---

### Requirement 18: Banner Impression Tracking

**User Story:** As an Admin, I want to track banner impressions, so that I can calculate click-through rates.

#### Acceptance Criteria

1. WHEN a banner enters viewport, THE Banner_Display_System SHALL send impression event to backend
2. THE Banner_Management_System SHALL increment impression count for the banner
3. THE Banner_Management_System SHALL record impression timestamp
4. THE Banner_Management_System SHALL calculate click-through rate as clicks divided by impressions
5. THE Admin_Frontend SHALL display impression statistics and CTR on banner list page

---

### Requirement 19: Admin Banner Management UI

**User Story:** As an Admin, I want intuitive banner management interface, so that I can manage banners efficiently.

#### Acceptance Criteria

1. THE Admin_Frontend SHALL display banner list page with table showing title, position, status, display order, and actions
2. THE Admin_Frontend SHALL provide create banner button opening modal form
3. THE Admin_Frontend SHALL provide edit button for each banner opening modal form with pre-filled data
4. THE Admin_Frontend SHALL provide delete button with confirmation dialog
5. THE Admin_Frontend SHALL provide status toggle switch for quick activation/deactivation
6. THE Admin_Frontend SHALL provide drag-and-drop interface for reordering banners within position
7. THE Admin_Frontend SHALL display banner thumbnail in list view
8. THE Admin_Frontend SHALL provide filter dropdowns for position, type, and status

---

### Requirement 20: Admin Banner Form

**User Story:** As an Admin, I want comprehensive banner creation form, so that I can set all banner properties.

#### Acceptance Criteria

1. THE Admin_Frontend SHALL display banner form with fields for title, description, position, type, status, display order, link URL, start date, and end date
2. THE Admin_Frontend SHALL provide image upload dropzone with drag-and-drop support
3. THE Admin_Frontend SHALL display upload progress indicator during image upload
4. THE Admin_Frontend SHALL display image preview after successful upload
5. THE Admin_Frontend SHALL validate all required fields before submission
6. THE Admin_Frontend SHALL display validation errors inline below each field
7. THE Admin_Frontend SHALL provide date picker components for start date and end date
8. THE Admin_Frontend SHALL provide URL input with validation for link URL

---

### Requirement 21: Responsive Homepage Layout

**User Story:** As a Customer, I want homepage to look great on all devices, so that I can browse comfortably on mobile or desktop.

#### Acceptance Criteria

1. THE Banner_Display_System SHALL render homepage with responsive layout adapting to viewport width
2. WHEN viewport width is 1920px or more, THE Banner_Display_System SHALL display hero carousel at full width with maximum 1920px container
3. WHEN viewport width is between 768px and 1919px, THE Banner_Display_System SHALL display hero carousel at full width with padding
4. WHEN viewport width is less than 768px, THE Banner_Display_System SHALL display hero carousel at full width without padding
5. THE Banner_Display_System SHALL use CSS Grid for category section with responsive column counts
6. THE Banner_Display_System SHALL ensure all interactive elements have minimum 44x44px touch target on mobile

---

### Requirement 22: Banner Image Deletion

**User Story:** As an Admin, I want to delete banner images from Cloudinary, so that I can free up storage space.

#### Acceptance Criteria

1. THE Image_Upload_System SHALL provide image deletion endpoint restricted to admin role
2. WHEN an image is deleted, THE Image_Upload_System SHALL remove image and all variants from Cloudinary
3. WHEN a banner is hard deleted, THE Banner_Management_System SHALL automatically delete associated images from Cloudinary
4. THE Image_Upload_System SHALL return success confirmation after deletion
5. WHEN deletion fails, THE Image_Upload_System SHALL return error message without affecting banner record

---

### Requirement 23: Banner Duplicate

**User Story:** As an Admin, I want to duplicate existing banners, so that I can create similar banners quickly.

#### Acceptance Criteria

1. THE Banner_Management_System SHALL provide banner duplication endpoint restricted to admin role
2. WHEN a banner is duplicated, THE Banner_Management_System SHALL create new banner with same properties except ID and timestamps
3. THE Banner_Management_System SHALL append "(Copy)" to duplicated banner title
4. THE Banner_Management_System SHALL set duplicated banner status to draft
5. THE Admin_Frontend SHALL provide duplicate button on banner list page

---

### Requirement 24: Banner Search

**User Story:** As an Admin, I want to search banners by title or description, so that I can find specific banners quickly.

#### Acceptance Criteria

1. THE Banner_Management_System SHALL provide search endpoint accepting search query
2. THE Banner_Management_System SHALL search banner title and description using case-insensitive partial matching
3. THE Banner_Management_System SHALL return paginated search results
4. THE Admin_Frontend SHALL provide search input with debouncing to reduce API calls
5. THE Admin_Frontend SHALL display search results in same table format as banner list

---

### Requirement 25: Banner Bulk Actions

**User Story:** As an Admin, I want to perform bulk actions on multiple banners, so that I can manage banners efficiently.

#### Acceptance Criteria

1. THE Admin_Frontend SHALL provide checkbox selection for each banner in list
2. THE Admin_Frontend SHALL provide "Select All" checkbox in table header
3. THE Admin_Frontend SHALL display bulk action toolbar when one or more banners are selected
4. THE Banner_Management_System SHALL provide bulk activate endpoint
5. THE Banner_Management_System SHALL provide bulk deactivate endpoint
6. THE Banner_Management_System SHALL provide bulk delete endpoint
7. WHEN bulk action is performed, THE Banner_Management_System SHALL apply action to all selected banners

---

## 4. NON-FUNCTIONAL REQUIREMENTS

### 4.1 Performance

- Homepage SHALL load within 2 seconds on 3G connection
- Hero carousel SHALL display first banner within 1 second
- Image upload SHALL complete within 5 seconds for 10MB files
- Banner listing API SHALL respond within 300ms for 100 banners
- Carousel transition animation SHALL maintain 60 FPS
- Lazy-loaded banners SHALL load within 500ms when entering viewport

### 4.2 Scalability

- Banner Management System SHALL support at least 500 active banners
- Image Upload System SHALL handle concurrent uploads from 10 admins
- Banner Display System SHALL serve banners to 10,000 concurrent users
- Cloudinary SHALL store at least 2,000 banner images with variants

### 4.3 Security

- All banner management endpoints SHALL require admin role authentication
- Image upload SHALL validate file type using magic number verification, not just extension
- Image upload SHALL scan uploaded files for malware signatures
- Banner link URLs SHALL be sanitized to prevent XSS attacks
- Admin panel SHALL use CSRF tokens for all banner mutations

### 4.4 Accessibility

- Banner images SHALL have descriptive alt text
- Carousel controls SHALL be keyboard navigable
- Carousel SHALL announce slide changes to screen readers
- Focus indicators SHALL be visible on all interactive elements
- Color contrast SHALL meet WCAG AA standards for text overlays

### 4.5 Reliability

- Failed image uploads SHALL not create incomplete banner records
- Scheduled job SHALL retry status updates on failure
- Banner display SHALL gracefully handle missing images with placeholder
- Carousel SHALL function with single banner without JavaScript errors
- Click tracking failures SHALL not prevent banner navigation

### 4.6 Usability

- Banner form SHALL provide inline validation feedback
- Image upload SHALL show clear progress indication
- Banner preview SHALL accurately represent customer-facing display
- Drag-and-drop reordering SHALL provide visual feedback during drag
- Error messages SHALL be descriptive and actionable

---

## 5. CONSTRAINTS

### 5.1 Technical Constraints

- Backend: NestJS + TypeORM + MySQL + Redis + BullMQ
- Frontend Client: Next.js 16 + TailwindCSS + shadcn/ui (port 3002)
- Frontend Admin: Next.js 16 + TailwindCSS + Radix UI (port 3003)
- Backend API: port 3001
- Image storage: Cloudinary (credentials in .env)
- Authentication: HTTP-only cookies from Phase 1
- Carousel library: Embla Carousel or Swiper.js
- Date picker: React Day Picker or similar

### 5.2 Business Constraints

- Maximum 10 hero banners active simultaneously
- Maximum 5 flash sale banners active simultaneously
- Maximum 12 category section banners active simultaneously
- Maximum 3 sidebar banners active simultaneously
- Maximum 2 footer banners active simultaneously
- Banner images must be at least 800x400 pixels
- Banner images must not exceed 10MB file size

### 5.3 Dependencies

- Phase 1 (Backend Foundation) must be complete for authentication
- Cloudinary account and credentials must be configured
- Redis must be running for caching banner data
- BullMQ must be configured for scheduled status updates

---

## 6. ASSUMPTIONS

- Administrators have basic understanding of image dimensions and file formats
- Banner images are provided in web-optimized formats (JPEG, PNG, WebP)
- Customers have modern browsers supporting responsive images and CSS Grid
- Network bandwidth is sufficient for loading multiple banner images
- Cloudinary free tier or paid plan has sufficient storage and bandwidth quota
- Banner content is in Vietnamese language
- Prices and discounts in banner descriptions are manually entered by admins

---

## 7. RISKS

| Risk                                                  | Impact | Probability | Mitigation                                          |
| ----------------------------------------------------- | ------ | ----------- | --------------------------------------------------- |
| Cloudinary API rate limits during high upload volume  | Medium | Low         | Implement upload queue, show clear error messages   |
| Large banner images slowing homepage load             | High   | Medium      | Enforce image optimization, use lazy loading        |
| Carousel library compatibility issues with Next.js 16 | Medium | Low         | Test carousel library before implementation         |
| Scheduled job failures causing banners to not expire  | Medium | Medium      | Implement job monitoring, manual status override    |
| Concurrent banner reordering causing conflicts        | Low    | Low         | Use optimistic locking for display order updates    |
| Malicious file uploads                                | High   | Low         | Implement file type validation and malware scanning |
| Banner click tracking data loss                       | Low    | Medium      | Use message queue for tracking events               |

---

## 8. OUT OF SCOPE

The following are explicitly NOT included in this feature:

- ❌ A/B testing for banner effectiveness
- ❌ Personalized banners based on user behavior
- ❌ Video banner support
- ❌ Animated GIF optimization
- ❌ Banner templates or design tools
- ❌ Multi-language banner content
- ❌ Banner approval workflow
- ❌ Advanced analytics (heatmaps, scroll depth)
- ❌ Integration with external ad networks
- ❌ Banner versioning and rollback
- ❌ Geolocation-based banner targeting
- ❌ Banner performance scoring

---

## 9. ACCEPTANCE CRITERIA SUMMARY

### Must Have (P0)

- ✅ Banner CRUD operations with admin authentication
- ✅ Image upload to Cloudinary with validation
- ✅ Responsive image generation (mobile, tablet, desktop)
- ✅ Banner positioning (hero, flash_sale, category_section, sidebar, footer)
- ✅ Banner scheduling with start and end dates
- ✅ Banner status management (draft, active, inactive, scheduled, expired)
- ✅ Display order management
- ✅ Hero carousel with auto-rotation and navigation
- ✅ Flash sale section with countdown timer
- ✅ Category section with responsive grid
- ✅ Admin banner management UI with list, create, edit, delete
- ✅ Banner preview functionality

### Should Have (P1)

- ✅ Banner click and impression tracking
- ✅ Banner search functionality
- ✅ Banner duplication
- ✅ Bulk actions (activate, deactivate, delete)
- ✅ Drag-and-drop reordering
- ✅ Image deletion from Cloudinary

### Nice to Have (P2)

- ⬜ Banner analytics dashboard
- ⬜ Banner performance recommendations
- ⬜ Automated banner rotation based on CTR
- ⬜ Banner scheduling calendar view

---

## 10. PARSER AND SERIALIZER REQUIREMENTS

### Requirement 26: Banner Data Serialization

**User Story:** As a Developer, I want to serialize banner data to JSON, so that I can transmit banner information via API.

#### Acceptance Criteria

1. THE Banner_Serializer SHALL convert banner entity to JSON format
2. THE Banner_Serializer SHALL include all banner fields: id, title, description, image_url, responsive_urls, position, type, status, display_order, link_url, start_date, end_date, click_count, impression_count, created_at, updated_at
3. THE Banner_Serializer SHALL format dates as ISO 8601 strings
4. THE Banner_Serializer SHALL include nested responsive_urls object with mobile, tablet, and desktop keys
5. THE Banner_Serializer SHALL calculate and include ctr (click-through rate) as percentage

### Requirement 27: Banner Data Deserialization

**User Story:** As a Developer, I want to parse JSON banner data, so that I can create banner entities from API requests.

#### Acceptance Criteria

1. THE Banner_Parser SHALL parse JSON format to banner entity
2. WHEN JSON is parsed, THE Banner_Parser SHALL validate all required fields are present
3. WHEN JSON is parsed, THE Banner_Parser SHALL validate field types match expected types
4. WHEN JSON is parsed, THE Banner_Parser SHALL parse ISO 8601 date strings to Date objects
5. WHEN JSON contains invalid data, THE Banner_Parser SHALL return descriptive error message

### Requirement 28: Banner Round-Trip Property

**User Story:** As a Developer, I want banner serialization and parsing to be reversible, so that data integrity is maintained.

#### Acceptance Criteria

1. FOR ALL valid banner entities, THE Banner_Serializer SHALL produce JSON that THE Banner_Parser can parse back to equivalent entity
2. FOR ALL valid banner entities, parsing then serializing then parsing SHALL produce equivalent entity (round-trip property)
3. THE Banner_Parser SHALL preserve all field values during round-trip
4. THE Banner_Parser SHALL preserve date precision to milliseconds during round-trip

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Author:** Development Team  
**Status:** Draft → Ready for Review

# B2B Procurement Platform - Laravel React Application

A comprehensive B2B e-commerce platform facilitating seamless interactions between buyers and suppliers, featuring RFQ management, real-time messaging, order processing, and supplier verification.

## 📋 Overview

This enterprise-grade B2B platform connects buyers with verified suppliers, streamlining the procurement process through a robust set of features including Request for Quotation (RFQ) management, supplier verification, bulk pricing, and real-time communication.

### Key Business Value

- **For Buyers**: Streamlined procurement, competitive quotes, and transparent supplier interactions
- **For Suppliers**: Expanded market reach, efficient quote management, and sales analytics
- **For Admins**: Complete oversight, verification controls, and comprehensive reporting

## ✨ Features

### Core Modules

#### 🔐 Authentication & Authorization

- Multi-role authentication (Admin, Buyer, Supplier)
- Email verification and password reset
- Role-based access control (RBAC)
- Session management
- Pending approval state for new suppliers

#### 📦 Product Management

- Comprehensive product catalog with bulk pricing tiers
- Supplier-specific product listings
- Stock management and tracking
- Category-based organization
- Product approval workflow

#### 📄 RFQ (Request for Quotation)

- Create and manage RFQs with detailed specifications
- Multi-supplier quote submission
- Quote comparison tools
- Automated RFQ numbering
- Status tracking (Open, Quoted, Closed)

#### 💬 Messaging System

- Real-time conversation between buyers and suppliers
- RFQ-specific communication threads
- Read/unread message tracking
- Conversation history
- Message search functionality

#### 📊 Order Management

- Streamlined order creation from accepted quotes
- Comprehensive order lifecycle (Pending → Confirmed → Processing → Shipped → Delivered)
- Payment status tracking
- Order confirmation workflow
- Invoice generation

#### 📈 Analytics & Reporting

- Sales analytics for suppliers
- Buyer purchasing patterns
- Quote success rates
- Product performance metrics
- Financial reporting

### Administrative Features

#### 👥 User Management

- Complete user lifecycle management
- Role assignment and modification
- Account activation/deactivation
- User profile management

#### ✅ Supplier Verification

- Document verification workflow
- Trade license validation
- Verification status tracking
- Rejection with reason

#### 🛍️ Order Oversight

- Cross-supplier order monitoring
- Order status management
- Dispute resolution
- Payment verification

#### 📋 Product Approval

- New product moderation
- Price validation
- Category assignment
- Quality control

### Supplier Features

#### 📊 Supplier Dashboard

- Sales performance metrics
- Quote response rates
- Active RFQs
- Recent orders

#### 💼 Product Management

- Bulk price configuration
- Inventory management
- Product image uploads
- Product status control

#### 📝 Quote Management

- RFQ browsing and filtering
- Quote submission with product breakdown
- Quote editing and updates
- Expired quote handling

### Buyer Features

#### 🛒 Buyer Dashboard

- Active RFQs overview
- Recent quotes
- Order status tracking
- Saved suppliers

#### 📋 RFQ Management

- RFQ creation with product specifications
- Quote comparison tool
- Quote acceptance/rejection
- RFQ status tracking

## 🏗️ Architecture

### Technology Stack

#### Backend

- **Framework**: Laravel 10.x
- **Database**: MySQL 8.0+
- **Authentication**: Laravel Sanctum
- **API**: RESTful API with API Resources
- **Queue**: Redis (for jobs and messaging)

#### Frontend

- **Framework**: React 18.x
- **State Management**: React Context API / Redux
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Real-time**: Laravel Echo with Pusher

### Database Schema

```
Users
├── id (PK)
├── name, email, password
├── role (admin/buyer/supplier)
└── is_active

Suppliers
├── id (PK)
├── user_id (FK)
├── company_name, trade_license
├── verification_status
└── contact information

Products
├── id (PK)
├── supplier_id (FK)
├── name, description
├── base_price, bulk_prices (JSON)
├── stock_quantity
└── status

ProductBulkPrices
├── id (PK)
├── product_id (FK)
├── min_quantity, max_quantity
└── price

RFQs
├── id (PK)
├── rfq_number
├── buyer_id (FK)
├── title, description
├── products_requested (JSON)
└── status

RFQQuotes
├── id (PK)
├── quote_number
├── rfq_id (FK)
├── supplier_id (FK)
├── total_amount
├── product_breakdown (JSON)
└── status

Orders
├── id (PK)
├── order_number
├── buyer_id (FK)
├── supplier_id (FK)
├── rfq_id (FK)
├── total_amount
├── payment_status
└── order_status

OrderItems
├── id (PK)
├── order_id (FK)
├── product_id (FK)
├── product_name
├── quantity, unit_price, total_price
└── (snapshot data)

Messages
├── id (PK)
├── sender_id (FK)
├── receiver_id (FK)
├── rfq_id (FK)
├── message
└── is_read

Carts
├── id (PK)
├── user_id (FK)
├── session_id
├── amounts breakdown
└── shipping information

CartItems
├── id (PK)
├── cart_id (FK)
├── product_id (FK)
├── supplier_id (FK)
├── quantity
└── unit_price
```

## 🚀 Installation

### Prerequisites

- PHP 8.1+
- Composer
- Node.js 18+
- MySQL 8.0+
- Redis (optional, for queues)

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/yourcompany/b2b-platform.git
cd b2b-platform

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Configure database in .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=b2b_platform
DB_USERNAME=root
DB_PASSWORD=

# Generate application key
php artisan key:generate

# Run migrations and seeders
php artisan migrate --seed

# Create storage link
php artisan storage:link

# Start development server
php artisan serve
```

### Frontend Setup

```bash
# Install NPM dependencies
npm install

# Compile assets for development
npm run dev

# For production
npm run build
```

### Queue Worker (for messaging and notifications)

```bash
php artisan queue:work
```

## 📁 Project Structure

```
b2b-platform/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/
│   │   │   ├── Auth/
│   │   │   ├── Buyer/
│   │   │   └── Supplier/
│   │   └── Middleware/
│   ├── Models/
│   └── Services/
├── database/
│   ├── migrations/
│   └── seeders/
├── resources/
│   └── js/
│       ├── Components/
│       ├── Layouts/
│       ├── Pages/
│       │   ├── Admin/
│       │   ├── Auth/
│       │   ├── Buyer/
│       │   ├── Supplier/
│       │   └── Profile/
│       └── app.jsx
├── routes/
│   ├── web.php
│   └── api.php
└── tests/
    ├── Feature/
    └── Unit/
```

## 🔒 Security Features

- **CSRF Protection**: Enabled for all routes
- **XSS Prevention**: Input sanitization and output encoding
- **SQL Injection Prevention**: Eloquent ORM with parameter binding
- **Authentication**: Sanctum tokens with proper expiration
- **Authorization**: Policies and gates for all models
- **Rate Limiting**: API rate limiting per user role
- **Session Security**: Secure session configuration

## 🧪 Testing

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature
php artisan test --testsuite=Unit
```

## 📊 Performance Optimizations

- **Caching**: Redis for session and cache
- **Database Indexing**: Optimized indexes for frequent queries
- **Lazy Loading**: Prevent N+1 queries with eager loading
- **Pagination**: All listings use pagination
- **Asset Minification**: Compiled and minified assets
- **Image Optimization**: Automatic image resizing and caching

## 🔄 API Documentation

The API follows RESTful principles with JSON responses. Key endpoints:

### Public Endpoints

- `POST /api/login` - User authentication
- `POST /api/register` - New registration
- `POST /api/forgot-password` - Password reset request

### Protected Endpoints (require Bearer token)

- `GET /api/buyer/rfqs` - List buyer's RFQs
- `POST /api/buyer/rfqs` - Create new RFQ
- `GET /api/supplier/quotes` - List supplier's quotes
- `POST /api/supplier/quotes` - Submit quote
- `GET /api/messages/conversations` - List conversations
- `POST /api/messages/send` - Send message

## 📱 Mobile Responsiveness

The frontend is fully responsive and optimized for:

- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🌐 Localization

Currently supports:

- English (default)
- Additional languages can be added via Laravel's localization system

## 📈 Monitoring & Logging

- **Error Tracking**: Laravel log files
- **Performance Monitoring**: Laravel Telescope (development)
- **User Activity**: Activity log model for critical actions

## 🚦 CI/CD

Example GitHub Actions workflow for testing and deployment:

```yaml
name: Tests
on: [push, pull_request]
jobs:
    laravel-tests:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v2
            - name: Install Dependencies
              run: composer install -q --no-ansi --no-interaction --no-scripts --no-progress --prefer-dist
            - name: Execute tests
              run: php artisan test
```

## 📄 License

This project is proprietary software owned by [Your Company Name]. All rights reserved.

## 👥 Contributors

- [Developer Name] - Lead Developer
- [Developer Name] - Frontend Specialist
- [Developer Name] - QA Engineer

## 📞 Support

For technical support or inquiries:

- Email: support@yourcompany.com
- Documentation: https://docs.yourcompany.com
- Issue Tracker: https://github.com/yourcompany/b2b-platform/issues

## 🗺️ Roadmap

### Version 2.0 (Q3 2024)

- [ ] Multi-currency support
- [ ] Advanced analytics dashboard
- [ ] API rate limiting improvements
- [ ] Webhook integrations

### Version 2.1 (Q4 2024)

- [ ] Mobile applications (iOS/Android)
- [ ] AI-powered quote recommendations
- [ ] Automated supplier matching
- [ ] Blockchain-based contract verification

---

**Built with** ❤️ using Laravel and React

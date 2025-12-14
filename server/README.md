# Sports Hub Backend API

A Node.js/Express backend for the Sports Club Management System with MySQL database.

## Features

- **Authentication**: JWT-based auth with email/username login
- **User Roles**: User, Coach, Admin with role-based access
- **Memberships**: Monthly/yearly plans management
- **Facilities**: CRUD operations with slot booking
- **Events**: Event creation and management
- **Coaches**: Coach profiles and listings
- **Payments**: Dummy payment system (Razorpay/Stripe ready)
- **Admin Dashboard**: Full management APIs

## Prerequisites

- Node.js (v18+)
- MySQL (v8+)
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Create a `.env` file in the `server` folder:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=sports_hub

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:3000
```

### 3. Setup Database

Run the SQL schema to create tables:

```bash
mysql -u root -p < database/schema.sql
```

Or import `database/schema.sql` using MySQL Workbench or phpMyAdmin.

### 4. Start the Server

```bash
# Development
npm run dev

# Production
npm start
```

Server runs at `http://localhost:5000`

## API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Authenticated |
| POST | `/api/auth/logout` | Logout user | Authenticated |

### Users
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/:id` | Get user by ID | Admin |
| PUT | `/api/users/:id` | Update user | Admin/Owner |
| DELETE | `/api/users/:id` | Delete user | Admin |
| PUT | `/api/users/:id/role` | Change user role | Admin |

### Memberships
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/memberships/plans` | Get all plans | Public |
| POST | `/api/memberships/plans` | Create plan | Admin |
| PUT | `/api/memberships/plans/:id` | Update plan | Admin |
| DELETE | `/api/memberships/plans/:id` | Delete plan | Admin |
| POST | `/api/memberships/subscribe` | Subscribe to plan | Authenticated |
| GET | `/api/memberships/my` | Get my membership | Authenticated |
| GET | `/api/memberships` | Get all memberships | Admin |

### Facilities
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/facilities` | Get all facilities | Public |
| GET | `/api/facilities/:id` | Get facility details | Public |
| POST | `/api/facilities` | Create facility | Admin |
| PUT | `/api/facilities/:id` | Update facility | Admin |
| DELETE | `/api/facilities/:id` | Delete facility | Admin |
| GET | `/api/facilities/:id/slots` | Get available slots | Authenticated |
| POST | `/api/facilities/:id/slots` | Create slot | Admin |

### Bookings
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/bookings/my` | Get my bookings | Authenticated |
| POST | `/api/bookings` | Create booking | Authenticated |
| PUT | `/api/bookings/:id/cancel` | Cancel booking | Owner/Admin |
| GET | `/api/bookings` | Get all bookings | Admin |
| PUT | `/api/bookings/:id/status` | Update status | Admin |

### Events
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/events` | Get all events | Public |
| GET | `/api/events/:id` | Get event details | Public |
| POST | `/api/events` | Create event | Admin |
| PUT | `/api/events/:id` | Update event | Admin |
| DELETE | `/api/events/:id` | Delete event | Admin |
| POST | `/api/events/:id/register` | Register for event | Authenticated |
| DELETE | `/api/events/:id/register` | Unregister | Authenticated |

### Coaches
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/coaches` | Get all coaches | Public |
| GET | `/api/coaches/:id` | Get coach details | Public |
| POST | `/api/coaches` | Create coach profile | Admin |
| PUT | `/api/coaches/:id` | Update coach | Admin/Coach |
| DELETE | `/api/coaches/:id` | Delete coach | Admin |

### Payments
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/payments` | Create payment | Authenticated |
| GET | `/api/payments/my` | Get my payments | Authenticated |
| GET | `/api/payments` | Get all payments | Admin |
| PUT | `/api/payments/:id/status` | Update status | Admin |

### Admin Dashboard
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/admin/stats` | Get dashboard stats | Admin |
| GET | `/api/admin/users` | Manage users | Admin |
| GET | `/api/admin/revenue` | Revenue reports | Admin |

## Error Handling

All errors return JSON with `success: false` and `message`:

```json
{
  "success": false,
  "message": "Error description"
}
```

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens for authentication
- Role-based middleware protection
- Input validation on all endpoints
- SQL injection protection via parameterized queries

## Future Integrations

Payment gateway integration ready:
- Razorpay
- Stripe

Update the payment controller with your gateway credentials when ready.

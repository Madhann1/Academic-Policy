# APM Backend

Academic Policy Management System — REST API

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your MongoDB URI

# Seed the database
npm run seed

# Start development server
npm run dev
```

## API Endpoints

| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/auth/login` | Public |
| PUT | `/api/auth/change-password` | Protected |
| GET | `/api/auth/me` | Protected |
| GET | `/api/users` | Admin |
| POST | `/api/users` | Admin |
| PUT | `/api/users/:id` | Admin |
| DELETE | `/api/users/:id` | Admin |
| GET | `/api/policies` | All roles |
| POST | `/api/policies` | Faculty |
| PUT | `/api/policies/:id` | Faculty |
| PUT | `/api/policies/:id/submit` | Faculty |
| PUT | `/api/policies/:id/approve` | Admin |
| PUT | `/api/policies/:id/reject` | Admin |
| DELETE | `/api/policies/:id` | Admin |
| GET | `/api/requests` | Faculty/Admin |
| POST | `/api/requests` | Faculty |
| PUT | `/api/requests/:id` | Admin |
| GET | `/api/audit` | Admin |
| GET | `/api/dashboard/admin` | Admin |
| GET | `/api/dashboard/faculty` | Faculty |

## Default Credentials (after seed)

- **Admin**: admin@apm.edu / Admin@123
- **Faculty**: rajesh.kumar@apm.edu / Faculty@123
- **Student**: arjun.singh@student.apm.edu / Student@123

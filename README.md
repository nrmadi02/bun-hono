# Hono Bun API

API server modern yang dibangun dengan **Hono** dan **Bun** runtime, dilengkapi dengan sistem autentikasi lengkap, manajemen sesi multi-device, dan dokumentasi OpenAPI.

## 🚀 Tech Stack

- **[Bun](https://bun.sh/)** - Runtime JavaScript yang cepat dan modern
- **[Hono](https://hono.dev/)** - Web framework yang ringan dan cepat
- **[Prisma](https://www.prisma.io/)** - ORM modern untuk database
- **[PostgreSQL](https://www.postgresql.org/)** - Database relasional
- **[Zod](https://zod.dev/)** - Schema validation
- **[OpenAPI](https://www.openapis.org/)** - API documentation dengan Scalar UI
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety

## ✨ Features

- 🔐 **Autentikasi Lengkap**
  - Register user baru
  - Login dengan email dan password
  - Logout dari sesi tertentu atau semua device
  - JWT token dengan refresh token

- 📱 **Manajemen Sesi Multi-Device**
  - Track hingga 5 sesi aktif per user
  - Device tracking (device name, IP address, user agent)
  - Lihat semua sesi aktif
  - Auto-cleanup sesi yang expired

- 📚 **Dokumentasi API**
  - OpenAPI 3.1.0 specification
  - Interactive API documentation dengan Scalar UI
  - Auto-generated dari Zod schemas

- 🛡️ **Security**
  - Password hashing dengan Bun.password
  - JWT authentication
  - CORS enabled
  - Request validation dengan Zod

- 🏗️ **Developer Experience**
  - Type-safe dengan TypeScript
  - Hot reload dengan Bun
  - Structured project architecture
  - Request logging

## 📋 Prerequisites

- [Bun](https://bun.sh/) (versi terbaru)
- PostgreSQL database
- Node.js (opsional, untuk Prisma CLI)

## 🛠️ Installation

1. Clone repository ini:

```bash
git clone <repository-url>
cd hono-bun
```

1. Install dependencies:

```bash
bun install
```

1. Setup environment variables:

Buat file `.env` di root project:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-secret-key-here"
PORT=3000
```

1. Setup database:

```bash
# Generate Prisma client
bun run db:generate

# Run migrations
bun run db:migrate

# Atau push schema langsung (untuk development)
bun run db:push
```

## 🚀 Usage

### Development Mode

Jalankan server dengan hot reload:

```bash
bun run dev
```

Server akan berjalan di `http://localhost:3000`

### API Documentation

Setelah server berjalan, akses dokumentasi API:

- **OpenAPI Spec**: `http://localhost:3000/doc`
- **Scalar UI**: `http://localhost:3000/ui`

## 📡 API Endpoints

### Authentication

#### Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "fullName": "John Doe",
  "username": "johndoe"
}
```

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response:

```json
{
  "message": "Login successful",
  "success": true,
  "data": {
    "token": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "fullName": "John Doe",
      "role": "user"
    }
  }
}
```

#### Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

#### Get Sessions

```http
GET /api/v1/auth/sessions
Authorization: Bearer <token>
```

Response:

```json
{
  "message": "Sessions retrieved successfully",
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session-id",
        "deviceName": "macOS",
        "ipAddress": "127.0.0.1",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "expireAt": "2024-01-03T00:00:00.000Z",
        "isCurrent": true
      }
    ]
  }
}
```

## 🗄️ Database

### Prisma Commands

```bash
# Generate Prisma Client
bun run db:generate

# Create and apply migration
bun run db:migrate

# Push schema changes (development only)
bun run db:push

# Open Prisma Studio (database GUI)
bun run db:studio

# Deploy migrations (production)
bun run db:deploy
```

### Database Schema

Project menggunakan Prisma dengan schema berikut:

- **User** - User data (email, username, fullName, role)
- **Account** - Authentication accounts (provider, password, tokens)
- **Session** - Active user sessions (device tracking, expiration)

## 📁 Project Structure

```text
hono-bun/
├── prisma/
│   ├── schema/           # Prisma schema files
│   ├── migrations/       # Database migrations
│   └── generated/        # Generated Prisma client
├── src/
│   ├── lib/              # Core utilities
│   │   ├── create-app.ts # App factory
│   │   ├── open-api.ts   # OpenAPI configuration
│   │   └── types.ts      # Type definitions
│   ├── middlewares/      # Hono middlewares
│   │   └── auth.middleware.ts
│   ├── routes/           # API routes
│   │   ├── auth/         # Authentication routes
│   │   └── test/         # Test routes
│   ├── schemas/          # Zod validation schemas
│   │   ├── auth/
│   │   └── user/
│   ├── utils/            # Utility functions
│   ├── app.ts            # App configuration
│   └── index.ts          # Entry point
├── .env                  # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `PORT` | Server port (default: 3000) | No |

### JWT Token Expiration

- **Access Token**: 2 days
- **Refresh Token**: 30 days
- **Max Sessions**: 5 active sessions per user

## 🧪 Development

### Code Formatting

Project menggunakan Biome untuk formatting dan linting:

```bash
# Format code
bunx @biomejs/biome format --write .

# Lint code
bunx @biomejs/biome lint .
```

### Type Safety

Project menggunakan TypeScript dengan strict mode. Semua routes menggunakan type-safe handlers dengan `AppRouteHandler` type.

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

# Testing Documentation

## Setup

### 1. Create Test Database

```bash
# Create test database
createdb myapp_test

# Or using psql
psql -U postgres
CREATE DATABASE myapp_test;
```

### 2. Configure Environment

Copy `.env.test` and update with your test database credentials:

```bash
cp .env.test .env.test.local
# Edit .env.test.local with your credentials
```

**IMPORTANT:** Database URL MUST contain "test" for safety!

### 3. Run Migrations

```bash
# Apply migrations to test database
DATABASE_URL="postgresql://user:pass@localhost:5432/myapp_test" bun run db:deploy
```

## Running Tests

### Run All Tests

```bash
bun test
```

### Run Specific Test Suite

```bash
# Integration tests only
bun test:integration

# Unit tests only (when added)
bun test:unit

# Specific file
bun test tests/integration/auth/login.test.ts
```

### Watch Mode

```bash
bun test:watch
```

### UI Mode

```bash
bun test:ui
```

### Coverage Report

```bash
bun test:coverage
```

## Test Structure

```
tests/
├── setup.ts              # Global setup/teardown
├── helpers/              # Test utilities
│   ├── test-app.ts      # App instance for testing
│   └── test-factories.ts # Data generators
├── integration/          # API integration tests
│   └── auth/
│       ├── register.test.ts
│       ├── login.test.ts
│       └── me.test.ts
└── unit/                 # Unit tests (coming soon)
```

## Writing Tests

### Integration Test Example

```typescript
import { describe, it, expect } from "vitest";
import { getTestApp } from "../../helpers/test-app";
import { createTestUser } from "../../helpers/test-factories";

const app = getTestApp();

describe("API Endpoint", () => {
  it("should do something", async () => {
    // Setup
    const user = await createTestUser();
    
    // Execute
    const response = await app.request("/api/v1/endpoint", {
      method: "POST",
      body: JSON.stringify({ data: "test" }),
    });
    
    // Assert
    expect(response.status).toBe(200);
  });
});
```

## Current Test Coverage

### Auth API ✅
- ✅ Register (8 tests)
- ✅ Login (8 tests)
- ✅ Me (6 tests)

**Total: 22 tests**

### Coming Soon
- [ ] Logout
- [ ] Sessions
- [ ] Password Reset
- [ ] Admin APIs
- [ ] Health Checks
- [ ] Unit Tests

## CI/CD

Tests run automatically on:
- Every push
- Every pull request
- Before deployment

See `.github/workflows/test.yml` for configuration.

## Troubleshooting

### Database Connection Errors

```bash
# Check if test database exists
psql -l | grep test

# Recreate test database
dropdb myapp_test
createdb myapp_test
bun run db:deploy
```

### Redis Connection Errors

```bash
# Check if Redis is running
redis-cli ping

# Start Redis
redis-server
```

### Permission Errors

Ensure your database user has permissions:

```sql
GRANT ALL PRIVILEGES ON DATABASE myapp_test TO your_user;
```


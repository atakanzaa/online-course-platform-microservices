# Branch Structure and Workflow

## Branch Organization

This project now follows a **dev-staging-prod** workflow with the following branch structure:

### 🌟 Main Branches

| Branch | Purpose | Environment | URL |
|--------|---------|-------------|-----|
| `production` | Production-ready code | Production | `https://courseplatform.com` |
| `staging` | Pre-production testing | Staging | `https://staging.courseplatform.com` |
| `development` | Active development | Development | Local development |

### 🚀 Workflow

```
development → staging → production
```

1. **Development Branch (`development`)**
   - Used for active development and feature integration
   - All new features and bug fixes start here
   - Continuous integration testing
   - Local development environment

2. **Staging Branch (`staging`)**
   - Pre-production environment for testing
   - Used for integration testing and user acceptance testing
   - Mirror of production environment with staging data
   - Final validation before production deployment

3. **Production Branch (`production`)**
   - Live production environment
   - Only receives tested and approved code from staging
   - Production-ready code only
   - Protected branch with deployment restrictions

### 📝 Development Process

1. **Feature Development**
   ```bash
   git checkout development
   git pull origin development
   git checkout -b feature/your-feature-name
   # ... develop your feature
   git push origin feature/your-feature-name
   # Create PR to development branch
   ```

2. **Staging Deployment**
   ```bash
   git checkout staging
   git merge development
   git push origin staging
   # Automatic deployment to staging environment
   ```

3. **Production Deployment**
   ```bash
   git checkout production
   git merge staging
   git push origin production
   # Manual deployment to production environment
   ```

### 🔐 Security Notes

- All sensitive credentials are now stored as environment variables
- `.env` files are gitignored to prevent credential leaks
- OAuth secrets must be configured in deployment environments
- Use `${GOOGLE_CLIENT_ID}` and `${GOOGLE_CLIENT_SECRET}` environment variables

### 🛠 Environment Configuration

Each environment should have its own configuration:

- **Development**: Local H2 database, development OAuth apps
- **Staging**: PostgreSQL database, staging OAuth apps
- **Production**: PostgreSQL database, production OAuth apps

### 📊 CI/CD Pipeline

The GitLab CI/CD pipeline is configured to:
- Build and test on every commit
- Deploy to staging when `development` branch is updated
- Deploy to production when `production` branch is updated (manual approval required)

### 🏗 Docker Compose Files

- `docker-compose.yml` - Development environment
- `docker-compose.staging.yml` - Staging environment  
- `docker-compose.prod.yml` - Production environment

Each file contains environment-specific configurations and resource allocations. 
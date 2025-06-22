# Branch Structure and Workflow

## Branch Organization

This project now follows a **dev-staging-prod** workflow with the following branch structure:

### 🌟 Main Branches

| Branch | Purpose | Environment | URL |
|--------|---------|-------------|-----|
| `main` | Production-ready code | **Production** | `https://courseplatform.com` |
| `staging` | Test/QA environment | **Staging** | `https://staging.courseplatform.com` |
| `develop` | Active development | **Development** | Local development |

### 🚀 Workflow

```
develop → staging → main
```

1. **Development Branch (`develop`)**
   - Used for active development and feature integration
   - All new features and bug fixes start here
   - Continuous integration testing
   - Local development environment

2. **Staging Branch (`staging`)**
   - Pre-production environment for testing
   - Used for integration testing and user acceptance testing
   - Mirror of production environment with staging data
   - Final validation before production deployment

3. **Production Branch (`main`)**
   - Live production environment
   - Only receives tested and approved code from staging
   - Production-ready code only
   - Protected branch with deployment restrictions

### 📝 Development Process

1. **Feature Development**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   # ... develop your feature
   git push origin feature/your-feature-name
   # Create PR to develop branch
   ```

2. **Staging Deployment**
   ```bash
   # When a feature is ready on develop, it will be automatically built & deployed
   # to the staging environment by the CI pipeline on each push.
   ```

3. **Production Deployment**
   ```bash
   # Merge develop → main (via PR)
   # CI pipeline automatically deploys main to production.
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
- Deploy to staging when `develop` branch is updated
- Deploy to production when `main` branch is updated (manual approval required)

### 🏗 Docker Compose Files

- `docker-compose.yml` - Development environment
- `docker-compose.staging.yml` - Staging environment  
- `docker-compose.prod.yml` - Production environment

Each file contains environment-specific configurations and resource allocations. 
# CRUD App - Docker Setup

## Architecture

```
┌─────────────┐
│   Frontend  │ (Nginx - Port 80)
│   (Port 80) │
└──────┬──────┘
       │
       ├──→ API calls to backend:80 (proxied)
       │
┌──────▼────────────────────┐
│  Backend (.NET 8)         │
│  (Port 5000 → 80 in app)  │
└──────┬─────────────────────┘
       │
       │ DB connection
       │
┌──────▼──────────┐
│  PostgreSQL 15  │
│  (Port 5432)    │
└─────────────────┘
```

## Quick Start

### Build & Run Everything

```bash
cd "c:\Users\yogesh.chauhan\Desktop\CRUD App"

# Build and start all services
docker compose up --build

# In another terminal, verify containers are running
docker compose ps
```

### Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **PostgreSQL**: localhost:5432

## PostgreSQL setup

PostgreSQL should be installed separately from this Dockerfile. Do not install PostgreSQL inside the .NET app container.

### Use Docker for PostgreSQL

```bash
docker run -d \
  --name my-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=admin@123 \
  -e POSTGRES_DB=itemdb \
  -p 5432:5432 \
  postgres:15
```

Create an application user if needed:

```bash
docker exec -it my-postgres psql -U postgres -c "CREATE USER myuser WITH PASSWORD 'mypassword';"
docker exec -it my-postgres psql -U postgres -c "CREATE DATABASE itemdb OWNER myuser;"
docker exec -it my-postgres psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE itemdb TO myuser;"
```

### Host installation (Linux)

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE USER myuser WITH PASSWORD 'mypassword';"
sudo -u postgres psql -c "CREATE DATABASE itemdb OWNER myuser;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE itemdb TO myuser;"
```

### Connection string for .NET

```text
Host=localhost;Port=5432;Database=itemdb;Username=postgres;Password=admin@123
```

## File Structure

```
CRUD App/
├── backenddot/
│   ├── Dockerfile           # Backend image definition
│   ├── .dockerignore        # Files to exclude from image
│   ├── CRUDapp.dll         # Compiled .NET application
│   └── (other .NET files)
├── frontend/
│   ├── Dockerfile           # Frontend image definition
│   ├── .dockerignore        # Files to exclude from image
│   ├── nginx.conf          # Nginx reverse proxy config
│   ├── index.html
│   ├── script.js           # Updated API URL to port 5000
│   └── style.css
├── postgres-init/
│   └── init.sql            # Database schema creation script
├── docker-compose.yml      # Multi-container orchestration
└── (other files)
```

## Services

### 1. PostgreSQL (backenddot_postgres)
- **Image**: postgres:15
- **Port**: 5432 (internal) → 5432 (host)
- **Database**: itemdb
- **User**: postgres / admin@123
- **Init Script**: `postgres-init/init.sql` (auto-runs on first start)

### 2. Backend (.NET API) (backenddot)
- **Build**: `./backenddot/Dockerfile`
- **Port**: 5000 (host) → 80 (container)
- **Environment**:
  - ASPNETCORE_URLS=http://+:80
  - ConnectionStrings__DefaultConnection (auto-configured)
- **Depends on**: PostgreSQL

### 3. Frontend (Nginx) (crudapp_frontend)
- **Build**: `./frontend/Dockerfile`
- **Port**: 80 (host) → 80 (container)
- **Config**: `frontend/nginx.conf`
- **Proxy**: Routes `/api/` calls to backend:80
- **Depends on**: Backend

## Common Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Rebuild specific service
docker compose up -d --build backenddot

# Access PostgreSQL shell
docker compose exec postgres psql -U postgres -d itemdb

# Verify Items table
docker compose exec postgres psql -U postgres -d itemdb -c "\dt"
```

## Troubleshooting

### Backend can't connect to PostgreSQL
```bash
docker compose logs backenddot
# Check connection string in docker-compose.yml
```

### Frontend API calls failing
```bash
# Check nginx config routing
docker compose logs frontend

# Test backend is running
curl http://localhost:5000/items
```

### Items table doesn't exist
```bash
docker compose down -v    # Remove volume
docker compose up --build # Recreate with fresh DB
```

## Key Points

✅ **Port 80**: Frontend only
✅ **Port 5000**: Backend (mapped from internal port 80)
✅ **Port 5432**: PostgreSQL
✅ **Network**: `crudapp` bridge network for service-to-service communication
✅ **Init Script**: SQL runs automatically on PostgreSQL first start
✅ **API URL**: Frontend `script.js` now uses `http://localhost:5000/items`


#!/bin/bash
# Project Templates for different tech stacks

# Full-stack Web (React + Python)
create_fullstack_web() {
    local project_path="$1"

    # Frontend structure
    mkdir -p "$project_path"/{frontend,backend,docs}

    # Frontend package.json
    cat > "$project_path/frontend/package.json" << 'EOF'
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5",
    "vitest": "^1.0.0"
  }
}
EOF

    # Backend pyproject.toml
    cat > "$project_path/backend/pyproject.toml" << 'EOF'
[project]
name = "backend"
version = "0.1.0"
description = "Backend API"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.104.0",
    "uvicorn[standard]>=0.24.0",
    "pydantic>=2.0.0",
    "sqlalchemy>=2.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.21.0",
    "httpx>=0.25.0",
    "ruff>=0.1.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.ruff]
line-length = 100
target-version = "py311"
EOF

    # Backend main.py
    cat > "$project_path/backend/main.py" << 'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/health")
async def health():
    return {"status": "ok"}
EOF

    # Docker compose
    cat > "$project_path/docker-compose.yml" << 'EOF'
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/app
    volumes:
      - ./backend:/app
    command: uvicorn main:app --host 0.0.0.0 --reload

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
EOF
}

# Frontend Only (React/Next.js)
create_frontend_only() {
    local project_path="$1"

    cat > "$project_path/package.json" << 'EOF'
{
  "name": "project",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5",
    "vitest": "^1.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31"
  }
}
EOF

    mkdir -p "$project_path"/{src/{app,components,lib},public}

    cat > "$project_path/src/app/page.tsx" << 'EOF'
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Welcome to Your Project</h1>
      <p className="mt-4 text-xl">Built with Bast + CCPM</p>
    </main>
  )
}
EOF
}

# Backend Only (Python/FastAPI)
create_backend_only() {
    local project_path="$1"

    mkdir -p "$project_path"/{src,tests}

    cat > "$project_path/pyproject.toml" << 'EOF'
[project]
name = "backend"
version = "0.1.0"
description = "Backend API"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.104.0",
    "uvicorn[standard]>=0.24.0",
    "pydantic>=2.0.0",
    "sqlalchemy>=2.0.0",
    "alembic>=1.12.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.21.0",
    "httpx>=0.25.0",
    "ruff>=0.1.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"

[tool.ruff]
line-length = 100
target-version = "py311"
EOF

    cat > "$project_path/src/main.py" << 'EOF'
from fastapi import FastAPI

app = FastAPI(title="API", version="0.1.0")

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/health")
async def health():
    return {"status": "ok"}
EOF

    cat > "$project_path/tests/test_main.py" << 'EOF'
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}
EOF
}

# Mobile App (React Native)
create_mobile_app() {
    local project_path="$1"

    cat > "$project_path/package.json" << 'EOF'
{
  "name": "mobile-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "test": "jest"
  },
  "dependencies": {
    "expo": "~49.0.0",
    "react": "18.2.0",
    "react-native": "0.72.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.14",
    "typescript": "^5.1.3",
    "jest": "^29.6.0"
  }
}
EOF

    mkdir -p "$project_path"/{app,components,hooks,utils}

    cat > "$project_path/app.json" << 'EOF'
{
  "expo": {
    "name": "mobile-app",
    "slug": "mobile-app",
    "version": "0.1.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "platforms": ["ios", "android", "web"]
  }
}
EOF
}

# Infrastructure/DevOps
create_infrastructure() {
    local project_path="$1"

    mkdir -p "$project_path"/{terraform,kubernetes,scripts}

    cat > "$project_path/terraform/main.tf" << 'EOF'
terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}
EOF

    cat > "$project_path/README.md" << 'EOF'
# Infrastructure Project

Infrastructure as Code using Terraform and Kubernetes.

## Structure

- `terraform/` - Terraform configurations
- `kubernetes/` - Kubernetes manifests
- `scripts/` - Deployment and utility scripts

## Usage

### Terraform
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### Kubernetes
```bash
kubectl apply -f kubernetes/
```
EOF
}

# Data/ML Project
create_data_ml() {
    local project_path="$1"

    mkdir -p "$project_path"/{notebooks,src,data/{raw,processed},models}

    cat > "$project_path/pyproject.toml" << 'EOF'
[project]
name = "ml-project"
version = "0.1.0"
description = "Machine Learning Project"
requires-python = ">=3.11"
dependencies = [
    "pandas>=2.0.0",
    "numpy>=1.24.0",
    "scikit-learn>=1.3.0",
    "matplotlib>=3.7.0",
    "seaborn>=0.12.0",
    "jupyter>=1.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "black>=23.0.0",
    "ruff>=0.1.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
EOF

    cat > "$project_path/.gitattributes" << 'EOF'
*.ipynb filter=nbstripout
*.ipynb diff=ipynb
EOF

    cat > "$project_path/README.md" << 'EOF'
# ML Project

## Structure

- `notebooks/` - Jupyter notebooks for exploration
- `src/` - Source code for models and utilities
- `data/` - Data files (gitignored except samples)
- `models/` - Trained models (gitignored)

## Setup

```bash
uv sync
uv run jupyter lab
```
EOF
}

# Export functions
export -f create_fullstack_web
export -f create_frontend_only
export -f create_backend_only
export -f create_mobile_app
export -f create_infrastructure
export -f create_data_ml

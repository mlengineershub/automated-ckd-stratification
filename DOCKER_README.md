# Docker Setup for CKD Stratification Application

This document provides instructions for running the Automated CKD Stratification application using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)

## Required Files

Before running the application, make sure you have the following files:

1. **Model File**: Place your GGUF model file in the project root and rename it to `model.gguf`
2. **Data Files**:
   - Place any CSV data files in the `data` directory
   - For the frontend, ensure you have `cleaned_data.csv` and `cleaned_labs.csv` in the `my-app/public/data` directory

## Running the Application

### Using Docker Compose (Recommended)

1. Build and start the application:

```bash
docker-compose up -d
```

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

3. Stop the application:

```bash
docker-compose down
```

### Using Docker Directly

1. Build the Docker image:

```bash
docker build -t ckd-stratification .
```

2. Run the container:

```bash
docker run -p 3000:3000 -p 8000:8000 \
  -v $(pwd)/models:/app/models \
  -v $(pwd)/data:/app/data \
  ckd-stratification
```

## Troubleshooting

### Missing Model File

If you encounter an error about a missing model file, ensure you have placed the GGUF model file in the project root and renamed it to `model.gguf`.

### Data Access Issues

If the application cannot access data files, check that:
1. The CSV files are in the correct locations
2. The Docker volumes are properly mounted

### Port Conflicts

If ports 3000 or 8000 are already in use on your system, you can modify the port mappings in the `docker-compose.yml` file:

```yaml
ports:
  - "3001:3000"  # Map host port 3001 to container port 3000
  - "8001:8000"  # Map host port 8001 to container port 8000
```

## Customization

### Environment Variables

You can customize the application behavior by adding environment variables to the `docker-compose.yml` file:

```yaml
environment:
  - NODE_ENV=production
  - CUSTOM_VARIABLE=value
```

### Persistent Storage

The Docker Compose setup already mounts the `models` and `data` directories as volumes, ensuring that your data persists between container restarts.

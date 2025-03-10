# Multi-stage build for CKD Stratification Application

# Stage 1: Python Backend
FROM python:3.11-slim AS backend

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements
COPY setup.py .
COPY __main__.py .
COPY api_back.py .
COPY retrieve.py .
COPY ingestion.py .
COPY backend/ ./backend/

# Create directories for models and data
RUN mkdir -p models data

# Install Python dependencies
RUN pip install -e .
RUN pip install llama-cpp-python langchain langchain_huggingface langchain_community scikit-learn

# Stage 2: Node.js Frontend
FROM node:20-alpine AS frontend

WORKDIR /app

# Copy package.json and package-lock.json
COPY my-app/package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the frontend code
COPY my-app/ ./

# Build the Next.js app
RUN npm run build

# Stage 3: Final image
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Copy Python backend from the backend stage
COPY --from=backend /app /app
COPY --from=backend /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages

# Copy built Next.js app from the frontend stage
COPY --from=frontend /app/.next /app/my-app/.next
COPY --from=frontend /app/node_modules /app/my-app/node_modules
COPY --from=frontend /app/public /app/my-app/public
COPY my-app/package*.json /app/my-app/

# Create directories for models and data
RUN mkdir -p /app/models /app/data

# Expose ports
EXPOSE 3000 8000

# Set environment variables
ENV NODE_ENV=production

# Create start.sh script
RUN echo '#!/bin/bash\n\
# Start the Python backend in the background\n\
cd /app\n\
python api_back.py &\n\
\n\
# Start the Next.js frontend\n\
cd /app/my-app\n\
npm start\n\
' > /app/start.sh

# Make the script executable
RUN chmod +x /app/start.sh

# Set the entrypoint
ENTRYPOINT ["/app/start.sh"]

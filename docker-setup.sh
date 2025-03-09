#!/bin/bash

# Create required directories
mkdir -p models data my-app/public/data

echo "Created required directories:"
echo "- models/ (for ML models)"
echo "- data/ (for general data files)"
echo "- my-app/public/data/ (for frontend data files)"

# Check if model.gguf exists
if [ ! -f "model.gguf" ]; then
  echo ""
  echo "WARNING: model.gguf file not found in the current directory."
  echo "You need to place your GGUF model file in the project root and rename it to model.gguf"
fi

# Check for CSV files
if [ ! -f "my-app/public/data/cleaned_data.csv" ] || [ ! -f "my-app/public/data/cleaned_labs.csv" ]; then
  echo ""
  echo "WARNING: Required CSV files not found in my-app/public/data/"
  echo "Make sure to place cleaned_data.csv and cleaned_labs.csv in the my-app/public/data/ directory"
fi

echo ""
echo "Setup complete. You can now run the application using Docker Compose:"
echo "docker-compose up -d"

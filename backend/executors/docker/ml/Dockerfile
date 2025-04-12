# ML Executor Dockerfile
FROM python:3.9-slim

# Install basic utilities
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages for machine learning
RUN pip install numpy pandas scikit-learn tensorflow torch matplotlib seaborn

# Set up working directory
WORKDIR /app

# Create a non-root user
RUN useradd -m -s /bin/bash executor
RUN chown -R executor:executor /app

# Switch to non-root user
USER executor

# Default command
CMD ["tail", "-f", "/dev/null"] 
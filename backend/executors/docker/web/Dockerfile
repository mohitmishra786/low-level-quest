# Web Executor Dockerfile
FROM node:18

# Install basic utilities
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install global Node.js packages
RUN npm install -g \
    typescript \
    ts-node \
    nodemon \
    jest \
    @types/node \
    @types/jest

# Install Python packages for web testing
RUN pip3 install \
    requests \
    beautifulsoup4 \
    selenium \
    pytest \
    pytest-cov

# Set up working directory
WORKDIR /app

# Create a non-root user
RUN useradd -m -s /bin/bash executor
RUN chown -R executor:executor /app

# Switch to non-root user
USER executor

# Default command
CMD ["tail", "-f", "/dev/null"] 
# Network Executor Dockerfile
FROM ubuntu:22.04

# Install basic utilities and networking tools
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    python3 \
    python3-pip \
    netcat \
    iputils-ping \
    net-tools \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
RUN pip3 install requests socketio aiohttp

# Set up working directory
WORKDIR /app

# Create a non-root user
RUN useradd -m -s /bin/bash executor
RUN chown -R executor:executor /app

# Switch to non-root user
USER executor

# Default command
CMD ["tail", "-f", "/dev/null"] 
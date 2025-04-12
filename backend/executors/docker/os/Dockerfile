# OS Executor Dockerfile
FROM ubuntu:22.04

# Install basic utilities and development tools
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    gcc \
    g++ \
    make \
    valgrind \
    strace \
    ltrace \
    && rm -rf /var/lib/apt/lists/*

# Set up working directory
WORKDIR /app

# Create a non-root user
RUN useradd -m -s /bin/bash executor
RUN chown -R executor:executor /app

# Switch to non-root user
USER executor

# Default command
CMD ["tail", "-f", "/dev/null"] 
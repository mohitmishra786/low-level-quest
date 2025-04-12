# OOPs Executor Dockerfile
FROM ubuntu:22.04

# Install basic utilities and Java
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    openjdk-11-jdk \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages for OOP
RUN pip3 install \
    pytest \
    unittest2 \
    coverage \
    pylint \
    black

# Set up working directory
WORKDIR /app

# Create a non-root user
RUN useradd -m -s /bin/bash executor
RUN chown -R executor:executor /app

# Switch to non-root user
USER executor

# Default command
CMD ["tail", "-f", "/dev/null"] 
# Algorithm Executor Dockerfile
FROM ubuntu:22.04

# Install basic utilities and programming languages
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    python3 \
    python3-pip \
    openjdk-17-jdk \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages for algorithm analysis
RUN pip3 install \
    numpy \
    pandas \
    matplotlib \
    scipy \
    networkx \
    pytest \
    pytest-benchmark

# Install Node.js packages
RUN npm install -g typescript ts-node jest

# Set up working directory
WORKDIR /app

# Create a non-root user
RUN useradd -m -s /bin/bash executor
RUN chown -R executor:executor /app

# Switch to non-root user
USER executor

# Default command
CMD ["tail", "-f", "/dev/null"] 
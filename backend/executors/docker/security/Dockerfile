# Security Executor Dockerfile
FROM ubuntu:22.04

# Install basic utilities and security tools
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    python3 \
    python3-pip \
    openssl \
    libssl-dev \
    nmap \
    wireshark \
    john \
    hashcat \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages for security
RUN pip3 install \
    cryptography \
    pycryptodome \
    paramiko \
    scapy \
    requests \
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
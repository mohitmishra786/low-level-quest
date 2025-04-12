# Database Executor Dockerfile
FROM ubuntu:22.04

# Install basic utilities and database systems
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    python3 \
    python3-pip \
    postgresql \
    postgresql-contrib \
    mysql-server \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages for database operations
RUN pip3 install \
    psycopg2-binary \
    mysql-connector-python \
    sqlalchemy \
    pymongo \
    redis \
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
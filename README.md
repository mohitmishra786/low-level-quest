# Low-Level Quest

A platform for learning and practicing low-level programming concepts through interactive coding challenges.

## Overview

Low-Level Quest is an educational platform designed to help developers master low-level programming concepts through hands-on coding challenges. The platform covers various domains including algorithms, operating systems, networking, databases, security, and more.

## Features

- **Interactive Coding Challenges**: Solve real-world problems in various programming domains
- **Multiple Programming Languages**: Support for C, C++, Java, Python, JavaScript, and more
- **Real-time Code Execution**: Get immediate feedback on your solutions
- **Visualizations**: See how your code executes with domain-specific visualizations
- **Comprehensive Feedback**: Detailed analysis of your code's performance and correctness
- **Learning Resources**: Access to hints, discussions, and educational content
- **Progress Tracking**: Track your progress and achievements

## Architecture

The platform consists of the following components:

1. **Frontend**: React-based user interface
2. **Backend**: Node.js API server
3. **Database**: PostgreSQL for data storage
4. **Executor System**: Modular framework for code execution and evaluation
5. **Docker Containers**: Isolated environments for secure code execution

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/low-level-quest.git
   cd low-level-quest
   ```

2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Create .env file in the backend directory
   cp backend/.env.example backend/.env
   # Edit the .env file with your configuration
   ```

4. Start the application using Docker Compose:
   ```bash
   docker-compose up -d
   ```

5. Access the application:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000

## Development

### Running Tests

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

### Adding New Problems

1. Create a new problem in the database
2. Implement the problem description and test cases
3. Create a solution template
4. Add hints and educational content

### Adding New Executors

See the [Executor System Documentation](docs/executors.md) for details on how to add new executors.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests
4. Implement changes
5. Submit pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Inspired by various coding challenge platforms and educational resources
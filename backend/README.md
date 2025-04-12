# Low-Level Quest Backend

This is the backend service for the Low-Level Quest platform, which provides a code execution environment for various programming challenges.

## API Documentation

### Code Execution API

#### POST /api/execute

Execute code for a problem.

**Request Body:**

```json
{
  "problemId": "123",
  "code": "source code here",
  "language": "c", // optional, can be inferred from problem
  "category": "algorithm", // required
  "timeout": 5000, // optional, milliseconds
  "memoryLimit": 512, // optional, MB
  "testCases": [ // optional
    {
      "input": "test input",
      "expectedOutput": "expected output",
      "description": "Test case description"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "testResults": [
    {
      "testCaseId": "1",
      "passed": true,
      "expected": "expected output",
      "actual": "actual output",
      "description": "Test case description"
    }
  ],
  "visualizations": [
    {
      "type": "memory-map", // or "component-render", "network-traffic", etc.
      "data": { /* visualization specific data */ }
    }
  ],
  "error": null,
  "metrics": {
    "executionTime": 128, // ms
    "memoryUsed": 1024,   // KB
    // Other metrics
  }
}
```

#### GET /api/execute/:requestId

Get the status of an execution.

**Response:**

```json
{
  "requestId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "completed", // or "running", "failed", "cancelled"
  "startTime": 1618234567890,
  "endTime": 1618234568890,
  "result": {
    "success": true,
    "testResults": [...],
    "visualizations": [...],
    "error": null,
    "metrics": {...}
  },
  "error": null
}
```

#### DELETE /api/execute/:requestId

Cancel an execution.

**Response:**

```json
{
  "success": true,
  "message": "Execution cancelled successfully"
}
```

## Supported Languages

- Python
- JavaScript
- TypeScript
- Java
- C
- C++
- Rust
- Go
- SQL

## Supported Categories

- Algorithm
- Database
- Network
- Security
- Web
- OS
- ML
- Binary
- OOP

## Development

### Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   ```
   cp .env.example .env
   ```

3. Start the development server:
   ```
   npm start
   ```

### Testing

Run tests:
```
npm test
```

Run tests with coverage:
```
npm run test:coverage
```

## Architecture

The backend is built with Node.js and Express, and uses a modular architecture:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Implement business logic
- **Executors**: Execute code in different languages and environments
- **Validators**: Validate input data
- **Routes**: Define API endpoints
- **Models**: Define data models
- **Middleware**: Handle cross-cutting concerns 
const request = require('supertest');
const app = require('../../server');
const ExecutionGatewayService = require('../../services/ExecutionGatewayService');

// Mock the ExecutionGatewayService
jest.mock('../../services/ExecutionGatewayService');

describe('Execution API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/execute', () => {
    it('should return 400 if code is missing', async () => {
      const response = await request(app)
        .post('/api/execute')
        .send({
          language: 'javascript',
          category: 'algorithm',
          timeout: 5000
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Code is required');
    });

    it('should return 400 if language is missing', async () => {
      const response = await request(app)
        .post('/api/execute')
        .send({
          code: 'console.log("Hello, world!");',
          category: 'algorithm',
          timeout: 5000
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Language is required');
    });

    it('should return 400 if category is missing', async () => {
      const response = await request(app)
        .post('/api/execute')
        .send({
          code: 'console.log("Hello, world!");',
          language: 'javascript',
          timeout: 5000
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Category is required');
    });

    it('should return 400 if language is not supported', async () => {
      const response = await request(app)
        .post('/api/execute')
        .send({
          code: 'console.log("Hello, world!");',
          language: 'unsupported',
          category: 'algorithm',
          timeout: 5000
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Unsupported language');
    });

    it('should return 400 if category is not supported', async () => {
      const response = await request(app)
        .post('/api/execute')
        .send({
          code: 'console.log("Hello, world!");',
          language: 'javascript',
          category: 'unsupported',
          timeout: 5000
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Unsupported category');
    });

    it('should execute code and return results', async () => {
      // Mock the executeCode method
      ExecutionGatewayService.executeCode.mockResolvedValue({
        success: true,
        testResults: [
          {
            testCaseId: '1',
            passed: true,
            expected: 'Hello, world!',
            actual: 'Hello, world!',
            description: 'Test case 1'
          }
        ],
        visualizations: [
          {
            type: 'memory-map',
            data: { /* visualization data */ }
          }
        ],
        error: null,
        metrics: {
          executionTime: 128,
          memoryUsed: 1024
        }
      });

      const response = await request(app)
        .post('/api/execute')
        .send({
          code: 'console.log("Hello, world!");',
          language: 'javascript',
          category: 'algorithm',
          timeout: 5000
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.testResults).toHaveLength(1);
      expect(response.body.testResults[0].passed).toBe(true);
      expect(response.body.visualizations).toHaveLength(1);
      expect(response.body.metrics.executionTime).toBe(128);
      expect(response.body.metrics.memoryUsed).toBe(1024);
    });
  });

  describe('GET /api/execute/:requestId', () => {
    it('should return 400 if requestId is missing', async () => {
      const response = await request(app)
        .get('/api/execute/');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Request ID is required');
    });

    it('should return 404 if execution is not found', async () => {
      // Mock the getExecutionStatus method to throw an error
      ExecutionGatewayService.getExecutionStatus.mockImplementation(() => {
        throw new Error('Execution not found: test-id');
      });

      const response = await request(app)
        .get('/api/execute/test-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Execution request not found');
    });

    it('should return execution status', async () => {
      // Mock the getExecutionStatus method
      ExecutionGatewayService.getExecutionStatus.mockResolvedValue({
        requestId: 'test-id',
        status: 'completed',
        startTime: Date.now() - 1000,
        endTime: Date.now(),
        result: {
          success: true,
          testResults: [
            {
              testCaseId: '1',
              passed: true,
              expected: 'Hello, world!',
              actual: 'Hello, world!',
              description: 'Test case 1'
            }
          ],
          visualizations: [],
          error: null,
          metrics: {
            executionTime: 128,
            memoryUsed: 1024
          }
        },
        error: null
      });

      const response = await request(app)
        .get('/api/execute/test-id');

      expect(response.status).toBe(200);
      expect(response.body.requestId).toBe('test-id');
      expect(response.body.status).toBe('completed');
      expect(response.body.result.success).toBe(true);
    });
  });

  describe('DELETE /api/execute/:requestId', () => {
    it('should return 400 if requestId is missing', async () => {
      const response = await request(app)
        .delete('/api/execute/');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Request ID is required');
    });

    it('should return 404 if execution is not found', async () => {
      // Mock the cancelExecution method to throw an error
      ExecutionGatewayService.cancelExecution.mockImplementation(() => {
        throw new Error('Execution not found: test-id');
      });

      const response = await request(app)
        .delete('/api/execute/test-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Execution request not found');
    });

    it('should cancel execution', async () => {
      // Mock the cancelExecution method
      ExecutionGatewayService.cancelExecution.mockResolvedValue({
        requestId: 'test-id',
        status: 'cancelled'
      });

      const response = await request(app)
        .delete('/api/execute/test-id');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Execution cancelled successfully');
    });
  });
}); 
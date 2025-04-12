const ExecutionQueueService = require('../ExecutionQueueService');
const ExecutionGatewayService = require('../ExecutionGatewayService');

// Mock the ExecutionGatewayService
jest.mock('../ExecutionGatewayService', () => ({
  executeCode: jest.fn()
}));

describe('ExecutionQueueService', () => {
  beforeEach(() => {
    // Clear the queue and results
    ExecutionQueueService.queue = [];
    ExecutionQueueService.executionResults.clear();
    ExecutionQueueService.resourceUsage.concurrentExecutions = 0;
    Object.keys(ExecutionQueueService.resourceUsage.categoryUsage).forEach(category => {
      ExecutionQueueService.resourceUsage.categoryUsage[category].concurrentExecutions = 0;
    });
    
    // Reset the mock
    jest.clearAllMocks();
  });
  
  describe('enqueueRequest', () => {
    it('should add a request to the queue and return a request ID', async () => {
      const request = {
        code: 'console.log("Hello, World!");',
        language: 'javascript',
        category: 'algorithm'
      };
      
      const requestId = await ExecutionQueueService.enqueueRequest(request);
      
      expect(requestId).toBeDefined();
      expect(ExecutionQueueService.queue.length).toBe(1);
      expect(ExecutionQueueService.queue[0].request).toBe(request);
    });
    
    it('should throw an error if the queue is full', async () => {
      // Fill the queue
      ExecutionQueueService.queue = Array(ExecutionQueueService.resourceLimits.maxQueueSize).fill({});
      
      const request = {
        code: 'console.log("Hello, World!");',
        language: 'javascript',
        category: 'algorithm'
      };
      
      await expect(ExecutionQueueService.enqueueRequest(request)).rejects.toThrow('Execution queue is full');
    });
    
    it('should sort requests by priority and timestamp', async () => {
      const request1 = {
        code: 'console.log("First");',
        language: 'javascript',
        category: 'algorithm',
        priority: 1
      };
      
      const request2 = {
        code: 'console.log("Second");',
        language: 'javascript',
        category: 'algorithm',
        priority: 2
      };
      
      const request3 = {
        code: 'console.log("Third");',
        language: 'javascript',
        category: 'algorithm',
        priority: 1
      };
      
      await ExecutionQueueService.enqueueRequest(request1);
      await ExecutionQueueService.enqueueRequest(request2);
      await ExecutionQueueService.enqueueRequest(request3);
      
      expect(ExecutionQueueService.queue[0].request).toBe(request2);
      expect(ExecutionQueueService.queue[1].request).toBe(request1);
      expect(ExecutionQueueService.queue[2].request).toBe(request3);
    });
  });
  
  describe('processQueue', () => {
    it('should process requests in the queue', async () => {
      const mockResult = { output: 'Hello, World!' };
      ExecutionGatewayService.executeCode.mockResolvedValue(mockResult);
      
      const request = {
        code: 'console.log("Hello, World!");',
        language: 'javascript',
        category: 'algorithm'
      };
      
      const requestId = await ExecutionQueueService.enqueueRequest(request);
      
      // Wait for the queue to be processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(ExecutionGatewayService.executeCode).toHaveBeenCalledWith(request);
      expect(ExecutionQueueService.queue.length).toBe(0);
      
      const result = ExecutionQueueService.executionResults.get(requestId);
      expect(result.status).toBe('completed');
      expect(result.result).toBe(mockResult);
    });
    
    it('should respect category-specific limits', async () => {
      const mockResult = { output: 'Hello, World!' };
      ExecutionGatewayService.executeCode.mockResolvedValue(mockResult);
      
      const request1 = {
        code: 'console.log("First");',
        language: 'javascript',
        category: 'algorithm'
      };
      
      const request2 = {
        code: 'console.log("Second");',
        language: 'javascript',
        category: 'algorithm'
      };
      
      const request3 = {
        code: 'console.log("Third");',
        language: 'javascript',
        category: 'algorithm'
      };
      
      const request4 = {
        code: 'console.log("Fourth");',
        language: 'javascript',
        category: 'algorithm'
      };
      
      await ExecutionQueueService.enqueueRequest(request1);
      await ExecutionQueueService.enqueueRequest(request2);
      await ExecutionQueueService.enqueueRequest(request3);
      await ExecutionQueueService.enqueueRequest(request4);
      
      // Wait for the queue to be processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Algorithm category has a limit of 3 concurrent executions
      expect(ExecutionQueueService.resourceUsage.categoryUsage.algorithm.concurrentExecutions).toBeLessThanOrEqual(3);
    });
    
    it('should handle execution errors', async () => {
      const error = new Error('Execution failed');
      ExecutionGatewayService.executeCode.mockRejectedValue(error);
      
      const request = {
        code: 'console.log("Hello, World!");',
        language: 'javascript',
        category: 'algorithm'
      };
      
      const requestId = await ExecutionQueueService.enqueueRequest(request);
      
      // Wait for the queue to be processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = ExecutionQueueService.executionResults.get(requestId);
      expect(result.status).toBe('failed');
      expect(result.error).toBe(error.message);
    });
  });
  
  describe('getExecutionStatus', () => {
    it('should return the status of a queued request', async () => {
      const request = {
        code: 'console.log("Hello, World!");',
        language: 'javascript',
        category: 'algorithm'
      };
      
      const requestId = await ExecutionQueueService.enqueueRequest(request);
      
      const status = ExecutionQueueService.getExecutionStatus(requestId);
      
      expect(status.requestId).toBe(requestId);
      expect(status.status).toBe('queued');
      expect(status.position).toBe(1);
      expect(status.totalInQueue).toBe(1);
      expect(status.estimatedWaitTime).toBeDefined();
    });
    
    it('should return the status of a completed request', async () => {
      const mockResult = { output: 'Hello, World!' };
      ExecutionGatewayService.executeCode.mockResolvedValue(mockResult);
      
      const request = {
        code: 'console.log("Hello, World!");',
        language: 'javascript',
        category: 'algorithm'
      };
      
      const requestId = await ExecutionQueueService.enqueueRequest(request);
      
      // Wait for the queue to be processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const status = ExecutionQueueService.getExecutionStatus(requestId);
      
      expect(status.requestId).toBe(requestId);
      expect(status.status).toBe('completed');
      expect(status.result).toBe(mockResult);
      expect(status.startTime).toBeDefined();
      expect(status.endTime).toBeDefined();
    });
    
    it('should return null for a non-existent request', () => {
      const status = ExecutionQueueService.getExecutionStatus('non-existent-id');
      expect(status).toBeNull();
    });
  });
  
  describe('cancelExecution', () => {
    it('should cancel a queued request', async () => {
      const request = {
        code: 'console.log("Hello, World!");',
        language: 'javascript',
        category: 'algorithm'
      };
      
      const requestId = await ExecutionQueueService.enqueueRequest(request);
      
      const result = ExecutionQueueService.cancelExecution(requestId);
      
      expect(result).toBe(true);
      expect(ExecutionQueueService.queue.length).toBe(0);
    });
    
    it('should not cancel a request that is being executed', async () => {
      const mockResult = { output: 'Hello, World!' };
      ExecutionGatewayService.executeCode.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockResult), 1000)));
      
      const request = {
        code: 'console.log("Hello, World!");',
        language: 'javascript',
        category: 'algorithm'
      };
      
      const requestId = await ExecutionQueueService.enqueueRequest(request);
      
      // Wait for the request to start executing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = ExecutionQueueService.cancelExecution(requestId);
      
      expect(result).toBe(false);
    });
    
    it('should return false for a non-existent request', () => {
      const result = ExecutionQueueService.cancelExecution('non-existent-id');
      expect(result).toBe(false);
    });
  });
  
  describe('getQueueStats', () => {
    it('should return the current queue statistics', async () => {
      const request = {
        code: 'console.log("Hello, World!");',
        language: 'javascript',
        category: 'algorithm'
      };
      
      await ExecutionQueueService.enqueueRequest(request);
      
      const stats = ExecutionQueueService.getQueueStats();
      
      expect(stats.queueLength).toBe(1);
      expect(stats.activeExecutions).toBe(0);
      expect(stats.maxConcurrentExecutions).toBe(ExecutionQueueService.resourceLimits.maxConcurrentExecutions);
      expect(stats.categoryUsage).toBeDefined();
      expect(stats.categoryLimits).toBeDefined();
    });
  });
  
  describe('cleanupOldResults', () => {
    it('should remove old execution results', async () => {
      const mockResult = { output: 'Hello, World!' };
      ExecutionGatewayService.executeCode.mockResolvedValue(mockResult);
      
      const request = {
        code: 'console.log("Hello, World!");',
        language: 'javascript',
        category: 'algorithm'
      };
      
      const requestId = await ExecutionQueueService.enqueueRequest(request);
      
      // Wait for the queue to be processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Set the end time to be older than the max age
      const result = ExecutionQueueService.executionResults.get(requestId);
      result.endTime = Date.now() - 3600001; // 1 hour and 1 millisecond ago
      
      ExecutionQueueService.cleanupOldResults();
      
      expect(ExecutionQueueService.executionResults.has(requestId)).toBe(false);
    });
    
    it('should keep recent execution results', async () => {
      const mockResult = { output: 'Hello, World!' };
      ExecutionGatewayService.executeCode.mockResolvedValue(mockResult);
      
      const request = {
        code: 'console.log("Hello, World!");',
        language: 'javascript',
        category: 'algorithm'
      };
      
      const requestId = await ExecutionQueueService.enqueueRequest(request);
      
      // Wait for the queue to be processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      ExecutionQueueService.cleanupOldResults();
      
      expect(ExecutionQueueService.executionResults.has(requestId)).toBe(true);
    });
  });
}); 
const { v4: uuidv4 } = require('uuid');
const ExecutionGatewayService = require('./ExecutionGatewayService');

/**
 * Priority levels for execution requests
 */
const PRIORITY = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3
};

/**
 * Service for managing execution requests in a queue
 */
class ExecutionQueueService {
  constructor() {
    // Queue for pending execution requests
    this.queue = [];
    
    // Map of active executions
    this.activeExecutions = new Map();
    
    // Map of execution results
    this.executionResults = new Map();
    
    // Resource limits
    this.resourceLimits = {
      maxConcurrentExecutions: 10,
      maxQueueSize: 100,
      maxExecutionTime: 30000, // 30 seconds
      maxMemoryUsage: 1024, // 1GB
    };
    
    // Category-specific resource limits
    this.categoryLimits = {
      algorithm: { maxConcurrent: 3, maxMemory: 512 },
      database: { maxConcurrent: 2, maxMemory: 256 },
      network: { maxConcurrent: 2, maxMemory: 256 },
      security: { maxConcurrent: 2, maxMemory: 256 },
      web: { maxConcurrent: 2, maxMemory: 256 },
      os: { maxConcurrent: 2, maxMemory: 256 },
      ml: { maxConcurrent: 1, maxMemory: 512 },
      binary: { maxConcurrent: 1, maxMemory: 256 },
      oop: { maxConcurrent: 2, maxMemory: 256 }
    };
    
    // Current resource usage
    this.resourceUsage = {
      concurrentExecutions: 0,
      memoryUsage: 0,
      categoryUsage: {}
    };
    
    // Initialize category usage tracking
    Object.keys(this.categoryLimits).forEach(category => {
      this.resourceUsage.categoryUsage[category] = {
        concurrentExecutions: 0,
        memoryUsage: 0
      };
    });
    
    // Start the queue processor
    this.isProcessing = false;
    this.processQueue();
  }
  
  /**
   * Add a request to the execution queue
   * @param {Object} request - The execution request
   * @param {string} request.code - The code to execute
   * @param {string} request.language - The programming language
   * @param {string} request.category - The problem category
   * @param {Object} request.options - Additional execution options
   * @param {number} request.priority - Priority level (0-3)
   * @param {string} request.userId - The ID of the user
   * @param {boolean} request.isAuthenticated - Whether the user is authenticated
   * @returns {Promise<string>} - The request ID
   */
  async enqueueRequest(request) {
    const requestId = uuidv4();
    
    // Check if queue is full
    if (this.queue.length >= this.resourceLimits.maxQueueSize) {
      throw new Error('Execution queue is full. Please try again later.');
    }
    
    // Set default priority if not provided
    const priority = request.priority !== undefined ? request.priority : PRIORITY.MEDIUM;
    
    // Create queue entry
    const queueEntry = {
      id: requestId,
      request,
      priority,
      timestamp: Date.now(),
      status: 'queued'
    };
    
    // Add to queue
    this.queue.push(queueEntry);
    
    // Sort queue by priority (highest first) and timestamp (oldest first)
    this.queue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.timestamp - b.timestamp;
    });
    
    // Start processing if not already processing
    if (!this.isProcessing) {
      this.processQueue();
    }
    
    return requestId;
  }
  
  /**
   * Process the execution queue
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      while (this.queue.length > 0) {
        // Check if we can process more requests
        if (this.resourceUsage.concurrentExecutions >= this.resourceLimits.maxConcurrentExecutions) {
          break;
        }
        
        // Get the next request from the queue
        const queueEntry = this.queue.shift();
        const { id, request } = queueEntry;
        
        // Check category-specific limits
        const category = request.category.toLowerCase();
        const categoryUsage = this.resourceUsage.categoryUsage[category];
        const categoryLimit = this.categoryLimits[category];
        
        if (categoryUsage.concurrentExecutions >= categoryLimit.maxConcurrent) {
          // Put the request back in the queue
          this.queue.unshift(queueEntry);
          break;
        }
        
        // Update resource usage
        this.resourceUsage.concurrentExecutions++;
        categoryUsage.concurrentExecutions++;
        
        // Update queue entry status
        queueEntry.status = 'processing';
        
        // Execute the request
        this.executeRequest(id, request).catch(error => {
          console.error(`Error executing request ${id}:`, error);
          
          // Update resource usage
          this.resourceUsage.concurrentExecutions--;
          categoryUsage.concurrentExecutions--;
          
          // Store error result
          this.executionResults.set(id, {
            status: 'failed',
            error: error.message || 'An unknown error occurred during execution',
            startTime: queueEntry.timestamp,
            endTime: Date.now()
          });
        });
      }
    } finally {
      this.isProcessing = false;
      
      // If there are still items in the queue, schedule the next processing
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 1000);
      }
    }
  }
  
  /**
   * Execute a request
   * @param {string} requestId - The request ID
   * @param {Object} request - The execution request
   * @returns {Promise<void>}
   */
  async executeRequest(requestId, request) {
    const startTime = Date.now();
    
    try {
      // Execute the code
      const result = await ExecutionGatewayService.executeCode(request);
      
      // Store the result
      this.executionResults.set(requestId, {
        status: 'completed',
        result,
        startTime,
        endTime: Date.now()
      });
    } catch (error) {
      // Store the error
      this.executionResults.set(requestId, {
        status: 'failed',
        error: error.message || 'An unknown error occurred during execution',
        startTime,
        endTime: Date.now()
      });
      
      throw error;
    } finally {
      // Update resource usage
      this.resourceUsage.concurrentExecutions--;
      this.resourceUsage.categoryUsage[request.category.toLowerCase()].concurrentExecutions--;
    }
  }
  
  /**
   * Get the status of an execution
   * @param {string} requestId - The request ID
   * @returns {Object} - The execution status
   */
  getExecutionStatus(requestId) {
    // Check if the request is in the queue
    const queueEntry = this.queue.find(entry => entry.id === requestId);
    if (queueEntry) {
      return {
        requestId,
        status: queueEntry.status,
        position: this.queue.indexOf(queueEntry) + 1,
        totalInQueue: this.queue.length,
        estimatedWaitTime: this.estimateWaitTime(queueEntry)
      };
    }
    
    // Check if the request has been executed
    const result = this.executionResults.get(requestId);
    if (result) {
      return {
        requestId,
        status: result.status,
        result: result.result,
        error: result.error,
        startTime: result.startTime,
        endTime: result.endTime
      };
    }
    
    // Request not found
    return null;
  }
  
  /**
   * Estimate the wait time for a request
   * @param {Object} queueEntry - The queue entry
   * @returns {number} - Estimated wait time in milliseconds
   */
  estimateWaitTime(queueEntry) {
    const { category } = queueEntry.request;
    const categoryLimit = this.categoryLimits[category.toLowerCase()];
    const categoryUsage = this.resourceUsage.categoryUsage[category.toLowerCase()];
    
    // If we're at the category limit, estimate based on queue position
    if (categoryUsage.concurrentExecutions >= categoryLimit.maxConcurrent) {
      const position = this.queue.indexOf(queueEntry);
      const averageExecutionTime = 5000; // 5 seconds
      return position * averageExecutionTime;
    }
    
    // If we're not at the category limit, estimate based on global limit
    if (this.resourceUsage.concurrentExecutions >= this.resourceLimits.maxConcurrentExecutions) {
      const position = this.queue.indexOf(queueEntry);
      const averageExecutionTime = 5000; // 5 seconds
      return position * averageExecutionTime;
    }
    
    // If we have capacity, estimate based on position in queue
    const position = this.queue.indexOf(queueEntry);
    return position * 1000; // 1 second per position
  }
  
  /**
   * Cancel an execution
   * @param {string} requestId - The request ID
   * @returns {boolean} - Whether the cancellation was successful
   */
  cancelExecution(requestId) {
    // Check if the request is in the queue
    const queueIndex = this.queue.findIndex(entry => entry.id === requestId);
    if (queueIndex !== -1) {
      // Remove from queue
      this.queue.splice(queueIndex, 1);
      return true;
    }
    
    // Check if the request is being executed
    const result = this.executionResults.get(requestId);
    if (result && result.status === 'processing') {
      // We can't cancel an execution in progress
      return false;
    }
    
    // Request not found or already completed/failed
    return false;
  }
  
  /**
   * Get queue statistics
   * @returns {Object} - Queue statistics
   */
  getQueueStats() {
    return {
      queueLength: this.queue.length,
      activeExecutions: this.resourceUsage.concurrentExecutions,
      maxConcurrentExecutions: this.resourceLimits.maxConcurrentExecutions,
      categoryUsage: this.resourceUsage.categoryUsage,
      categoryLimits: this.categoryLimits
    };
  }
  
  /**
   * Clean up old execution results
   * @param {number} maxAge - Maximum age of results to keep in milliseconds
   */
  cleanupOldResults(maxAge = 3600000) { // Default 1 hour
    const now = Date.now();
    
    for (const [requestId, result] of this.executionResults.entries()) {
      if (result.endTime && now - result.endTime > maxAge) {
        this.executionResults.delete(requestId);
      }
    }
  }
}

module.exports = new ExecutionQueueService(); 
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const Redis = require('ioredis');
const { promisify } = require('util');
const sleep = promisify(setTimeout);

// Import executors
const AlgorithmExecutor = require('../executors/algorithm/AlgorithmExecutor');
const DatabaseExecutor = require('../executors/database/DatabaseExecutor');
const MLExecutor = require('../executors/ml/MLExecutor');
const NetworkExecutor = require('../executors/network/NetworkExecutor');
const OOPExecutor = require('../executors/oop/OOPExecutor');
const OSExecutor = require('../executors/os/OSExecutor');
const SecurityExecutor = require('../executors/security/SecurityExecutor');
const WebExecutor = require('../executors/web/WebExecutor');

// Initialize Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
});

class ExecutionGatewayService {
  constructor() {
    this.executors = {
      algorithm: AlgorithmExecutor,
      database: DatabaseExecutor,
      network: NetworkExecutor,
      security: SecurityExecutor,
      web: WebExecutor,
      os: OSExecutor,
    };
    this.activeExecutions = new Map();
  }

  /**
   * Execute code using the appropriate executor
   * @param {Object} request - The execution request
   * @param {string} request.code - The code to execute
   * @param {string} request.language - The programming language
   * @param {string} request.category - The problem category
   * @param {Object} request.options - Additional execution options
   * @returns {Promise<Object>} Execution result
   */
  async executeCode(request) {
    const requestId = uuidv4();
    const { code, language, category, options = {} } = request;

    try {
      // Get the appropriate executor
      const ExecutorClass = this.executors[category.toLowerCase()];
      if (!ExecutorClass) {
        throw new Error(`Unsupported category: ${category}`);
      }

      // Create executor instance
      const executor = new ExecutorClass(code, language, options);

      // Store execution reference
      this.activeExecutions.set(requestId, {
        executor,
        status: 'running',
        startTime: Date.now(),
      });

      // Execute code
      const result = await executor.execute();

      // Format test results
      const testResults = result.testResults.map((test, index) => ({
        testCaseId: (index + 1).toString(),
        passed: test.passed,
        expected: test.expectedOutput,
        actual: test.actualOutput,
        description: test.description || `Test case ${index + 1}`
      }));

      // Format response
      const response = {
        success: result.success,
        testResults,
        visualizations: result.visualizations || [],
        error: result.error || null,
        metrics: {
          executionTime: result.metrics?.executionTime || 0,
          memoryUsed: result.metrics?.memoryUsed || 0,
          ...result.metrics
        }
      };

      // Update execution status
      this.activeExecutions.set(requestId, {
        ...this.activeExecutions.get(requestId),
        status: 'completed',
        endTime: Date.now(),
        result: response,
      });

      return response;
    } catch (error) {
      // Update execution status on error
      if (this.activeExecutions.has(requestId)) {
        this.activeExecutions.set(requestId, {
          ...this.activeExecutions.get(requestId),
          status: 'failed',
          endTime: Date.now(),
          error: error.message,
        });
      }

      throw error;
    }
  }

  /**
   * Get the status of an execution
   * @param {string} requestId - The execution request ID
   * @returns {Object} Execution status
   */
  getExecutionStatus(requestId) {
    const execution = this.activeExecutions.get(requestId);
    if (!execution) {
      throw new Error(`Execution not found: ${requestId}`);
    }

    return {
      requestId,
      status: execution.status,
      startTime: execution.startTime,
      endTime: execution.endTime,
      result: execution.result,
      error: execution.error,
    };
  }

  /**
   * Cancel an execution
   * @param {string} requestId - The execution request ID
   * @returns {Object} Cancellation result
   */
  async cancelExecution(requestId) {
    const execution = this.activeExecutions.get(requestId);
    if (!execution) {
      throw new Error(`Execution not found: ${requestId}`);
    }

    if (execution.status === 'completed' || execution.status === 'failed') {
      throw new Error(`Cannot cancel ${execution.status} execution`);
    }

    try {
      // Cleanup executor resources
      await execution.executor.cleanup();

      // Update execution status
      this.activeExecutions.set(requestId, {
        ...execution,
        status: 'cancelled',
        endTime: Date.now(),
      });

      return {
        requestId,
        status: 'cancelled',
      };
    } catch (error) {
      throw new Error(`Failed to cancel execution: ${error.message}`);
    }
  }

  /**
   * Cleanup completed executions
   * @param {number} maxAge - Maximum age of executions to keep in milliseconds
   */
  cleanupExecutions(maxAge = 3600000) { // Default 1 hour
    const now = Date.now();
    for (const [requestId, execution] of this.activeExecutions.entries()) {
      if (execution.status !== 'running' && now - execution.endTime > maxAge) {
        this.activeExecutions.delete(requestId);
      }
    }
  }
}

module.exports = new ExecutionGatewayService(); 
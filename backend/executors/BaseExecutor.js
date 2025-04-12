const pool = require("../db");
const Docker = require("dockerode");

class BaseExecutor {
  constructor() {
    this.metrics = {
      executionTime: 0,
      memoryUsage: 0,
      cpuUsage: 0
    };
    this.docker = new Docker();
    this.container = null;
    this.useDocker = true; // Default to using Docker for isolation
  }

  /**
   * Create a Docker container for isolated execution
   * @param {string} image - Docker image to use
   * @param {Object} options - Additional options for container creation
   * @returns {Promise<void>}
   */
  async createDockerContainer(image, options = {}) {
    if (!this.useDocker) {
      console.log("Docker is disabled, skipping container creation");
      return;
    }

    // Pull the image if it doesn't exist
    try {
      await this.docker.getImage(image).inspect();
    } catch (error) {
      console.log(`Pulling Docker image: ${image}`);
      await new Promise((resolve, reject) => {
        this.docker.pull(image, (err, stream) => {
          if (err) return reject(err);
          
          this.docker.modem.followProgress(stream, (err, res) => {
            if (err) return reject(err);
            resolve(res);
          });
        });
      });
    }
    
    // Default container configuration
    const defaultConfig = {
      Image: image,
      Cmd: ["tail", "-f", "/dev/null"], // Keep container running
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
      WorkingDir: "/app",
      HostConfig: {
        Memory: 2 * 1024 * 1024 * 1024, // 2GB memory limit
        MemorySwap: 2 * 1024 * 1024 * 1024,
        CpuPeriod: 100000,
        CpuQuota: 50000, // 50% CPU limit
        NetworkMode: "none", // Isolate network
        SecurityOpt: ["no-new-privileges"],
        ReadonlyRootfs: true
      }
    };
    
    // Merge default config with provided options
    const containerConfig = {
      ...defaultConfig,
      ...options,
      HostConfig: {
        ...defaultConfig.HostConfig,
        ...(options.HostConfig || {})
      }
    };
    
    // Create a container
    console.log("Creating Docker container");
    this.container = await this.docker.createContainer(containerConfig);
    
    // Start the container
    await this.container.start();
    console.log("Docker container started");
  }

  /**
   * Execute a command in the Docker container
   * @param {string} command - Command to execute
   * @param {Object} options - Additional options for execution
   * @returns {Promise<Object>} - Execution result
   */
  async executeInContainer(command, options = {}) {
    if (!this.container) {
      throw new Error("No Docker container available");
    }
    
    const defaultOptions = {
      Cmd: ["/bin/sh", "-c", command],
      AttachStdout: true,
      AttachStderr: true,
      AttachStdin: true
    };
    
    const execOptions = { ...defaultOptions, ...options };
    
    const exec = await this.container.exec(execOptions);
    const stream = await exec.start();
    
    return new Promise((resolve, reject) => {
      let output = "";
      let error = "";
      
      stream.on("data", (chunk) => {
        output += chunk.toString();
      });
      
      stream.on("error", (err) => {
        console.error("Stream error:", err);
        error += err.toString();
      });
      
      stream.on("end", () => {
        resolve({
          output: output.trim(),
          error: error.trim() || null,
          exitCode: 0
        });
      });
    });
  }

  /**
   * Clean up Docker resources
   * @returns {Promise<void>}
   */
  async cleanupDocker() {
    if (this.container) {
      try {
        console.log("Stopping Docker container");
        await this.container.stop();
        await this.container.remove();
        console.log("Docker container removed");
      } catch (error) {
        console.error("Error cleaning up Docker container:", error);
      }
    }
  }

  /**
   * Prepare the execution environment for the code
   * @param {string} problemId - The ID of the problem
   * @param {string} code - The code to execute
   * @param {string} language - The programming language
   * @returns {Promise<void>}
   */
  async prepareEnvironment(problemId, code, language) {
    throw new Error("Method 'prepareEnvironment' must be implemented by subclasses");
  }

  /**
   * Run the code with the given input
   * @param {string} input - Input to the program
   * @returns {Promise<Object>} - Execution result
   */
  async runCode(input) {
    throw new Error("Method 'runCode' must be implemented by subclasses");
  }

  /**
   * Run tests against the code
   * @param {Array} testCases - Array of test cases
   * @returns {Promise<Array>} - Array of test results
   */
  async runTests(testCases) {
    throw new Error("Method 'runTests' must be implemented by subclasses");
  }

  /**
   * Generate visualizations for the execution
   * @returns {Promise<Array>} - Array of visualizations
   */
  async generateVisualizations() {
    throw new Error("Method 'generateVisualizations' must be implemented by subclasses");
  }

  /**
   * Clean up resources after execution
   * @returns {Promise<void>}
   */
  async cleanup() {
    throw new Error("Method 'cleanup' must be implemented by subclasses");
  }

  /**
   * Collect metrics about the execution
   * @returns {Object} - Metrics object
   */
  collectMetrics() {
    return this.metrics;
  }

  /**
   * Execute the code and return the results
   * @param {string} problemId - The ID of the problem
   * @param {string} code - The code to execute
   * @param {string} language - The programming language
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Object>} - Execution results
   */
  async execute(problemId, code, language, timeout = 5000) {
    const startTime = Date.now();
    
    try {
      // Prepare the environment
      await this.prepareEnvironment(problemId, code, language);
      
      // Get test cases
      const testCases = await this.getTestCases(problemId);
      
      if (testCases.length === 0) {
        throw new Error("No test cases found for this problem");
      }
      
      // Run tests
      const testResults = await this.runTests(testCases);
      
      // Generate visualizations
      const visualizations = await this.generateVisualizations();
      
      // Calculate metrics
      this.metrics.executionTime = Date.now() - startTime;
      
      // Clean up resources
      await this.cleanup();
      
      // Return the results
      return {
        success: true,
        testResults,
        visualizations,
        metrics: this.collectMetrics()
      };
    } catch (error) {
      console.error("Error executing code:", error);
      
      // Clean up resources even if there was an error
      await this.cleanup();
      
      return {
        success: false,
        error: error.message || "Unknown error occurred",
        metrics: this.collectMetrics()
      };
    }
  }
}

module.exports = BaseExecutor; 
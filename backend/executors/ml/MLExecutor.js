const { spawn } = require("child_process");
const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const BaseExecutor = require("../BaseExecutor");
const Docker = require("dockerode");

class MLExecutor extends BaseExecutor {
  constructor() {
    super();
    this.tempDir = null;
    this.sourceFile = null;
    this.code = null;
    this.language = null;
    this.timeout = 30000; // Longer timeout for ML tasks
    this.docker = new Docker();
    this.container = null;
    this.mlMetrics = {
      modelType: null,
      features: [],
      hyperparameters: {},
      trainingTime: 0,
      inferenceTime: 0,
      accuracy: 0,
      loss: 0
    };
  }

  /**
   * Prepare the execution environment for the code
   * @param {string} problemId - The ID of the problem
   * @param {string} code - The code to execute
   * @param {string} language - The programming language
   * @returns {Promise<void>}
   */
  async prepareEnvironment(problemId, code, language) {
    this.code = code;
    this.language = language || "python"; // Default to Python for ML tasks
    
    // Create a temporary directory for code execution
    this.tempDir = path.join("/tmp", `code-${uuidv4()}`);
    
    // Set file extension based on language
    let extension;
    switch (this.language) {
      case "python":
        extension = "py";
        break;
      case "r":
        extension = "R";
        break;
      case "julia":
        extension = "jl";
        break;
      default:
        extension = "py"; // Default to Python
    }
    
    this.sourceFile = path.join(this.tempDir, `solution.${extension}`);
    
    console.log("Creating temporary directory:", this.tempDir);
    await fs.mkdir(this.tempDir, { recursive: true });
    
    // Write the code to the source file
    await fs.writeFile(this.sourceFile, this.code);
    console.log("Code written to file:", this.sourceFile);
    
    // Analyze the code for ML metrics
    await this.analyzeMLMetrics();
  }

  /**
   * Analyze the code for ML metrics
   * @returns {Promise<void>}
   */
  async analyzeMLMetrics() {
    // This is a simplified analysis - in a real implementation,
    // you would use more sophisticated techniques to analyze the code
    const code = this.code.toLowerCase();
    
    // Detect model type
    if (code.includes("linearregression") || code.includes("logisticregression")) {
      this.mlMetrics.modelType = "linear";
    } else if (code.includes("randomforest") || code.includes("decisiontree")) {
      this.mlMetrics.modelType = "tree";
    } else if (code.includes("svm") || code.includes("support vector")) {
      this.mlMetrics.modelType = "svm";
    } else if (code.includes("neural") || code.includes("nn") || code.includes("deep learning")) {
      this.mlMetrics.modelType = "neural_network";
    } else if (code.includes("kmeans") || code.includes("clustering")) {
      this.mlMetrics.modelType = "clustering";
    } else {
      this.mlMetrics.modelType = "unknown";
    }
    
    // Extract features (simplified)
    const featureRegex = /feature[s]?\s*=\s*\[(.*?)\]/s;
    const featureMatch = code.match(featureRegex);
    if (featureMatch && featureMatch[1]) {
      this.mlMetrics.features = featureMatch[1]
        .split(",")
        .map(f => f.trim().replace(/['"]/g, ""))
        .filter(f => f);
    }
    
    // Extract hyperparameters (simplified)
    const hyperparamRegex = /(\w+)\s*=\s*([0-9.]+)/g;
    let match;
    while ((match = hyperparamRegex.exec(code)) !== null) {
      const param = match[1];
      const value = parseFloat(match[2]);
      
      // Common hyperparameter names
      if (["learning_rate", "lr", "alpha", "beta", "gamma", "c", "k", "n_estimators", "max_depth"].includes(param)) {
        this.mlMetrics.hyperparameters[param] = value;
      }
    }
    
    console.log("ML Metrics:", this.mlMetrics);
  }

  /**
   * Create a Docker container for isolated execution
   * @returns {Promise<void>}
   */
  async createDockerContainer() {
    // Select the appropriate Docker image based on the language
    let image;
    switch (this.language) {
      case "python":
        image = "python:3.9-slim";
        break;
      case "r":
        image = "r-base:latest";
        break;
      case "julia":
        image = "julia:latest";
        break;
      default:
        image = "python:3.9-slim";
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
    
    // Create a container
    console.log("Creating Docker container");
    this.container = await this.docker.createContainer({
      Image: image,
      Cmd: ["tail", "-f", "/dev/null"], // Keep container running
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
      WorkingDir: "/app",
      HostConfig: {
        Memory: 4 * 1024 * 1024 * 1024, // 4GB memory limit
        MemorySwap: 4 * 1024 * 1024 * 1024,
        CpuPeriod: 100000,
        CpuQuota: 50000, // 50% CPU limit
        NetworkMode: "none", // Isolate network
        SecurityOpt: ["no-new-privileges"],
        ReadonlyRootfs: true,
        Binds: [`${this.tempDir}:/app:ro`]
      }
    });
    
    // Start the container
    await this.container.start();
    console.log("Docker container started");
    
    // Install required packages
    await this.installDependencies();
  }

  /**
   * Install required dependencies in the Docker container
   * @returns {Promise<void>}
   */
  async installDependencies() {
    // Install common ML libraries based on the language
    let installCmd;
    
    switch (this.language) {
      case "python":
        installCmd = "pip install numpy pandas scikit-learn tensorflow torch";
        break;
      case "r":
        installCmd = "R -e 'install.packages(c(\"caret\", \"randomForest\", \"e1071\", \"nnet\"), repos=\"https://cran.rstudio.com/\")'";
        break;
      case "julia":
        installCmd = "julia -e 'using Pkg; Pkg.add([\"MLJ\", \"DataFrames\", \"Plots\"])'";
        break;
      default:
        installCmd = "pip install numpy pandas scikit-learn";
    }
    
    console.log("Installing dependencies:", installCmd);
    
    const exec = await this.container.exec({
      Cmd: ["/bin/sh", "-c", installCmd],
      AttachStdout: true,
      AttachStderr: true
    });
    
    const stream = await exec.start();
    
    return new Promise((resolve, reject) => {
      let output = "";
      let error = "";
      
      stream.on("data", (chunk) => {
        output += chunk.toString();
      });
      
      stream.on("end", () => {
        if (error) {
          console.error("Error installing dependencies:", error);
          reject(new Error(`Failed to install dependencies: ${error}`));
        } else {
          console.log("Dependencies installed successfully");
          resolve();
        }
      });
    });
  }

  /**
   * Run the code with the given input
   * @param {string} input - Input to the program
   * @returns {Promise<Object>} - Execution result
   */
  async runCode(input) {
    // Create Docker container if not already created
    if (!this.container) {
      await this.createDockerContainer();
    }
    
    return new Promise(async (resolve, reject) => {
      console.log("Running code with input:", input);
      const startTime = Date.now();
      
      // Write input to a file in the container
      const inputFile = path.join(this.tempDir, "input.txt");
      await fs.writeFile(inputFile, input);
      
      // Determine the command to run based on the language
      let command;
      switch (this.language) {
        case "python":
          command = `python /app/solution.py < /app/input.txt`;
          break;
        case "r":
          command = `Rscript /app/solution.R < /app/input.txt`;
          break;
        case "julia":
          command = `julia /app/solution.jl < /app/input.txt`;
          break;
        default:
          command = `python /app/solution.py < /app/input.txt`;
      }
      
      // Execute the command in the container
      const exec = await this.container.exec({
        Cmd: ["/bin/sh", "-c", command],
        AttachStdout: true,
        AttachStderr: true,
        AttachStdin: true
      });
      
      const stream = await exec.start();
      
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
        console.log("Stream ended");
        const executionTime = Date.now() - startTime;
        
        // Update metrics
        this.metrics.executionTime = executionTime;
        
        // Try to extract ML metrics from the output
        this.extractMLMetricsFromOutput(output);
        
        resolve({
          output: output.trim(),
          error: error.trim() || null,
          exitCode: 0,
          executionTime
        });
      });
      
      // Set timeout
      const timeoutId = setTimeout(() => {
        console.log("Execution timeout reached");
        stream.destroy();
        reject(new Error("Execution timeout"));
      }, this.timeout);
      
      // Clear timeout when stream ends
      stream.on("end", () => {
        clearTimeout(timeoutId);
      });
    });
  }

  /**
   * Extract ML metrics from the output
   * @param {string} output - Program output
   * @returns {void}
   */
  extractMLMetricsFromOutput(output) {
    // Look for common ML metrics in the output
    const accuracyRegex = /accuracy:\s*([0-9.]+)/i;
    const lossRegex = /loss:\s*([0-9.]+)/i;
    const trainingTimeRegex = /training time:\s*([0-9.]+)/i;
    const inferenceTimeRegex = /inference time:\s*([0-9.]+)/i;
    
    const accuracyMatch = output.match(accuracyRegex);
    const lossMatch = output.match(lossRegex);
    const trainingTimeMatch = output.match(trainingTimeRegex);
    const inferenceTimeMatch = output.match(inferenceTimeRegex);
    
    if (accuracyMatch) {
      this.mlMetrics.accuracy = parseFloat(accuracyMatch[1]);
    }
    
    if (lossMatch) {
      this.mlMetrics.loss = parseFloat(lossMatch[1]);
    }
    
    if (trainingTimeMatch) {
      this.mlMetrics.trainingTime = parseFloat(trainingTimeMatch[1]);
    }
    
    if (inferenceTimeMatch) {
      this.mlMetrics.inferenceTime = parseFloat(inferenceTimeMatch[1]);
    }
  }

  /**
   * Run tests against the code
   * @param {Array} testCases - Array of test cases
   * @returns {Promise<Array>} - Array of test results
   */
  async runTests(testCases) {
    // Create Docker container if not already created
    if (!this.container) {
      await this.createDockerContainer();
    }
    
    // Run each test case
    const results = [];
    
    for (const testCase of testCases) {
      try {
        const result = await this.runCode(testCase.input);
        
        // Compare the output with the expected output
        const normalizedOutput = result.output.trim().replace(/\r\n/g, "\n");
        const normalizedExpected = testCase.expected_output.trim().replace(/\r\n/g, "\n");
        const passed = normalizedOutput === normalizedExpected;
        
        results.push({
          testCaseId: testCase.id,
          passed,
          expected: testCase.expected_output,
          actual: result.output,
          description: testCase.description,
          error: result.error,
          executionTime: result.executionTime
        });
      } catch (error) {
        results.push({
          testCaseId: testCase.id,
          passed: false,
          expected: testCase.expected_output,
          actual: "",
          description: testCase.description,
          error: error.message,
          executionTime: 0
        });
      }
    }
    
    return results;
  }

  /**
   * Generate visualizations for the execution
   * @returns {Promise<Array>} - Array of visualizations
   */
  async generateVisualizations() {
    // For ML problems, we can generate model performance visualizations
    return [
      {
        type: "model-performance",
        data: {
          accuracy: this.mlMetrics.accuracy,
          loss: this.mlMetrics.loss,
          trainingTime: this.mlMetrics.trainingTime,
          inferenceTime: this.mlMetrics.inferenceTime
        }
      },
      {
        type: "model-architecture",
        data: {
          modelType: this.mlMetrics.modelType,
          features: this.mlMetrics.features,
          hyperparameters: this.mlMetrics.hyperparameters
        }
      }
    ];
  }

  /**
   * Clean up resources after execution
   * @returns {Promise<void>}
   */
  async cleanup() {
    // Stop and remove the Docker container
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
    
    // Clean up temporary directory
    if (this.tempDir) {
      try {
        console.log("Cleaning up temporary directory:", this.tempDir);
        await fs.rm(this.tempDir, { recursive: true, force: true });
      } catch (error) {
        console.error("Error cleaning up temporary directory:", error);
      }
    }
  }
}

module.exports = MLExecutor; 
const { spawn } = require("child_process");
const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const BaseExecutor = require("../BaseExecutor");

class AlgorithmExecutor extends BaseExecutor {
  constructor() {
    super();
    this.tempDir = null;
    this.sourceFile = null;
    this.executableFile = null;
    this.code = null;
    this.language = null;
    this.timeout = 5000;
    this.algorithmMetrics = {
      timeComplexity: null,
      spaceComplexity: null,
      executionSteps: []
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
    this.language = language || "python"; // Default to Python if not specified
    
    // Create a temporary directory for code execution
    this.tempDir = path.join("/tmp", `code-${uuidv4()}`);
    
    // Set file extension based on language
    let extension;
    switch (this.language) {
      case "python":
        extension = "py";
        break;
      case "java":
        extension = "java";
        break;
      case "javascript":
        extension = "js";
        break;
      case "c":
        extension = "c";
        break;
      case "cpp":
        extension = "cpp";
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
  }

  /**
   * Compile the code if needed
   * @returns {Promise<void>}
   */
  async compileCode() {
    // Only compile if the language requires compilation
    if (["java", "c", "cpp"].includes(this.language)) {
      return new Promise((resolve, reject) => {
        let compiler;
        let args;
        
        switch (this.language) {
          case "java":
            compiler = "javac";
            args = [this.sourceFile];
            this.executableFile = path.join(this.tempDir, "Solution");
            break;
          case "c":
            compiler = "gcc";
            args = ["-o", path.join(this.tempDir, "solution"), this.sourceFile];
            this.executableFile = path.join(this.tempDir, "solution");
            break;
          case "cpp":
            compiler = "g++";
            args = ["-o", path.join(this.tempDir, "solution"), this.sourceFile];
            this.executableFile = path.join(this.tempDir, "solution");
            break;
        }
        
        console.log(`Compiling with ${compiler}:`, this.sourceFile);
        
        const compileProcess = spawn(compiler, args);
        
        let error = "";
        
        compileProcess.stderr.on("data", (data) => {
          console.log("Compilation error:", data.toString());
          error += data.toString();
        });
        
        compileProcess.on("error", (err) => {
          console.error("Compilation process error:", err);
          reject(err);
        });
        
        compileProcess.on("close", (code) => {
          console.log("Compilation completed with code:", code);
          if (code !== 0) {
            reject(new Error(`Compilation failed: ${error}`));
          } else {
            resolve();
          }
        });
        
        // Set timeout for compilation
        const timeoutId = setTimeout(() => {
          console.log("Compilation timeout reached");
          compileProcess.kill();
          reject(new Error("Compilation timeout"));
        }, this.timeout);
        
        // Clear timeout when compilation completes
        compileProcess.on("close", () => {
          clearTimeout(timeoutId);
        });
      });
    }
  }

  /**
   * Run the code with the given input
   * @param {string} input - Input to the program
   * @returns {Promise<Object>} - Execution result
   */
  async runCode(input) {
    return new Promise((resolve, reject) => {
      console.log("Running code with input:", input);
      const startTime = Date.now();
      
      let command;
      let args;
      
      switch (this.language) {
        case "python":
          command = "python3";
          args = [this.sourceFile];
          break;
        case "java":
          command = "java";
          args = ["-cp", this.tempDir, "Solution"];
          break;
        case "javascript":
          command = "node";
          args = [this.sourceFile];
          break;
        case "c":
        case "cpp":
          command = this.executableFile;
          args = [];
          break;
        default:
          command = "python3";
          args = [this.sourceFile];
      }
      
      const process = spawn(command, args);
      
      let output = "";
      let error = "";
      
      process.stdout.on("data", (data) => {
        console.log("Received stdout:", data.toString());
        output += data.toString();
      });
      
      process.stderr.on("data", (data) => {
        console.log("Received stderr:", data.toString());
        error += data.toString();
      });
      
      process.on("error", (err) => {
        console.error("Process error:", err);
        reject(err);
      });
      
      process.on("close", (code) => {
        console.log("Process closed with code:", code);
        const executionTime = Date.now() - startTime;
        
        // Update metrics
        this.metrics.executionTime = executionTime;
        
        resolve({
          output: output.trim(),
          error: error.trim() || null,
          exitCode: code,
          executionTime
        });
      });
      
      // Send input to the process
      if (input) {
        process.stdin.write(input);
        process.stdin.end();
      }
      
      // Set timeout
      const timeoutId = setTimeout(() => {
        console.log("Execution timeout reached");
        process.kill();
        reject(new Error("Execution timeout"));
      }, this.timeout);
      
      // Clear timeout when process completes
      process.on("close", () => {
        clearTimeout(timeoutId);
      });
    });
  }

  /**
   * Run tests against the code
   * @param {Array} testCases - Array of test cases
   * @returns {Promise<Array>} - Array of test results
   */
  async runTests(testCases) {
    // Compile the code if needed
    await this.compileCode();
    
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
   * Analyze the algorithm's complexity
   * @returns {Promise<Object>} - Complexity analysis
   */
  async analyzeComplexity() {
    // This is a simplified analysis - in a real implementation,
    // you would use more sophisticated techniques to analyze the code
    const code = this.code.toLowerCase();
    
    // Simple heuristics for time complexity
    let timeComplexity = "O(1)";
    if (code.includes("for") && code.includes("for")) {
      timeComplexity = "O(n²)";
    } else if (code.includes("for") || code.includes("while")) {
      timeComplexity = "O(n)";
    } else if (code.includes("recursion") || code.includes("recursive")) {
      timeComplexity = "O(2ⁿ)";
    }
    
    // Simple heuristics for space complexity
    let spaceComplexity = "O(1)";
    if (code.includes("array") || code.includes("list") || code.includes("vector")) {
      spaceComplexity = "O(n)";
    }
    
    this.algorithmMetrics.timeComplexity = timeComplexity;
    this.algorithmMetrics.spaceComplexity = spaceComplexity;
    
    return {
      timeComplexity,
      spaceComplexity
    };
  }

  /**
   * Generate visualizations for the execution
   * @returns {Promise<Array>} - Array of visualizations
   */
  async generateVisualizations() {
    // For algorithm problems, we can generate execution step visualizations
    return [
      {
        type: "execution-steps",
        data: this.algorithmMetrics.executionSteps
      },
      {
        type: "complexity-analysis",
        data: {
          timeComplexity: this.algorithmMetrics.timeComplexity,
          spaceComplexity: this.algorithmMetrics.spaceComplexity
        }
      }
    ];
  }

  /**
   * Clean up resources after execution
   * @returns {Promise<void>}
   */
  async cleanup() {
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

module.exports = AlgorithmExecutor; 
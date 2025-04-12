const { spawn } = require("child_process");
const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const BaseExecutor = require("../BaseExecutor");

class WebExecutor extends BaseExecutor {
  constructor() {
    super();
    this.tempDir = null;
    this.sourceFile = null;
    this.code = null;
    this.language = null;
    this.timeout = 5000;
    this.nodeProcess = null;
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
    this.language = language || "javascript"; // Default to JavaScript if not specified
    
    // Create a temporary directory for code execution
    this.tempDir = path.join("/tmp", `code-${uuidv4()}`);
    this.sourceFile = path.join(this.tempDir, `solution.${this.language === "javascript" ? "js" : "ts"}`);
    
    console.log("Creating temporary directory:", this.tempDir);
    await fs.mkdir(this.tempDir, { recursive: true });
    
    // Write the code to the source file
    await fs.writeFile(this.sourceFile, this.code);
    console.log("Code written to file:", this.sourceFile);
  }

  /**
   * Compile TypeScript code to JavaScript
   * @returns {Promise<void>}
   */
  async compileTypeScript() {
    return new Promise((resolve, reject) => {
      console.log("Compiling TypeScript to JavaScript");
      
      const tscProcess = spawn("npx", ["tsc", this.sourceFile, "--outDir", this.tempDir]);
      
      let error = "";
      
      tscProcess.stderr.on("data", (data) => {
        console.log("TypeScript compilation error:", data.toString());
        error += data.toString();
      });
      
      tscProcess.on("error", (err) => {
        console.error("TypeScript compilation process error:", err);
        reject(err);
      });
      
      tscProcess.on("close", (code) => {
        console.log("TypeScript compilation completed with code:", code);
        if (code !== 0) {
          reject(new Error(`TypeScript compilation failed: ${error}`));
        } else {
          // Update source file path to the compiled JavaScript file
          this.sourceFile = path.join(this.tempDir, "solution.js");
          resolve();
        }
      });
      
      // Set timeout for compilation
      const timeoutId = setTimeout(() => {
        console.log("TypeScript compilation timeout reached");
        tscProcess.kill();
        reject(new Error("TypeScript compilation timeout"));
      }, this.timeout);
      
      // Clear timeout when compilation completes
      tscProcess.on("close", () => {
        clearTimeout(timeoutId);
      });
    });
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
      
      // Create a wrapper script that will run the user's code with the input
      const wrapperCode = `
        const input = ${JSON.stringify(input)};
        try {
          ${this.code}
          // If the code doesn't have a main function, assume it's a function that takes input
          if (typeof main === 'function') {
            const result = main(input);
            console.log(JSON.stringify(result));
          }
        } catch (error) {
          console.error(JSON.stringify({ error: error.message }));
        }
      `;
      
      const wrapperFile = path.join(this.tempDir, "wrapper.js");
      fs.writeFile(wrapperFile, wrapperCode)
        .then(() => {
          this.nodeProcess = spawn("node", [wrapperFile]);
          
          let output = "";
          let error = "";
          
          this.nodeProcess.stdout.on("data", (data) => {
            console.log("Received stdout:", data.toString());
            output += data.toString();
          });
          
          this.nodeProcess.stderr.on("data", (data) => {
            console.log("Received stderr:", data.toString());
            error += data.toString();
          });
          
          this.nodeProcess.on("error", (err) => {
            console.error("Process error:", err);
            reject(err);
          });
          
          this.nodeProcess.on("close", (code) => {
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
          
          // Set timeout
          const timeoutId = setTimeout(() => {
            console.log("Execution timeout reached");
            if (this.nodeProcess) {
              this.nodeProcess.kill();
            }
            reject(new Error("Execution timeout"));
          }, this.timeout);
          
          // Clear timeout when process completes
          this.nodeProcess.on("close", () => {
            clearTimeout(timeoutId);
          });
        })
        .catch(reject);
    });
  }

  /**
   * Run tests against the code
   * @param {Array} testCases - Array of test cases
   * @returns {Promise<Array>} - Array of test results
   */
  async runTests(testCases) {
    // Compile TypeScript if needed
    if (this.language === "typescript") {
      await this.compileTypeScript();
    }
    
    // Run each test case
    const results = [];
    
    for (const testCase of testCases) {
      try {
        const result = await this.runCode(testCase.input);
        
        // Parse the output as JSON
        let actualOutput;
        try {
          actualOutput = JSON.parse(result.output);
        } catch (e) {
          actualOutput = result.output;
        }
        
        // Compare the output with the expected output
        const normalizedOutput = JSON.stringify(actualOutput);
        const normalizedExpected = JSON.stringify(testCase.expected_output);
        const passed = normalizedOutput === normalizedExpected;
        
        results.push({
          testCaseId: testCase.id,
          passed,
          expected: testCase.expected_output,
          actual: actualOutput,
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
    // For web problems, we can generate a call stack visualization
    return [
      {
        type: "call-stack",
        data: this.metrics.callStack || []
      }
    ];
  }

  /**
   * Clean up resources after execution
   * @returns {Promise<void>}
   */
  async cleanup() {
    if (this.nodeProcess) {
      this.nodeProcess.kill();
    }
    
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

module.exports = WebExecutor; 
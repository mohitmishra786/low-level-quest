const { spawn } = require("child_process");
const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const BaseExecutor = require("../BaseExecutor");
const crypto = require("crypto");

class SecurityExecutor extends BaseExecutor {
  constructor() {
    super();
    this.tempDir = null;
    this.sourceFile = null;
    this.code = null;
    this.language = null;
    this.timeout = 5000;
    this.securityMetrics = {
      vulnerabilities: [],
      encryptionOperations: 0,
      decryptionOperations: 0,
      hashOperations: 0
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
    if (["c", "cpp"].includes(this.language)) {
      return new Promise((resolve, reject) => {
        const compiler = this.language === "c" ? "gcc" : "g++";
        console.log(`Compiling with ${compiler}:`, this.sourceFile);
        
        const compileProcess = spawn(compiler, ["-o", path.join(this.tempDir, "solution"), this.sourceFile]);
        
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
        case "javascript":
          command = "node";
          args = [this.sourceFile];
          break;
        case "c":
        case "cpp":
          command = path.join(this.tempDir, "solution");
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
   * Analyze the code for security vulnerabilities
   * @returns {Promise<Array>} - Array of vulnerabilities
   */
  async analyzeVulnerabilities() {
    // This is a simplified analysis - in a real implementation,
    // you would use more sophisticated techniques to analyze the code
    const code = this.code.toLowerCase();
    const vulnerabilities = [];
    
    // Check for common security vulnerabilities
    if (code.includes("eval") || code.includes("exec")) {
      vulnerabilities.push({
        type: "code-injection",
        severity: "high",
        description: "Code contains eval or exec, which can lead to code injection vulnerabilities"
      });
    }
    
    if (code.includes("password") && !code.includes("hash") && !code.includes("encrypt")) {
      vulnerabilities.push({
        type: "plaintext-password",
        severity: "high",
        description: "Code contains plaintext password handling"
      });
    }
    
    if (code.includes("sql") && code.includes("+") && !code.includes("parameter")) {
      vulnerabilities.push({
        type: "sql-injection",
        severity: "high",
        description: "Code may be vulnerable to SQL injection"
      });
    }
    
    if (code.includes("http") && !code.includes("https")) {
      vulnerabilities.push({
        type: "insecure-communication",
        severity: "medium",
        description: "Code uses HTTP instead of HTTPS"
      });
    }
    
    this.securityMetrics.vulnerabilities = vulnerabilities;
    
    return vulnerabilities;
  }

  /**
   * Encrypt data using a specified algorithm
   * @param {string} data - Data to encrypt
   * @param {string} algorithm - Encryption algorithm
   * @param {string} key - Encryption key
   * @returns {Promise<string>} - Encrypted data
   */
  async encryptData(data, algorithm = "aes-256-cbc", key = "default-key") {
    return new Promise((resolve, reject) => {
      try {
        // Generate a random IV
        const iv = crypto.randomBytes(16);
        
        // Create cipher
        const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
        
        // Encrypt data
        let encrypted = cipher.update(data, "utf8", "hex");
        encrypted += cipher.final("hex");
        
        // Increment encryption operations counter
        this.securityMetrics.encryptionOperations++;
        
        // Return IV and encrypted data
        resolve(iv.toString("hex") + ":" + encrypted);
      } catch (error) {
        console.error("Encryption error:", error);
        reject(error);
      }
    });
  }

  /**
   * Decrypt data using a specified algorithm
   * @param {string} encryptedData - Data to decrypt
   * @param {string} algorithm - Decryption algorithm
   * @param {string} key - Decryption key
   * @returns {Promise<string>} - Decrypted data
   */
  async decryptData(encryptedData, algorithm = "aes-256-cbc", key = "default-key") {
    return new Promise((resolve, reject) => {
      try {
        // Split IV and encrypted data
        const parts = encryptedData.split(":");
        const iv = Buffer.from(parts[0], "hex");
        const encrypted = parts[1];
        
        // Create decipher
        const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
        
        // Decrypt data
        let decrypted = decipher.update(encrypted, "hex", "utf8");
        decrypted += decipher.final("utf8");
        
        // Increment decryption operations counter
        this.securityMetrics.decryptionOperations++;
        
        resolve(decrypted);
      } catch (error) {
        console.error("Decryption error:", error);
        reject(error);
      }
    });
  }

  /**
   * Hash data using a specified algorithm
   * @param {string} data - Data to hash
   * @param {string} algorithm - Hashing algorithm
   * @returns {Promise<string>} - Hashed data
   */
  async hashData(data, algorithm = "sha256") {
    return new Promise((resolve, reject) => {
      try {
        // Create hash
        const hash = crypto.createHash(algorithm);
        hash.update(data);
        
        // Increment hash operations counter
        this.securityMetrics.hashOperations++;
        
        resolve(hash.digest("hex"));
      } catch (error) {
        console.error("Hashing error:", error);
        reject(error);
      }
    });
  }

  /**
   * Generate visualizations for the execution
   * @returns {Promise<Array>} - Array of visualizations
   */
  async generateVisualizations() {
    // For security problems, we can generate vulnerability visualizations
    return [
      {
        type: "vulnerability-analysis",
        data: this.securityMetrics.vulnerabilities
      },
      {
        type: "security-metrics",
        data: {
          encryptionOperations: this.securityMetrics.encryptionOperations,
          decryptionOperations: this.securityMetrics.decryptionOperations,
          hashOperations: this.securityMetrics.hashOperations
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

module.exports = SecurityExecutor; 
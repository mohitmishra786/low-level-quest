const { spawn } = require("child_process");
const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const BaseExecutor = require("../BaseExecutor");
const net = require("net");
const http = require("http");

class NetworkExecutor extends BaseExecutor {
  constructor() {
    super();
    this.tempDir = null;
    this.sourceFile = null;
    this.code = null;
    this.language = null;
    this.timeout = 5000;
    this.server = null;
    this.client = null;
    this.networkMetrics = {
      packetsSent: 0,
      packetsReceived: 0,
      latency: 0,
      bandwidth: 0
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
   * Start a network server
   * @param {number} port - Port to listen on
   * @returns {Promise<void>}
   */
  async startServer(port) {
    return new Promise((resolve, reject) => {
      console.log(`Starting server on port ${port}`);
      
      // Create a TCP server
      this.server = net.createServer((socket) => {
        console.log("Client connected");
        
        socket.on("data", (data) => {
          console.log("Received data:", data.toString());
          this.networkMetrics.packetsReceived++;
          
          // Echo the data back to the client
          socket.write(data);
          this.networkMetrics.packetsSent++;
        });
        
        socket.on("end", () => {
          console.log("Client disconnected");
        });
        
        socket.on("error", (err) => {
          console.error("Socket error:", err);
        });
      });
      
      this.server.on("error", (err) => {
        console.error("Server error:", err);
        reject(err);
      });
      
      this.server.listen(port, () => {
        console.log(`Server listening on port ${port}`);
        resolve();
      });
    });
  }

  /**
   * Connect to a network server
   * @param {string} host - Host to connect to
   * @param {number} port - Port to connect to
   * @returns {Promise<void>}
   */
  async connectToServer(host, port) {
    return new Promise((resolve, reject) => {
      console.log(`Connecting to server at ${host}:${port}`);
      
      // Create a TCP client
      this.client = new net.Socket();
      
      this.client.on("connect", () => {
        console.log("Connected to server");
        resolve();
      });
      
      this.client.on("data", (data) => {
        console.log("Received data from server:", data.toString());
        this.networkMetrics.packetsReceived++;
      });
      
      this.client.on("end", () => {
        console.log("Disconnected from server");
      });
      
      this.client.on("error", (err) => {
        console.error("Client error:", err);
        reject(err);
      });
      
      this.client.connect(port, host);
    });
  }

  /**
   * Send data to the server
   * @param {string} data - Data to send
   * @returns {Promise<void>}
   */
  async sendData(data) {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        reject(new Error("Not connected to server"));
        return;
      }
      
      console.log("Sending data:", data);
      
      const startTime = Date.now();
      
      this.client.write(data, (err) => {
        if (err) {
          console.error("Error sending data:", err);
          reject(err);
          return;
        }
        
        const endTime = Date.now();
        const latency = endTime - startTime;
        
        this.networkMetrics.latency = latency;
        this.networkMetrics.packetsSent++;
        
        console.log(`Data sent, latency: ${latency}ms`);
        resolve();
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
   * Generate visualizations for the execution
   * @returns {Promise<Array>} - Array of visualizations
   */
  async generateVisualizations() {
    // For network problems, we can generate network traffic visualizations
    return [
      {
        type: "network-traffic",
        data: {
          packetsSent: this.networkMetrics.packetsSent,
          packetsReceived: this.networkMetrics.packetsReceived,
          latency: this.networkMetrics.latency,
          bandwidth: this.networkMetrics.bandwidth
        }
      }
    ];
  }

  /**
   * Clean up resources after execution
   * @returns {Promise<void>}
   */
  async cleanup() {
    // Close network connections
    if (this.client) {
      console.log("Closing client connection");
      this.client.end();
    }
    
    if (this.server) {
      console.log("Closing server");
      this.server.close();
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

module.exports = NetworkExecutor; 
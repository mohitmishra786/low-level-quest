const { spawn } = require("child_process");
const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const BaseExecutor = require("../BaseExecutor");

class DatabaseExecutor extends BaseExecutor {
  constructor() {
    super();
    this.tempDir = null;
    this.sourceFile = null;
    this.code = null;
    this.language = null;
    this.timeout = 5000;
    this.dbConnection = null;
    this.queryResults = [];
    this.dbMetrics = {
      queryCount: 0,
      executionTime: 0,
      rowCount: 0
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
    this.language = language || "sql"; // Default to SQL if not specified
    
    // Create a temporary directory for code execution
    this.tempDir = path.join("/tmp", `code-${uuidv4()}`);
    
    // Set file extension based on language
    let extension;
    switch (this.language) {
      case "sql":
        extension = "sql";
        break;
      case "python":
        extension = "py";
        break;
      case "javascript":
        extension = "js";
        break;
      default:
        extension = "sql"; // Default to SQL
    }
    
    this.sourceFile = path.join(this.tempDir, `solution.${extension}`);
    
    console.log("Creating temporary directory:", this.tempDir);
    await fs.mkdir(this.tempDir, { recursive: true });
    
    // Write the code to the source file
    await fs.writeFile(this.sourceFile, this.code);
    console.log("Code written to file:", this.sourceFile);
    
    // Initialize database connection
    await this.initializeDatabase();
  }

  /**
   * Initialize the database connection
   * @returns {Promise<void>}
   */
  async initializeDatabase() {
    // In a real implementation, you would connect to a database here
    // For this example, we'll simulate a database connection
    console.log("Initializing database connection");
    
    // Simulate database connection
    this.dbConnection = {
      query: async (sql) => {
        console.log("Executing SQL query:", sql);
        this.dbMetrics.queryCount++;
        
        // Simulate query execution time
        const startTime = Date.now();
        await new Promise(resolve => setTimeout(resolve, 100));
        const executionTime = Date.now() - startTime;
        this.dbMetrics.executionTime += executionTime;
        
        // Simulate query results
        const results = this.simulateQueryResults(sql);
        this.dbMetrics.rowCount += results.length;
        this.queryResults.push({
          sql,
          results,
          executionTime
        });
        
        return results;
      }
    };
  }

  /**
   * Simulate query results based on the SQL query
   * @param {string} sql - SQL query
   * @returns {Array} - Simulated query results
   */
  simulateQueryResults(sql) {
    const lowerSql = sql.toLowerCase();
    
    // Simulate different types of queries
    if (lowerSql.includes("select")) {
      if (lowerSql.includes("count")) {
        return [{ count: Math.floor(Math.random() * 100) }];
      } else if (lowerSql.includes("sum")) {
        return [{ sum: Math.floor(Math.random() * 1000) }];
      } else if (lowerSql.includes("avg")) {
        return [{ avg: (Math.random() * 100).toFixed(2) }];
      } else {
        // Return a sample table
        return [
          { id: 1, name: "John", age: 30 },
          { id: 2, name: "Jane", age: 25 },
          { id: 3, name: "Bob", age: 35 }
        ];
      }
    } else if (lowerSql.includes("insert")) {
      return { affectedRows: 1 };
    } else if (lowerSql.includes("update")) {
      return { affectedRows: Math.floor(Math.random() * 10) + 1 };
    } else if (lowerSql.includes("delete")) {
      return { affectedRows: Math.floor(Math.random() * 10) + 1 };
    } else {
      return [];
    }
  }

  /**
   * Execute the code with the given input
   * @param {string} input - Input to the program
   * @returns {Promise<Object>} - Execution result
   */
  async executeCode(input) {
    return new Promise(async (resolve, reject) => {
      console.log("Executing code with input:", input);
      const startTime = Date.now();
      
      try {
        let result;
        
        if (this.language === "sql") {
          // Execute SQL directly
          result = await this.dbConnection.query(this.code);
        } else {
          // For other languages, we need to run the code
          result = await this.runCode(input);
        }
        
        const executionTime = Date.now() - startTime;
        
        // Update metrics
        this.metrics.executionTime = executionTime;
        
        resolve({
          output: JSON.stringify(result),
          error: null,
          executionTime
        });
      } catch (error) {
        console.error("Error executing code:", error);
        reject(error);
      }
    });
  }

  /**
   * Run the code with the given input (for non-SQL languages)
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
    // Run each test case
    const results = [];
    
    for (const testCase of testCases) {
      try {
        const result = await this.executeCode(testCase.input);
        
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
    // For database problems, we can generate query execution visualizations
    return [
      {
        type: "query-execution",
        data: this.queryResults
      },
      {
        type: "database-metrics",
        data: this.dbMetrics
      }
    ];
  }

  /**
   * Clean up resources after execution
   * @returns {Promise<void>}
   */
  async cleanup() {
    // Close database connection
    if (this.dbConnection) {
      console.log("Closing database connection");
      // In a real implementation, you would close the database connection here
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

module.exports = DatabaseExecutor; 
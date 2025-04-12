const { spawn } = require("child_process");
const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const BaseExecutor = require("../BaseExecutor");

class OOPExecutor extends BaseExecutor {
  constructor() {
    super();
    this.tempDir = null;
    this.sourceFile = null;
    this.executableFile = null;
    this.code = null;
    this.language = null;
    this.timeout = 5000;
    this.oopMetrics = {
      classCount: 0,
      methodCount: 0,
      inheritanceDepth: 0,
      polymorphismUsage: 0
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
    this.language = language || "java"; // Default to Java if not specified
    
    // Create a temporary directory for code execution
    this.tempDir = path.join("/tmp", `code-${uuidv4()}`);
    
    // Set file extension based on language
    let extension;
    switch (this.language) {
      case "java":
        extension = "java";
        break;
      case "cpp":
        extension = "cpp";
        break;
      case "python":
        extension = "py";
        break;
      case "javascript":
        extension = "js";
        break;
      default:
        extension = "java"; // Default to Java
    }
    
    this.sourceFile = path.join(this.tempDir, `Solution.${extension}`);
    
    console.log("Creating temporary directory:", this.tempDir);
    await fs.mkdir(this.tempDir, { recursive: true });
    
    // Write the code to the source file
    await fs.writeFile(this.sourceFile, this.code);
    console.log("Code written to file:", this.sourceFile);
    
    // Analyze the code for OOP metrics
    await this.analyzeOOPMetrics();
  }

  /**
   * Analyze the code for OOP metrics
   * @returns {Promise<void>}
   */
  async analyzeOOPMetrics() {
    // This is a simplified analysis - in a real implementation,
    // you would use more sophisticated techniques to analyze the code
    const code = this.code;
    
    // Count classes
    const classRegex = /class\s+(\w+)/g;
    const classMatches = [...code.matchAll(classRegex)];
    this.oopMetrics.classCount = classMatches.length;
    
    // Count methods
    const methodRegex = /(public|private|protected)?\s*(static)?\s*(\w+)\s*\(/g;
    const methodMatches = [...code.matchAll(methodRegex)];
    this.oopMetrics.methodCount = methodMatches.length;
    
    // Check for inheritance
    const inheritanceRegex = /class\s+(\w+)\s+extends\s+(\w+)/g;
    const inheritanceMatches = [...code.matchAll(inheritanceRegex)];
    this.oopMetrics.inheritanceDepth = inheritanceMatches.length;
    
    // Check for polymorphism (method overriding)
    const overrideRegex = /@Override/g;
    const overrideMatches = [...code.matchAll(overrideRegex)];
    this.oopMetrics.polymorphismUsage = overrideMatches.length;
    
    console.log("OOP Metrics:", this.oopMetrics);
  }

  /**
   * Compile the code
   * @returns {Promise<void>}
   */
  async compileCode() {
    return new Promise((resolve, reject) => {
      let compiler;
      let args;
      
      switch (this.language) {
        case "java":
          compiler = "javac";
          args = [this.sourceFile];
          this.executableFile = path.join(this.tempDir, "Solution");
          break;
        case "cpp":
          compiler = "g++";
          args = ["-o", path.join(this.tempDir, "solution"), this.sourceFile];
          this.executableFile = path.join(this.tempDir, "solution");
          break;
        default:
          // For interpreted languages, no compilation needed
          resolve();
          return;
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
        case "java":
          command = "java";
          args = ["-cp", this.tempDir, "Solution"];
          break;
        case "cpp":
          command = this.executableFile;
          args = [];
          break;
        case "python":
          command = "python3";
          args = [this.sourceFile];
          break;
        case "javascript":
          command = "node";
          args = [this.sourceFile];
          break;
        default:
          command = "java";
          args = ["-cp", this.tempDir, "Solution"];
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
    // Compile the code
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
    // For OOP problems, we can generate class diagram visualizations
    return [
      {
        type: "class-diagram",
        data: {
          classes: this.extractClasses(),
          relationships: this.extractRelationships()
        }
      },
      {
        type: "oop-metrics",
        data: this.oopMetrics
      }
    ];
  }

  /**
   * Extract classes from the code
   * @returns {Array} - Array of classes
   */
  extractClasses() {
    const code = this.code;
    const classes = [];
    
    // Extract class definitions
    const classRegex = /class\s+(\w+)(?:\s+extends\s+(\w+))?/g;
    let match;
    
    while ((match = classRegex.exec(code)) !== null) {
      const className = match[1];
      const parentClass = match[2] || null;
      
      // Extract methods
      const methods = this.extractMethods(className);
      
      // Extract properties
      const properties = this.extractProperties(className);
      
      classes.push({
        name: className,
        parent: parentClass,
        methods,
        properties
      });
    }
    
    return classes;
  }

  /**
   * Extract methods from a class
   * @param {string} className - Name of the class
   * @returns {Array} - Array of methods
   */
  extractMethods(className) {
    const code = this.code;
    const methods = [];
    
    // Find the class definition
    const classRegex = new RegExp(`class\\s+${className}[^{]*{([^}]*)}`, "s");
    const classMatch = code.match(classRegex);
    
    if (classMatch) {
      const classBody = classMatch[1];
      
      // Extract method definitions
      const methodRegex = /(public|private|protected)?\s*(static)?\s*(\w+)\s*\(([^)]*)\)/g;
      let match;
      
      while ((match = methodRegex.exec(classBody)) !== null) {
        const visibility = match[1] || "public";
        const isStatic = !!match[2];
        const methodName = match[3];
        const parameters = match[4].split(",").map(param => param.trim());
        
        methods.push({
          name: methodName,
          visibility,
          isStatic,
          parameters
        });
      }
    }
    
    return methods;
  }

  /**
   * Extract properties from a class
   * @param {string} className - Name of the class
   * @returns {Array} - Array of properties
   */
  extractProperties(className) {
    const code = this.code;
    const properties = [];
    
    // Find the class definition
    const classRegex = new RegExp(`class\\s+${className}[^{]*{([^}]*)}`, "s");
    const classMatch = code.match(classRegex);
    
    if (classMatch) {
      const classBody = classMatch[1];
      
      // Extract property definitions
      const propertyRegex = /(public|private|protected)?\s*(static)?\s*(\w+)\s+(\w+)\s*;/g;
      let match;
      
      while ((match = propertyRegex.exec(classBody)) !== null) {
        const visibility = match[1] || "public";
        const isStatic = !!match[2];
        const type = match[3];
        const name = match[4];
        
        properties.push({
          name,
          type,
          visibility,
          isStatic
        });
      }
    }
    
    return properties;
  }

  /**
   * Extract relationships between classes
   * @returns {Array} - Array of relationships
   */
  extractRelationships() {
    const code = this.code;
    const relationships = [];
    
    // Extract inheritance relationships
    const inheritanceRegex = /class\s+(\w+)\s+extends\s+(\w+)/g;
    let match;
    
    while ((match = inheritanceRegex.exec(code)) !== null) {
      const childClass = match[1];
      const parentClass = match[2];
      
      relationships.push({
        type: "inheritance",
        from: childClass,
        to: parentClass
      });
    }
    
    // Extract composition relationships (simplified)
    const compositionRegex = /private\s+(\w+)\s+(\w+)\s*;/g;
    
    while ((match = compositionRegex.exec(code)) !== null) {
      const type = match[1];
      const name = match[2];
      
      // Find the class that contains this property
      const classRegex = /class\s+(\w+)[^{]*{/g;
      let classMatch;
      let currentClass = null;
      
      while ((classMatch = classRegex.exec(code)) !== null) {
        const className = classMatch[1];
        const classStart = classMatch.index;
        const classEnd = code.indexOf("}", classStart);
        
        if (classStart <= match.index && match.index <= classEnd) {
          currentClass = className;
          break;
        }
      }
      
      if (currentClass) {
        relationships.push({
          type: "composition",
          from: currentClass,
          to: type
        });
      }
    }
    
    return relationships;
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

module.exports = OOPExecutor; 
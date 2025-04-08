const { spawn } = require("child_process");
const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const TIMEOUT = 10000; // 10 seconds timeout
const OUTPUT_LIMIT = 1024 * 1024; // 1MB output limit

async function executeCode(code, input = "") {
  console.log("Starting code execution...");
  console.log("Input:", input);

  const tmpDir = path.join("/tmp", `code-${uuidv4()}`);
  const sourceFile = path.join(tmpDir, "solution.c");
  const executableFile = path.join(tmpDir, "solution");

  try {
    console.log("Creating temporary directory:", tmpDir);
    await fs.mkdir(tmpDir, { recursive: true });

    // Create a complete C program with the user's code and test code
    const completeCode = `
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// User's code starts here
${code}
// User's code ends here

// Main function to test the implementation
int main() {
    ${input}
    return 0;
}`;

    console.log("Writing code to file:", sourceFile);
    await fs.writeFile(sourceFile, completeCode);

    console.log("Compiling C code...");
    await compileC(sourceFile, executableFile);

    console.log("Running compiled executable...");
    const result = await runExecutable(executableFile);
    console.log("Execution completed:", result);

    return result;
  } catch (error) {
    console.error("Code execution error:", error);
    return {
      output: null,
      error: error.message,
      executionTime: 0,
    };
  } finally {
    try {
      console.log("Cleaning up temporary files...");
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  }
}

function compileC(sourceFile, executableFile) {
  return new Promise((resolve, reject) => {
    console.log("Compiling with gcc:", sourceFile);
    const gcc = spawn("gcc", ["-o", executableFile, sourceFile]);

    let error = "";

    gcc.stderr.on("data", (data) => {
      console.log("Compilation error:", data.toString());
      error += data.toString();
    });

    gcc.on("error", (err) => {
      console.error("Compilation process error:", err);
      reject(err);
    });

    gcc.on("close", (code) => {
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
      gcc.kill();
      reject(new Error("Compilation timeout"));
    }, TIMEOUT);

    // Clear timeout when compilation completes
    gcc.on("close", () => {
      clearTimeout(timeoutId);
    });
  });
}

function runExecutable(executableFile) {
  return new Promise((resolve, reject) => {
    console.log("Spawning executable");
    const startTime = Date.now();
    const process = spawn(executableFile);

    let output = "";
    let error = "";

    process.stdout.on("data", (data) => {
      console.log("Received stdout:", data.toString());
      output += data.toString();
      if (output.length > OUTPUT_LIMIT) {
        process.kill();
        reject(new Error("Output limit exceeded"));
      }
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
      resolve({
        output: output.trim(),
        error: error.trim() || null,
        executionTime,
      });
    });

    // Set timeout
    const timeoutId = setTimeout(() => {
      console.log("Execution timeout reached");
      process.kill();
      reject(new Error("Execution timeout"));
    }, TIMEOUT);

    // Clear timeout when process completes
    process.on("close", () => {
      clearTimeout(timeoutId);
    });
  });
}

module.exports = {
  executeCode,
};

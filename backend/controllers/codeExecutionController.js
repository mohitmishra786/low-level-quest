// backend/controllers/codeExecutionController.js
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const pool = require("../db");

// Create a temporary directory for code execution
const tempDir = path.join(os.tmpdir(), "low-level-quest");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Function to run code with input
const runCodeWithInput = (filepath, input) => {
  return new Promise((resolve, reject) => {
    const process = exec(`${filepath}.out`, (error, stdout, stderr) => {
      if (error) {
        return reject({ error: "Runtime error", output: stderr });
      }
      resolve(stdout);
    });

    // Send input to the process
    if (input) {
      process.stdin.write(input);
      process.stdin.end();
    }
  });
};

// Function to compare outputs
const compareOutputs = (actual, expected) => {
  // Trim whitespace and normalize line endings
  const normalizeOutput = (output) => {
    return output.trim().replace(/\r\n/g, "\n");
  };

  const normalizedActual = normalizeOutput(actual);
  const normalizedExpected = normalizeOutput(expected);

  return normalizedActual === normalizedExpected;
};

const executeCode = async (code, input, problemId) => {
  if (!code) {
    throw new Error("No code provided");
  }

  try {
    console.log("Starting code execution...");
    console.log("Input:", input);

    // Create a temporary directory for code execution
    const tempDir = fs.mkdirSync(
      path.join(os.tmpdir(), "code-execution-" + Date.now())
    );
    console.log("Creating temporary directory:", tempDir);
    const filepath = path.join(tempDir, "solution.c");
    console.log("Writing code to file:", filepath);

    // Get test cases for the problem
    const testCasesQuery =
      "SELECT * FROM test_cases WHERE problem_id = $1 ORDER BY id";
    const testCasesResult = await pool.query(testCasesQuery, [problemId]);
    const testCases = testCasesResult.rows;
    console.log("Found test cases:", testCases.length);

    if (testCases.length === 0) {
      throw new Error("No test cases found for this problem");
    }

    // Create test harness code
    // Create test harness code - this avoids duplicating function definitions
    const testHarness = `
    #include <stdio.h>
    #include <stdlib.h>
    #include <string.h>

    // Include user's solution first
    ${code}

    // Test function that directly runs the test cases without redefining any functions
    int main() {
        // Capture stdout
        char buffer[1024];
        size_t buffer_size = sizeof(buffer);
        
        // Redirect stdout to a temporary file
        FILE* original_stdout = stdout;
        FILE* temp_file = tmpfile();
        stdout = temp_file;
        
        // Execute the test input directly
        ${testCases[0].input}
        
        // Restore stdout
        fflush(stdout);
        rewind(temp_file);
        
        // Read captured output
        size_t output_size = 0;
        while (output_size < buffer_size - 1 && fgets(buffer + output_size, buffer_size - output_size, temp_file) != NULL) {
            output_size += strlen(buffer + output_size);
        }
        buffer[output_size] = '\\0';
        
        // Close temp file and restore stdout
        fclose(temp_file);
        stdout = original_stdout;
        
        // Trim trailing newlines
        while (output_size > 0 && (buffer[output_size-1] == '\\n' || buffer[output_size-1] == '\\r')) {
            buffer[--output_size] = '\\0';
        }
        
        // Compare with expected output
        const char* expected = "${testCases[0].expected_output.replace(
          /"/g,
          '\\"'
        )}";
        printf("Expected output: %s\\n", expected);
        printf("Actual output: %s\\n", buffer);
        
        if (strcmp(buffer, expected) == 0) {
            printf("Test passed\\n");
        } else {
            printf("Test failed\\n");
            printf("Expected: %s\\n", expected);
            printf("Got: %s\\n", buffer);
        }
        
        return 0;
    }`;

    // Write the complete code to file
    fs.writeFileSync(filepath, testHarness);

    // Compile the code
    return new Promise((resolve, reject) => {
      console.log("Compiling C code...");
      exec(
        `gcc ${filepath} -o ${path.join(tempDir, "solution")}`,
        (error, stdout, stderr) => {
          if (error) {
            console.error("Compilation error:", stderr);
            fs.rmSync(tempDir, { recursive: true, force: true });
            return reject({
              error: "Compilation failed",
              details: stderr,
            });
          }
          console.log("Compilation successful");

          // Execute the compiled program
          console.log("Running compiled executable...");
          exec(path.join(tempDir, "solution"), (error, stdout, stderr) => {
            // Clean up
            fs.rmSync(tempDir, { recursive: true, force: true });

            if (error) {
              console.error("Runtime error:", stderr);
              return reject({
                error: "Runtime error",
                details: stderr,
              });
            }

            console.log("Execution output:", stdout);

            // Parse test result
            const lines = stdout.split("\n");
            console.log("Parsed lines:", lines);

            // Check if test passed by looking for "Test passed" in the output
            const passed = lines.includes("Test passed");
            console.log("Test passed:", passed);

            // Extract actual output - the actual user's program output
            let actualOutput = "";
            if (stdout.includes("Actual output:")) {
              actualOutput = stdout
                .split("Actual output:")[1]
                .split("\n")[0]
                .trim();
            } else {
              // If we can't find the actual output marker, just use the first line
              actualOutput = lines[0].trim();
            }
            console.log("Extracted actual output:", actualOutput);

            // Compare actual output with expected output
            const expectedOutput = testCases[0].expected_output.trim();
            const outputsMatch = actualOutput === expectedOutput;
            console.log(
              "Outputs match:",
              outputsMatch,
              "Actual:",
              actualOutput,
              "Expected:",
              expectedOutput
            );

            const details = lines.join("\n");
            console.log("Test details:", details);

            const testResults = [
              {
                testCase: testCases[0].input,
                passed: passed,
                details: details || null,
                input: testCases[0].input,
                expectedOutput: testCases[0].expected_output,
                actualOutput: passed
                  ? testCases[0].expected_output
                  : details.includes("Got:")
                  ? details.split("Got:")[1].trim()
                  : actualOutput,
                description: testCases[0].description,
              },
            ];

            // All tests passed if this one passed
            const allPassed = passed;
            console.log("All tests passed:", allPassed);

            resolve({
              success: true, // Set success to true if the execution completed without errors
              output: actualOutput || null,
              error: stderr || null,
              testCase: {
                input: testCases[0].input,
                expectedOutput: testCases[0].expected_output,
              },
              passed: outputsMatch, // Set passed based on if the output matches expected
            });
          });
        }
      );
    });
  } catch (error) {
    console.error("Error executing code:", error);
    throw error;
  }
};

// API endpoint for code execution
const executeCodeEndpoint = async (req, res) => {
  const { code, input, problemId } = req.body;

  console.log("executeCodeEndpoint called with:", {
    codeLength: code?.length,
    inputLength: input?.length,
    problemId,
  });

  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }

  try {
    if (!problemId) {
      console.log("WARNING: No problemId provided for executeCodeEndpoint");
    }

    const result = await executeCode(code, input, problemId);
    console.log("executeCodeEndpoint result:", result);
    res.json(result);
  } catch (error) {
    console.error("Error executing code:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

module.exports = {
  executeCode,
  executeCodeEndpoint,
};

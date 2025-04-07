// backend/controllers/codeExecutionController.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const pool = require('../db');

// Create a temporary directory for code execution
const tempDir = path.join(os.tmpdir(), 'low-level-quest');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Function to run code with input
const runCodeWithInput = (filepath, input) => {
  return new Promise((resolve, reject) => {
    const process = exec(`${filepath}.out`, (error, stdout, stderr) => {
      if (error) {
        return reject({ error: 'Runtime error', output: stderr });
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
    return output.trim().replace(/\r\n/g, '\n');
  };
  
  const normalizedActual = normalizeOutput(actual);
  const normalizedExpected = normalizeOutput(expected);
  
  return normalizedActual === normalizedExpected;
};

const executeCode = async (req, res) => {
  const { code, problemId } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try 
  {
    // Create a temporary directory for code execution
    const tempDir = fs.mkdirSync(path.join(os.tmpdir(), 'code-execution-' + Date.now()));
    const filepath = path.join(tempDir, 'solution.c');
    
    // Get test cases for the problem
    const testCasesQuery = 'SELECT * FROM test_cases WHERE problem_id = $1 ORDER BY id';
    const testCasesResult = await pool.query(testCasesQuery, [problemId]);
    const testCases = testCasesResult.rows;

    if (testCases.length === 0) {
      return res.status(404).json({ error: 'No test cases found for this problem' });
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
        const char* expected = "${testCases[0].expected_output.replace(/"/g, '\\"')}";
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
    exec(`gcc ${filepath} -o ${path.join(tempDir, 'solution')}`, (error, stdout, stderr) => {
      if (error) {
        return res.status(400).json({ 
          error: 'Compilation failed',
          details: stderr 
        });
      }

      // Execute the compiled program
      exec(path.join(tempDir, 'solution'), (error, stdout, stderr) => {
        // Clean up
        fs.rmSync(tempDir, { recursive: true, force: true });

        if (error) {
          return res.status(400).json({ 
            error: 'Runtime error',
            details: stderr 
          });
        }

        // Parse test result
        const lines = stdout.split('\n');
        const passed = lines[0] === 'Test passed';
        const details = lines.slice(1).join('\n');

        const testResults = [{
          testCase: testCases[0].input,
          passed: passed,
          details: details || null,
          input: testCases[0].input,
          expectedOutput: testCases[0].expected_output,
          actualOutput: passed ? testCases[0].expected_output : (details.includes('Got:') ? details.split('Got:')[1].trim() : 'No output')
        }];

        // All tests passed if this one passed
        const allPassed = passed;

        // If all tests passed and user is logged in, update progress
        if (allPassed && req.user) {
          pool.query(
            `INSERT INTO user_progress (user_id, problem_id, status, submitted_solution)
             VALUES ($1, $2, 'solved', $3)
             ON CONFLICT (user_id, problem_id) 
             DO UPDATE SET status = 'solved', submitted_solution = $3, updated_at = CURRENT_TIMESTAMP`,
            [req.user.id, problemId, code]
          ).catch(err => console.error('Error updating user progress:', err));
        }

        // In your codeExecutionController.js
        res.json({
          success: allPassed,       // Should be false if compilation failed
          output: stdout || null,
          error: stderr || null,
          testCase: {               // Always include test case details
            input: testCases[0].input,
            expectedOutput: testCases[0].expected_output
          },
          passed: allPassed         // Explicit pass/fail status
        });
      });
    });
  } 
  catch (error) {
    console.error('Error executing code:', error);
    return res.status(500).json({ error: 'Internal server error' });
    console.log('Mohit');
  }
};

module.exports = {
  executeCode
}; 
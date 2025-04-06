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

exports.executeCode = async (req, res) => {
  const { code, problemId, isSubmission = false } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    // Create a unique filename for this execution
    const filename = `code_${Date.now()}.c`;
    const filepath = path.join(tempDir, filename);
    
    // Write the code to a temporary file
    fs.writeFileSync(filepath, code);
    
    // Compile the code
    exec(`gcc ${filepath} -o ${filepath}.out`, async (compileError, compileStdout, compileStderr) => {
      if (compileError) {
        // Clean up the temporary file
        fs.unlinkSync(filepath);
        return res.status(400).json({ 
          error: 'Compilation error',
          output: compileStderr
        });
      }
      
      // If this is a submission and we have a problemId, run against test cases
      if (isSubmission && problemId) {
        try {
          // Get test cases for this problem
          const testCasesResult = await pool.query(
            'SELECT * FROM test_cases WHERE problem_id = $1',
            [problemId]
          );
          
          const testCases = testCasesResult.rows;
          
          if (testCases.length === 0) {
            // No test cases, just run the code
            try {
              const output = await runCodeWithInput(filepath);
              // Clean up temporary files
              fs.unlinkSync(filepath);
              fs.unlinkSync(`${filepath}.out`);
              
              res.json({ 
                output: output || 'Program executed successfully with no output',
                passed: true
              });
            } catch (error) {
              // Clean up temporary files
              fs.unlinkSync(filepath);
              fs.unlinkSync(`${filepath}.out`);
              
              res.status(400).json(error);
            }
            return;
          }
          
          // Run against each test case
          const results = [];
          let allPassed = true;
          
          for (const testCase of testCases) {
            try {
              const output = await runCodeWithInput(filepath, testCase.input);
              const passed = compareOutputs(output, testCase.expected_output);
              
              results.push({
                testCaseId: testCase.id,
                passed,
                input: testCase.input,
                expectedOutput: testCase.expected_output,
                actualOutput: output,
                isHidden: testCase.is_hidden
              });
              
              if (!passed) {
                allPassed = false;
              }
            } catch (error) {
              results.push({
                testCaseId: testCase.id,
                passed: false,
                input: testCase.input,
                expectedOutput: testCase.expected_output,
                error: error.output,
                isHidden: testCase.is_hidden
              });
              allPassed = false;
            }
          }
          
          // Clean up temporary files
          fs.unlinkSync(filepath);
          fs.unlinkSync(`${filepath}.out`);
          
          // If all tests passed, update user progress
          if (allPassed) {
            // Get user ID from token
            const userId = req.user?.id;
            if (userId) {
              await pool.query(
                `INSERT INTO user_progress (user_id, problem_id, status, submitted_solution)
                 VALUES ($1, $2, 'solved', $3)
                 ON CONFLICT (user_id, problem_id) 
                 DO UPDATE SET status = 'solved', submitted_solution = $3, updated_at = CURRENT_TIMESTAMP`,
                [userId, problemId, code]
              );
            }
          }
          
          res.json({
            passed: allPassed,
            results: results.map(result => ({
              ...result,
              // Hide input/output for hidden test cases
              input: result.isHidden ? '***' : result.input,
              expectedOutput: result.isHidden ? '***' : result.expectedOutput,
              actualOutput: result.isHidden ? '***' : result.actualOutput
            }))
          });
        } catch (error) {
          console.error('Test case execution error:', error);
          // Clean up temporary files
          fs.unlinkSync(filepath);
          fs.unlinkSync(`${filepath}.out`);
          
          res.status(500).json({
            error: 'Test case execution error',
            output: error.message
          });
        }
      } else {
        // Just run the code without test cases
        try {
          const output = await runCodeWithInput(filepath);
          // Clean up temporary files
          fs.unlinkSync(filepath);
          fs.unlinkSync(`${filepath}.out`);
          
          res.json({ 
            output: output || 'Program executed successfully with no output'
          });
        } catch (error) {
          // Clean up temporary files
          fs.unlinkSync(filepath);
          fs.unlinkSync(`${filepath}.out`);
          
          res.status(400).json(error);
        }
      }
    });
  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      output: error.message
    });
  }
}; 
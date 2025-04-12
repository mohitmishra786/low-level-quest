/**
 * Validates an execution request
 * @param {Object} request - The execution request to validate
 * @returns {Object} Validation result with isValid flag and errors array
 */
function validateExecutionRequest(request) {
  const errors = [];

  // Check required fields
  if (!request.code) {
    errors.push('Code is required');
  }

  if (!request.language) {
    errors.push('Language is required');
  }

  if (!request.category) {
    errors.push('Category is required');
  }

  // Validate language
  const supportedLanguages = [
    'python',
    'javascript',
    'typescript',
    'java',
    'c',
    'cpp',
    'rust',
    'go',
    'sql'
  ];

  if (request.language && !supportedLanguages.includes(request.language.toLowerCase())) {
    errors.push(`Unsupported language: ${request.language}`);
  }

  // Validate category
  const supportedCategories = [
    'algorithm',
    'database',
    'network',
    'security',
    'web',
    'os',
    'ml',
    'binary',
    'oop'
  ];

  if (request.category && !supportedCategories.includes(request.category.toLowerCase())) {
    errors.push(`Unsupported category: ${request.category}`);
  }

  // Validate timeout
  if (request.timeout) {
    const timeout = parseInt(request.timeout);
    if (isNaN(timeout) || timeout < 1000 || timeout > 30000) {
      errors.push('Timeout must be between 1000ms and 30000ms');
    }
  }

  // Validate memory limit
  if (request.memoryLimit) {
    const memoryLimit = parseInt(request.memoryLimit);
    if (isNaN(memoryLimit) || memoryLimit < 128 || memoryLimit > 1024) {
      errors.push('Memory limit must be between 128MB and 1024MB');
    }
  }

  // Validate test cases
  if (request.testCases) {
    if (!Array.isArray(request.testCases)) {
      errors.push('Test cases must be an array');
    } else {
      request.testCases.forEach((testCase, index) => {
        if (!testCase.input || !testCase.expectedOutput) {
          errors.push(`Test case ${index + 1} must have input and expectedOutput`);
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateExecutionRequest
}; 
const ExecutionGatewayService = require('../services/ExecutionGatewayService');
const { validateExecutionRequest } = require('../validators/ExecutionValidator');

/**
 * Controller for handling code execution requests
 */
class ExecutionController {
  /**
   * Execute code for a problem
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async executeCode(req, res, next) {
    try {
      // Validate request
      const validationResult = validateExecutionRequest(req.body);
      if (!validationResult.isValid) {
        return res.status(400).json({
          success: false,
          error: validationResult.errors.join(', ')
        });
      }

      // Get user information from request
      const userId = req.user ? req.user.id : 'anonymous';
      const isAuthenticated = !!req.user;

      // Execute code
      const result = await ExecutionGatewayService.executeCode({
        ...req.body,
        userId,
        isAuthenticated
      });

      // Return result
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in executeCode controller:', error);
      return next(error);
    }
  }

  /**
   * Get execution status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getExecutionStatus(req, res, next) {
    try {
      const { requestId } = req.params;
      
      if (!requestId) {
        return res.status(400).json({
          success: false,
          error: 'Request ID is required'
        });
      }

      // Get execution status from Redis
      const result = await ExecutionGatewayService.getExecutionStatus(requestId);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'Execution request not found'
        });
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getExecutionStatus controller:', error);
      return next(error);
    }
  }

  /**
   * Cancel execution
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async cancelExecution(req, res, next) {
    try {
      const { requestId } = req.params;
      
      if (!requestId) {
        return res.status(400).json({
          success: false,
          error: 'Request ID is required'
        });
      }

      // Cancel execution
      const result = await ExecutionGatewayService.cancelExecution(requestId);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'Execution request not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Execution cancelled successfully'
      });
    } catch (error) {
      console.error('Error in cancelExecution controller:', error);
      return next(error);
    }
  }
}

module.exports = new ExecutionController(); 
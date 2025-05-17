import { Request, Response } from 'express';

/**
 * Base controller with common methods for handling HTTP responses
 */
export abstract class BaseController {
  protected success<T>(res: Response, data: T, statusCode = 200) {
    return res.status(statusCode).json({
      status: 'success',
      data
    });
  }

  protected error(res: Response, message: string, statusCode = 500) {
    return res.status(statusCode).json({
      status: 'error',
      message
    });
  }

  protected notFound(res: Response, message = 'Resource not found') {
    return this.error(res, message, 404);
  }

  protected badRequest(res: Response, message = 'Bad request') {
    return this.error(res, message, 400);
  }

  protected created<T>(res: Response, data: T) {
    return this.success(res, data, 201);
  }
}

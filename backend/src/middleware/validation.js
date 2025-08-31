import Joi from 'joi';
import { logger } from '../utils/logger.js';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const validationError = new Error('Validation Error');
      validationError.name = 'ValidationError';
      validationError.status = 400;
      validationError.details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));
      
      logger.warn('Validation failed:', {
        path: req.path,
        method: req.method,
        details: validationError.details
      });
      
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Request validation failed',
        details: validationError.details
      });
    }

    // Replace req.body with validated data
    req.body = value;
    next();
  };
};

export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const validationError = new Error('Query Validation Error');
      validationError.name = 'ValidationError';
      validationError.status = 400;
      validationError.details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));
      
      return res.status(400).json({
        error: 'Query Validation Error',
        message: 'Query parameters validation failed',
        details: validationError.details
      });
    }

    req.query = value;
    next();
  };
};

export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const validationError = new Error('Parameter Validation Error');
      validationError.name = 'ValidationError';
      validationError.status = 400;
      validationError.details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));
      
      return res.status(400).json({
        error: 'Parameter Validation Error',
        message: 'URL parameters validation failed',
        details: validationError.details
      });
    }

    req.params = value;
    next();
  };
};

// Common validation schemas
export const commonSchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('createdAt', 'updatedAt', 'name', 'breed').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),

  idParam: Joi.object({
    id: Joi.string().uuid().required()
  }),

  imageUpload: Joi.object({
    description: Joi.string().max(500).optional(),
    tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
    location: Joi.object({
      latitude: Joi.number().min(-90).max(90).optional(),
      longitude: Joi.number().min(-180).max(180).optional(),
      address: Joi.string().max(200).optional()
    }).optional()
  }),

  breedIdentification: Joi.object({
    imageData: Joi.string().required(),
    viewType: Joi.string().valid('front', 'side', 'rear').default('side'),
    confidence: Joi.number().min(0).max(100).optional(),
    metadata: Joi.object({
      deviceInfo: Joi.object().optional(),
      location: Joi.object().optional(),
      timestamp: Joi.date().iso().optional()
    }).optional()
  })
};

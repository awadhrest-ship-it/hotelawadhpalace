import { validationResult } from 'express-validator';

export function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const err = new Error('Validation failed');
    err.status = 422;
    err.errors = result.array().map((e) => ({ field: e.path, message: e.msg }));
    return next(err);
  }
  next();
}

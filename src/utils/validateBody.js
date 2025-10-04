import createHttpError from "http-errors";

export function validateBody(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

    if (error) {
      const details = error.details.map(d => d.message).join(", ");
      return next(createHttpError(400, `Validation error: ${details}`));
    }
    next();
  };
}

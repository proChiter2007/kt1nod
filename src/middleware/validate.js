const checkSchema = (schema) => {
  return (req, res, next) => {
    const targetData = req.method === 'GET' ? req.query : req.body;
    const validationResult = schema.validate(targetData, {
      abortEarly: false,
      stripUnknown: true
    });
    if (validationResult.error) {
      const errorDetails = validationResult.error.details.map(item => item.message);
      return res.status(400).json({ details: errorDetails });
    }
    if (req.method === 'GET') {
      req.query = validationResult.value;
    } else {
      req.body = validationResult.value;
    }
    next();
  };
};

module.exports = checkSchema;
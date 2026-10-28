const logRequests = (req, res, next) => {
  res.locals.requestStartTime = process.hrtime();
  res.on('finish', () => {
    const diff = process.hrtime(res.locals.requestStartTime);
    const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    const logLine = `${req.method.padEnd(6)} ${req.originalUrl.padEnd(30)} => ${res.statusCode} [${timeInMs}ms]`;
    console.log(logLine);
  });
  next();
};

module.exports = logRequests;
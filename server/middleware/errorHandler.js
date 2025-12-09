const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Server Error";

  // Mongoose bad Object id

  if (err.name === "CastError") {
    message = "Resource not found";
    statusCode = 404;
  }

  //Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
    statusCode = 400;
  }

  //Mongoose validation error
  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    statusCode = 400;
  }

  // Multer File size error

  if (err.code === "LIMIT_FILE_SIZE") {
    message = "File size exceeds the maximum limit of 10MB";
    statusCode = 400;
  }

  //JWT errors
  if (err.name === "JsonWebTokenError") {
    message = "Invalid Token";
    statusCode = 401;
  }
  if (err.name === "TokenExpiredError") {
    message = "Token Expired";
    statusCode = 401;
  }
  console.error("Error:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    error: message,
    statusCode,
    ...err(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;

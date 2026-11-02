export function notFoundHandler(_request, response) {
  response.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "The requested API route was not found.",
    },
  });
}

export function errorHandler(error, _request, response, _next) {
  if (error.code === "LIMIT_FILE_SIZE") {
    return response.status(413).json({
      success: false,
      error: { code: "IMAGE_TOO_LARGE", message: "Each property photograph must be 5 MB or smaller." },
    });
  }

  if (["LIMIT_FILE_COUNT", "LIMIT_UNEXPECTED_FILE", "LIMIT_FIELD_COUNT", "LIMIT_FIELD_VALUE", "LIMIT_PART_COUNT"].includes(error.code)) {
    return response.status(400).json({
      success: false,
      error: { code: "UPLOAD_LIMIT_EXCEEDED", message: "The upload contains too many files or fields, or a field value is too large." },
    });
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return response.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: error.message,
      },
    });
  }

  if (error.code === 11000) {
    return response.status(409).json({
      success: false,
      error: {
        code: "DUPLICATE_PROPERTY",
        message: "A property with that ID already exists.",
      },
    });
  }

  if (Number.isInteger(error.status) && error.status >= 400 && error.status < 500) {
    return response.status(error.status).json({
      success: false,
      error: {
        code: error.code || (error.status === 400 ? "BAD_REQUEST" : "REQUEST_ERROR"),
        message: error.message,
      },
    });
  }

  console.error("Unhandled API error:", error);
  return response.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected server error occurred.",
    },
  });
}

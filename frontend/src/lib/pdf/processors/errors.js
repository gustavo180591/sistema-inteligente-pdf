// frontend/src/lib/pdf/processors/errors.js

export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.statusCode = 400;
  }
}

export class ProcessingError extends Error {
  constructor(message, code = 'PROCESSING_ERROR') {
    super(message);
    this.name = 'ProcessingError';
    this.code = code;
    this.statusCode = 500;
  }
}

export class UnsupportedDocumentError extends Error {
  constructor(message = 'Tipo de documento no soportado') {
    super(message);
    this.name = 'UnsupportedDocumentError';
    this.statusCode = 415;
  }
}

export class DatabaseError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'DatabaseError';
    this.originalError = originalError;
    this.statusCode = 500;
  }
}

// Función para manejar errores específicos
export function handleError(error) {
  console.error('Error en procesamiento de PDF:', error);
  
  if (error instanceof ValidationError) {
    return {
      success: false,
      error: error.message,
      field: error.field,
      type: 'VALIDATION_ERROR'
    };
  }
  
  if (error instanceof ProcessingError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      type: 'PROCESSING_ERROR'
    };
  }
  
  if (error instanceof UnsupportedDocumentError) {
    return {
      success: false,
      error: error.message,
      type: 'UNSUPPORTED_DOCUMENT'
    };
  }
  
  // Error genérico
  return {
    success: false,
    error: 'Error interno del servidor',
    type: 'INTERNAL_ERROR',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  };
}

/**
 * Middleware para tratamento centralizado de erros
 */

// Middleware para tratar erros
const errorHandler = (err, req, res, next) => {
  // Registrar o erro no console para depuração
  console.error('Erro:', err.message);
  console.error('Stack:', err.stack);
  
  // Definir código de status
  const statusCode = err.statusCode || 500;
  
  // Responder com erro em formato JSON
  res.status(statusCode).json({
    error: {
      message: err.message || 'Erro interno do servidor',
      code: err.code || 'INTERNAL_ERROR',
      status: statusCode
    }
  });
};

module.exports = errorHandler; 
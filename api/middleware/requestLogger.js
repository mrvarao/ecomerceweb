/**
 * Middleware para registro de requisições
 */

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Registrar dados da requisição
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Função para registrar quando a resposta for enviada
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

module.exports = requestLogger; 
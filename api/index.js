const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Inicialização do Firebase
require('./config/firebase');

// Middlewares personalizados
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Rota principal
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando com Firebase!' });
});

// Rotas da API
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Rota para lidar com endpoints não encontrados
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('Firebase configurado e pronto para uso!');
}); 
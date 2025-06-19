const express = require('express');
const router = express.Router();

// Controladores
const itemController = require('./controllers/itemController');
const userController = require('./controllers/userController');

// Middleware de autenticação
const { authenticate, isAdmin } = require('./middleware/authMiddleware');

// Rotas públicas
// Autenticação
router.post('/login', userController.login);

// Rotas para produtos (items)
router.get('/items', itemController.getAll);
router.get('/items/:id', itemController.getById);
router.post('/items', authenticate, isAdmin, itemController.create);
router.put('/items/:id', authenticate, isAdmin, itemController.update);
router.delete('/items/:id', authenticate, isAdmin, itemController.delete);

// Rota para atualizar estoque após compra
router.post('/items/update-stock', itemController.updateStock);

// Rotas de administração (protegidas)
// Gerenciamento de usuários
router.get('/users', authenticate, isAdmin, userController.getAllUsers);
router.post('/users', authenticate, isAdmin, userController.registerUser);
router.delete('/users/:id', authenticate, isAdmin, userController.deleteUser);

module.exports = router; 
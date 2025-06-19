/**
 * Middleware para autenticação de usuários
 */

const { db } = require('../config/firebase');
const { getDoc, doc } = require('firebase/firestore');

// Middleware para verificar o token de autenticação
const authenticate = async (req, res, next) => {
  try {
    // Em uma implementação real, você verificaria um JWT
    // Aqui estamos apenas verificando um ID de usuário no header
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Acesso não autorizado. Autenticação necessária.' 
      });
    }
    
    // Buscar usuário no Firestore
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return res.status(401).json({ 
        error: 'Usuário não encontrado ou token inválido.' 
      });
    }
    
    const userData = userDoc.data();
    
    // Adicionar informações do usuário ao objeto de requisição
    req.user = {
      id: userDoc.id,
      name: userData.name,
      email: userData.email,
      role: userData.role || 'user'
    };
    
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({ 
      error: 'Erro ao processar autenticação.' 
    });
  }
};

// Middleware para verificar se o usuário é administrador
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Acesso não autorizado. Autenticação necessária.' 
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Acesso negado. Apenas administradores podem acessar este recurso.' 
    });
  }
  
  next();
};

module.exports = {
  authenticate,
  isAdmin
}; 
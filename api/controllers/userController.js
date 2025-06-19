// Controlador de usuários com integração ao Firebase
const { db } = require('../config/firebase');
const { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where 
} = require('firebase/firestore');

// Nome da coleção no Firestore
const COLLECTION_NAME = 'users';

// Listar todos os usuários (apenas para administradores)
exports.getAllUsers = async (req, res, next) => {
  try {
    // Verificar se o usuário é administrador
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Acesso negado. Apenas administradores podem listar usuários.' 
      });
    }

    const usersCol = collection(db, COLLECTION_NAME);
    const usersSnapshot = await getDocs(usersCol);
    const usersList = usersSnapshot.docs.map(doc => {
      const userData = doc.data();
      // Nunca retornar a senha, mesmo que criptografada
      const { password, ...userWithoutPassword } = userData;
      return {
        id: doc.id,
        ...userWithoutPassword
      };
    });
    
    res.json(usersList);
  } catch (error) {
    next(error);
  }
};

// Autenticar usuário (login)
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email e senha são obrigatórios.' 
      });
    }
    
    // Buscar usuário pelo email
    const usersCol = collection(db, COLLECTION_NAME);
    const q = query(usersCol, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return res.status(401).json({ 
        error: 'Credenciais inválidas.' 
      });
    }
    
    // Verificar senha (em produção, você usaria bcrypt.compare)
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    if (userData.password !== password) {
      return res.status(401).json({ 
        error: 'Credenciais inválidas.' 
      });
    }
    
    // Dados do usuário para retornar (sem a senha)
    const { password: userPassword, ...userWithoutPassword } = userData;
    
    res.json({
      id: userDoc.id,
      ...userWithoutPassword,
      message: 'Login realizado com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

// Registrar novo usuário (para administradores)
exports.registerUser = async (req, res, next) => {
  try {
    // Verificar se o usuário é administrador
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Acesso negado. Apenas administradores podem registrar usuários.' 
      });
    }
    
    const { name, email, password, role = 'user' } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Nome, email e senha são obrigatórios.' 
      });
    }
    
    // Verificar se o email já está em uso
    const usersCol = collection(db, COLLECTION_NAME);
    const q = query(usersCol, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return res.status(400).json({ 
        error: 'Este email já está em uso.' 
      });
    }
    
    // Criar novo usuário
    const newUser = {
      name,
      email,
      password, // Em produção, você usaria bcrypt.hash
      role,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newUser);
    
    // Retornar dados do usuário (sem a senha)
    const { password: userPassword, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      id: docRef.id,
      ...userWithoutPassword,
      message: 'Usuário criado com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

// Remover usuário (para administradores)
exports.deleteUser = async (req, res, next) => {
  try {
    // Verificar se o usuário é administrador
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Acesso negado. Apenas administradores podem remover usuários.' 
      });
    }
    
    const id = req.params.id;
    
    // Verificar se o usuário existe
    const userRef = doc(db, COLLECTION_NAME, id);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }
    
    // Não permitir que um administrador remova a si mesmo
    if (req.user.id === id) {
      return res.status(400).json({ 
        error: 'Não é permitido remover sua própria conta.' 
      });
    }
    
    // Deletar do Firestore
    await deleteDoc(userRef);
    
    res.json({ mensagem: `Usuário ${id} removido com sucesso` });
  } catch (error) {
    next(error);
  }
}; 
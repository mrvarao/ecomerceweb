/**
 * Script para popular o Firestore com usuários iniciais
 * Execute com: node scripts/seedUsers.js
 */

const { db } = require('../config/firebase');
const { collection, addDoc, getDocs, query, where } = require('firebase/firestore');

const COLLECTION_NAME = 'users';

// Usuários iniciais para adicionar ao Firestore
const usuariosIniciais = [
  { 
    name: 'Administrador', 
    email: 'admin@example.com', 
    password: 'admin123', // Em produção, você usaria bcrypt para hash
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  { 
    name: 'Usuário Normal', 
    email: 'user@example.com', 
    password: 'user123', 
    role: 'user',
    createdAt: new Date().toISOString()
  }
];

// Função para verificar se já existem usuários na coleção
async function verificarUsuarios() {
  const usersCol = collection(db, COLLECTION_NAME);
  const usersSnapshot = await getDocs(usersCol);
  return usersSnapshot.size;
}

// Função para adicionar os usuários iniciais
async function seedUsers() {
  try {
    // Verificar se já existem usuários
    const quantidadeExistente = await verificarUsuarios();
    
    if (quantidadeExistente > 0) {
      console.log(`Já existem ${quantidadeExistente} usuários na coleção. Pulando a inserção.`);
      process.exit(0);
    }
    
    console.log('Adicionando usuários iniciais ao Firestore...');
    
    // Adicionar cada usuário à coleção
    for (const usuario of usuariosIniciais) {
      // Verificar se o email já está em uso
      const usersCol = collection(db, COLLECTION_NAME);
      const q = query(usersCol, where("email", "==", usuario.email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        console.log(`Usuário com email ${usuario.email} já existe. Pulando...`);
        continue;
      }
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), usuario);
      console.log(`Usuário ${usuario.role} adicionado com ID: ${docRef.id}`);
    }
    
    console.log('Usuários iniciais adicionados com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao adicionar usuários iniciais:', error);
    process.exit(1);
  }
}

// Executar a função de seed
seedUsers(); 
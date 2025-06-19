/**
 * Script para popular o Firestore com dados iniciais
 * Execute com: node scripts/seedData.js
 */

const { db } = require('../config/firebase');
const { collection, addDoc, getDocs, query } = require('firebase/firestore');

const COLLECTION_NAME = 'items';

// Dados iniciais para adicionar ao Firestore
const itemsIniciais = [
  { nome: 'Item 1', descricao: 'Descrição do item 1', preco: 100 },
  { nome: 'Item 2', descricao: 'Descrição do item 2', preco: 200 },
  { nome: 'Item 3', descricao: 'Descrição do item 3', preco: 300 }
];

// Função para verificar se já existem dados na coleção
async function verificarDados() {
  const itemsCol = collection(db, COLLECTION_NAME);
  const itemsSnapshot = await getDocs(itemsCol);
  return itemsSnapshot.size;
}

// Função para adicionar os dados iniciais
async function seedData() {
  try {
    // Verificar se já existem dados
    const quantidadeExistente = await verificarDados();
    
    if (quantidadeExistente > 0) {
      console.log(`Já existem ${quantidadeExistente} itens na coleção. Pulando a inserção.`);
      process.exit(0);
    }
    
    console.log('Adicionando dados iniciais ao Firestore...');
    
    // Adicionar cada item à coleção
    for (const item of itemsIniciais) {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), item);
      console.log(`Item adicionado com ID: ${docRef.id}`);
    }
    
    console.log('Dados iniciais adicionados com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao adicionar dados iniciais:', error);
    process.exit(1);
  }
}

// Executar a função de seed
seedData(); 
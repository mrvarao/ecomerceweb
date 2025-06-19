const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCpzIVnA78WK1lFebXn5dXxF7SoPgTJ0BU",
  authDomain: "backend-b3b78.firebaseapp.com",
  projectId: "backend-b3b78",
  storageBucket: "backend-b3b78.firebasestorage.app",
  messagingSenderId: "669062449802",
  appId: "1:669062449802:web:e8213c00dafd77118ebb73"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = { app, db }; 
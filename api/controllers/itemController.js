// Controlador de itens com integração ao Firebase
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
const COLLECTION_NAME = 'items';

// Buscar todos os itens
exports.getAll = async (req, res, next) => {
  try {
    const itemsCol = collection(db, COLLECTION_NAME);
    const itemsSnapshot = await getDocs(itemsCol);
    const itemsList = itemsSnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Garantir que todos os produtos tenham os campos necessários
      return {
        id: doc.id,
        nome: data.nome || 'Produto sem nome',
        descricao: data.descricao || 'Sem descrição',
        preco: Number(data.preco) || 0,
        imagem: data.imagem || null,
        emOferta: typeof data.emOferta === 'boolean' ? data.emOferta : false,
        quantidade: Number(data.quantidade) >= 0 ? Number(data.quantidade) : 0,
        categoria: data.categoria || 'Outros'
      };
    });
    
    res.json(itemsList);
  } catch (error) {
    next(error);
  }
};

// Buscar um item específico pelo ID
exports.getById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const itemRef = doc(db, COLLECTION_NAME, id);
    const itemDoc = await getDoc(itemRef);
    
    if (!itemDoc.exists()) {
      return res.status(404).json({ mensagem: 'Item não encontrado' });
    }
    
    res.json({
      id: itemDoc.id,
      ...itemDoc.data()
    });
  } catch (error) {
    next(error);
  }
};

// Criar um novo item
exports.create = async (req, res, next) => {
  try {
    const novoItem = req.body;
    
    // Validar campos obrigatórios
    const camposObrigatorios = ['nome', 'descricao', 'preco', 'quantidade', 'categoria'];
    const camposFaltantes = camposObrigatorios.filter(campo => !novoItem[campo]);
    
    if (camposFaltantes.length > 0) {
      return res.status(400).json({
        mensagem: `Campos obrigatórios faltando: ${camposFaltantes.join(', ')}`,
        error: 'MISSING_FIELDS'
      });
    }
    
    // Garantir que emOferta seja booleano
    if (novoItem.emOferta === undefined) {
      novoItem.emOferta = false;
    } else {
      novoItem.emOferta = Boolean(novoItem.emOferta);
    }
    
    // Garantir que a quantidade seja um número inteiro positivo
    novoItem.quantidade = Number(novoItem.quantidade);
    if (isNaN(novoItem.quantidade) || novoItem.quantidade < 0) {
      novoItem.quantidade = 0;
    }
    
    // Garantir que o preço seja um número positivo
    novoItem.preco = Number(novoItem.preco);
    if (isNaN(novoItem.preco) || novoItem.preco < 0) {
      return res.status(400).json({
        mensagem: 'O preço deve ser um número positivo',
        error: 'INVALID_PRICE'
      });
    }
    
    // Garantir que a categoria seja uma string
    if (typeof novoItem.categoria !== 'string' || novoItem.categoria.trim() === '') {
      return res.status(400).json({
        mensagem: 'A categoria é obrigatória',
        error: 'INVALID_CATEGORY'
      });
    }
    
    // Adicionar ao Firestore
    const docRef = await addDoc(collection(db, COLLECTION_NAME), novoItem);
    
    res.status(201).json({
      id: docRef.id,
      ...novoItem,
      mensagem: 'Item criado com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

// Atualizar um item existente
exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const dadosAtualizados = req.body;
    
    // Verificar se o item existe
    const itemRef = doc(db, COLLECTION_NAME, id);
    const itemDoc = await getDoc(itemRef);
    
    if (!itemDoc.exists()) {
      return res.status(404).json({ mensagem: 'Item não encontrado' });
    }
    
    // Atualizar no Firestore
    await updateDoc(itemRef, dadosAtualizados);
    
    res.json({
      id,
      ...itemDoc.data(),
      ...dadosAtualizados,
      mensagem: 'Item atualizado com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

// Remover um item
exports.delete = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    // Verificar se o item existe
    const itemRef = doc(db, COLLECTION_NAME, id);
    const itemDoc = await getDoc(itemRef);
    
    if (!itemDoc.exists()) {
      return res.status(404).json({ mensagem: 'Item não encontrado' });
    }
    
    // Deletar do Firestore
    await deleteDoc(itemRef);
    
    res.json({ mensagem: `Item ${id} deletado com sucesso` });
  } catch (error) {
    next(error);
  }
};

// Atualizar estoque de vários produtos após compra
exports.updateStock = async (req, res, next) => {
  try {
    const { items } = req.body;
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        mensagem: 'Itens não fornecidos ou formato inválido',
        error: 'INVALID_ITEMS'
      });
    }
    
    const resultados = [];
    let falhas = 0;
    
    // Processar cada item do carrinho
    for (const item of items) {
      try {
        // Validar se o item tem id e quantidade
        if (!item.id || typeof item.quantidade !== 'number' || item.quantidade <= 0) {
          resultados.push({
            id: item.id || 'unknown',
            success: false,
            mensagem: 'ID ou quantidade inválida'
          });
          falhas++;
          continue;
        }
        
        // Buscar o produto no Firestore
        const itemRef = doc(db, COLLECTION_NAME, item.id);
        const itemDoc = await getDoc(itemRef);
        
        if (!itemDoc.exists()) {
          resultados.push({
            id: item.id,
            success: false,
            mensagem: 'Produto não encontrado'
          });
          falhas++;
          continue;
        }
        
        // Obter os dados atuais do produto
        const produtoAtual = itemDoc.data();
        const quantidadeAtual = Number(produtoAtual.quantidade) || 0;
        
        // Calcular a nova quantidade
        const novaQuantidade = Math.max(0, quantidadeAtual - item.quantidade);
        
        // Atualizar no Firestore
        await updateDoc(itemRef, { quantidade: novaQuantidade });
        
        resultados.push({
          id: item.id,
          success: true,
          quantidadeAnterior: quantidadeAtual,
          quantidadeAtual: novaQuantidade,
          reduzido: item.quantidade
        });
      } catch (error) {
        console.error(`Erro ao atualizar estoque do item ${item.id}:`, error);
        resultados.push({
          id: item.id || 'unknown',
          success: false,
          mensagem: 'Erro interno ao processar item'
        });
        falhas++;
      }
    }
    
    // Responder com o resultado
    res.json({
      success: falhas === 0,
      resultados,
      mensagem: falhas === 0 
        ? 'Estoque atualizado com sucesso' 
        : `${falhas} item(s) não puderam ser atualizados`
    });
  } catch (error) {
    next(error);
  }
}; 
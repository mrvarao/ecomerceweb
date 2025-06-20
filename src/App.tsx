import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiPackage, FiTrendingUp, FiCheck, FiArrowRight, FiRefreshCw, FiShoppingCart, FiSearch, FiGrid, FiTag, FiX } from 'react-icons/fi';
import Header from './components/Header';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import AdminPanel from './components/AdminPanel';
import { api } from './api';
import type { Product } from './api';

interface CartItem extends Product {
  quantidade: number;
}

// Dados de exemplo para inicialização
const SAMPLE_PRODUCTS: Product[] = [
  { id: '1', nome: 'Smartphone Premium', descricao: 'Smartphone de última geração com câmera de alta resolução', preco: 2999, imagem: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=200', emOferta: true, quantidade: 10, categoria: 'Smartphones' },
  { id: '2', nome: 'Notebook Ultrafino', descricao: 'Notebook leve e potente para profissionais', preco: 4599, imagem: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=200', emOferta: false, quantidade: 5, categoria: 'Computadores' },
  { id: '3', nome: 'Fones Bluetooth', descricao: 'Fones sem fio com cancelamento de ruído', preco: 599, imagem: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?q=80&w=200', emOferta: true, quantidade: 25, categoria: 'Acessórios' },
  { id: '4', nome: 'Smartwatch Sport', descricao: 'Relógio inteligente com monitor cardíaco', preco: 899, imagem: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=200', emOferta: false, quantidade: 8, categoria: 'Eletrônicos' },
  { id: '5', nome: 'Câmera DSLR', descricao: 'Câmera profissional para fotógrafos exigentes', preco: 3299, imagem: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=200', emOferta: true, quantidade: 3, categoria: 'Eletrônicos' },
  { id: '6', nome: 'Console de Jogos', descricao: 'Console de última geração para gamers', preco: 4499, imagem: 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?q=80&w=200', emOferta: false, quantidade: 0, categoria: 'Jogos' }
];

// Inicializa a loja com produtos de exemplo, se ainda não houver nenhum
const initializeSampleData = () => {
  const existingProducts = localStorage.getItem('products');
  if (!existingProducts) {
    localStorage.setItem('products', JSON.stringify(SAMPLE_PRODUCTS));
  }
};

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Estados para autenticação e modais
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  // Estado para termo de busca
  const [searchTerm, setSearchTerm] = useState<string>('');
  // Estado para categoria selecionada
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  // Estado para exibir apenas produtos em oferta
  const [showOnlyOffers, setShowOnlyOffers] = useState<boolean>(false);

  useEffect(() => {
    // Inicializa dados de exemplo
    initializeSampleData();
    
    // Busca produtos
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.products.getAll();
      setProducts(data);
    } catch (err) {
      setError('Erro ao carregar produtos. Por favor, tente novamente.');
      console.error('Erro ao buscar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    // Verificar se o produto está disponível em estoque
    if (product.quantidade <= 0) {
      setError('Produto indisponível em estoque.');
      setTimeout(() => setError(null), 3000); // Limpa o erro após 3 segundos
      return;
    }
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // Verificar se a quantidade solicitada excede o estoque
        if (existingItem.quantidade >= product.quantidade) {
          setError('Quantidade máxima em estoque atingida.');
          setTimeout(() => setError(null), 3000);
          return prevItems;
        }
        
        return prevItems.map(item => 
          item.id === product.id 
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }
      
      return [...prevItems, { ...product, quantidade: 1 }];
    });
    
    // Abre o carrinho quando adiciona um produto
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => 
      prevItems.filter(item => item.id !== productId)
    );
  };

  const updateQuantity = (productId: string, quantidade: number) => {
    if (quantidade <= 0) {
      removeFromCart(productId);
      return;
    }
    
    // Verificar estoque disponível
    const product = products.find(p => p.id === productId);
    if (product && quantidade > product.quantidade) {
      setError(`Apenas ${product.quantidade} unidade(s) disponível(is) em estoque.`);
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId 
          ? { ...item, quantidade }
          : item
      )
    );
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantidade, 0);
  };
  
  // Função para finalizar a compra
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setError('Não há itens no carrinho para finalizar a compra.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setLoading(true);
      
      // Mapeia os itens do carrinho para o formato esperado pela API
      const itemsToUpdate = cartItems.map(item => ({
        id: item.id,
        quantidade: item.quantidade
      }));
      
      // Atualiza o estoque
      const success = await api.products.updateStock(itemsToUpdate);
      
      if (success) {
        // Limpa o carrinho
        setCartItems([]);
        // Fecha o carrinho
        setIsCartOpen(false);
        // Atualiza a lista de produtos para refletir o novo estoque
        await fetchProducts();
        
        // Exibe mensagem de sucesso
        setSuccessMessage('Compra finalizada com sucesso! Obrigado por comprar conosco.');
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        // Ainda atualiza localmente, mas alerta o usuário sobre problemas de sincronização
        setCartItems([]);
        setIsCartOpen(false);
        await fetchProducts();
        
        setSuccessMessage('Compra registrada! Os produtos foram atualizados localmente, mas pode haver problemas de sincronização com o servidor.');
        setTimeout(() => setSuccessMessage(null), 8000);
      }
    } catch (err) {
      setError('Ocorreu um erro ao finalizar a compra. Por favor, tente novamente.');
      console.error('Erro ao finalizar compra:', err);
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com login bem-sucedido
  const handleLoginSuccess = () => {
    // Disparar evento para atualizar o cabeçalho
    window.dispatchEvent(new Event('storage'));
  };
  
  // Função para fazer logout
  const handleLogout = () => {
    api.auth.logout();
    // Disparar evento para atualizar o cabeçalho
    window.dispatchEvent(new Event('storage'));
  };

  // Função para lidar com busca de produtos
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setSelectedCategory('');
    setShowOnlyOffers(false);
    
    // Rolar para a seção de produtos
    document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Função para limpar busca
  const clearSearch = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setShowOnlyOffers(false);
  };
  
  // Função para navegar entre seções
  const handleNavigation = (destination: 'products' | 'offers') => {
    // Limpar filtros anteriores
    setSearchTerm('');
    setSelectedCategory('');
    
    if (destination === 'offers') {
      setShowOnlyOffers(true);
    } else {
      setShowOnlyOffers(false);
    }
    
    // Rolar para a seção de produtos
    document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Função para selecionar categoria
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSearchTerm('');
    setShowOnlyOffers(false);
    
    // Rolar para a seção de produtos
    document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Variantes para animações
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.4, when: "beforeChildren", staggerChildren: 0.08 }
    },
    exit: { opacity: 0 }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-gradient-to-br from-white to-blue-50"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <Header 
        cartItemsCount={getCartItemsCount()} 
        onCartClick={() => setIsCartOpen(!isCartOpen)}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onAdminPanelClick={() => setIsAdminPanelOpen(true)}
        onLogoutClick={handleLogout}
        onSearch={handleSearch}
        onNavigate={handleNavigation}
        onCategorySelect={handleCategorySelect}
      />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Exibir alerta de erro */}
        <AnimatePresence>
          {error && (
            <motion.div 
              className="mb-4 bg-rose-50 border-l-4 border-rose-500 p-4 rounded-md shadow-sm"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex">
                <div className="flex-shrink-0 text-rose-500">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-rose-700">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Exibir mensagem de sucesso */}
        <AnimatePresence>
          {successMessage && (
            <motion.div 
              className="mb-4 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-md shadow-sm"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex">
                <div className="flex-shrink-0 text-emerald-500">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-emerald-700">{successMessage}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Exibir barra de filtro ativo */}
        <AnimatePresence>
          {(searchTerm || selectedCategory || showOnlyOffers) && (
            <motion.div 
              className="mb-6 bg-white/90 backdrop-blur-sm border border-blue-100 p-3.5 rounded-xl shadow-sm flex items-center justify-between"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center">
                {searchTerm && (
                  <>
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full mr-3">
                      <FiSearch className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pesquisa</p>
                      <p className="font-medium text-gray-900">"{searchTerm}"</p>
                    </div>
                  </>
                )}
                {selectedCategory && (
                  <>
                    <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full mr-3">
                      <FiGrid className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Categoria</p>
                      <p className="font-medium text-gray-900">{selectedCategory}</p>
                    </div>
                  </>
                )}
                {showOnlyOffers && (
                  <>
                    <div className="flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-600 rounded-full mr-3">
                      <FiTag className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Filtro</p>
                      <p className="font-medium text-gray-900">Produtos em oferta</p>
                    </div>
                  </>
                )}
              </div>
              <button 
                onClick={clearSearch}
                className="bg-white text-gray-700 hover:text-blue-600 hover:bg-blue-50 text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors flex items-center gap-1.5"
              >
                <FiX className="h-3.5 w-3.5" />
                Limpar filtros
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Banner principal */}
        {!loading && !error && !searchTerm && !selectedCategory && !showOnlyOffers && (
          <motion.div 
            className="relative overflow-hidden rounded-2xl mb-10 bg-gradient-to-r from-indigo-600 to-blue-500 shadow-lg"
            variants={itemVariants}
          >
            <motion.div 
              className="absolute inset-0 opacity-20"
              animate={{ 
                opacity: [0.1, 0.2, 0.1],
                x: [0, 10, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 8,
                ease: "easeInOut"
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0">
                <path fill="#ffffff" fillOpacity="1" d="M0,160L48,154.7C96,149,192,139,288,154.7C384,171,480,213,576,213.3C672,213,768,171,864,138.7C960,107,1056,85,1152,101.3C1248,117,1344,171,1392,197.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
              </svg>
            </motion.div>
            <div className="relative z-10 p-8 sm:p-12 md:p-16 flex flex-col sm:flex-row items-center">
              <motion.div 
                className="w-full"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <motion.h1 
                  className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  Compre agora os melhores produtos
                </motion.h1>
                <motion.p 
                  className="text-blue-100 text-lg mb-6 max-w-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  Encontre produtos de alta qualidade com os melhores preços. Ofertas especiais diariamente!
                </motion.p>
                
                <div className="flex flex-wrap gap-3 md:gap-4">
                  <motion.button 
                    className="bg-white text-indigo-600 hover:bg-blue-50 font-bold py-3 px-6 rounded-xl shadow-lg transform transition hover:scale-105 inline-flex items-center"
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    onClick={() => document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <span>Ver ofertas</span>
                    <FiArrowRight className="ml-2 h-5 w-5" />
                  </motion.button>
                  
                  <motion.button 
                    className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-3 px-6 rounded-xl shadow-lg transform transition hover:scale-105 inline-flex items-center"
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    onClick={() => {
                      document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' });
                      // Abrir o seletor de categorias
                      const selectElement = document.getElementById('categoria-select') as HTMLSelectElement;
                      if (selectElement) {
                        selectElement.focus();
                      }
                    }}
                  >
                    <FiShoppingCart className="mr-2 h-5 w-5" />
                    <span>Ver por categoria</span>
                  </motion.button>
                </div>
                
                <motion.div 
                  className="flex flex-wrap gap-3 mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  {[
                    { icon: <FiCheck />, text: "Entrega rápida" },
                    { icon: <FiPackage />, text: "Produtos de qualidade" },
                    { icon: <FiShoppingBag />, text: "Ofertas exclusivas" },
                    { icon: <FiTrendingUp />, text: "Melhores preços" }
                  ].map((item, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-center text-blue-100 text-sm bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + (index * 0.1) }}
                    >
                      <span className="mr-2 bg-white/20 p-1 rounded-full">
                        {item.icon}
                      </span>
                      {item.text}
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
              
              {/* Elementos decorativos */}
              <motion.div 
                className="absolute right-10 top-10 w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full hidden md:block"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
              />
              <motion.div 
                className="absolute right-40 bottom-10 w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full hidden md:block"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              />
              <motion.div 
                className="absolute right-20 bottom-20 w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full hidden md:block"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
              />
            </div>
          </motion.div>
        )}

        {loading ? (
          <motion.div 
            className="flex justify-center items-center h-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-1.5 bg-blue-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-blue-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ 
                    width: ["0%", "100%"],
                    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                  }}
                />
              </div>
              <p className="text-blue-500 mt-3 font-medium">Carregando produtos...</p>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div 
            className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-xl shadow-sm"
            variants={itemVariants}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Erro ao carregar produtos</h3>
                <p className="mt-1">{error}</p>
                <motion.button 
                  onClick={fetchProducts} 
                  className="mt-3 bg-rose-100 hover:bg-rose-200 text-rose-800 py-2 px-4 rounded-md text-sm inline-flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiRefreshCw className="h-4 w-4 mr-2" />
                  Tentar novamente
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="flex flex-col md:flex-row gap-8"
            variants={itemVariants}
          >
            <motion.div 
              className={`flex-grow ${isCartOpen ? 'md:w-2/3' : 'w-full'}`}
              layout
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <ProductList 
                products={products} 
                onAddToCart={addToCart} 
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                showOnlyOffers={showOnlyOffers}
              />
            </motion.div>
            
            <AnimatePresence>
              {isCartOpen && (
                <motion.div 
                  className="md:w-1/3 sticky top-24 self-start"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Cart 
                    items={cartItems} 
                    onUpdateQuantity={updateQuantity}
                    onRemoveItem={removeFromCart}
                    total={getCartTotal()}
                    onClose={() => setIsCartOpen(false)}
                    onCheckout={handleCheckout}
                    isLoading={loading}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
      
      <Footer />
      
      {/* Modal de Login */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <LoginModal 
            onClose={() => setIsLoginModalOpen(false)} 
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </AnimatePresence>
      
      {/* Painel de Administração */}
      <AnimatePresence>
        {isAdminPanelOpen && (
          <AdminPanel 
            onClose={() => setIsAdminPanelOpen(false)} 
            onProductUpdate={fetchProducts}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default App;
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, 
  FiShoppingBag, 
  FiSearch, 
  FiMenu, 
  FiX, 
  FiChevronDown, 
  FiLogOut, 
  FiSettings, 
  FiHome,
  FiShoppingCart,
  FiTag,
  FiGrid
} from 'react-icons/fi';
import { api } from '../api';
import { CATEGORIAS_PRODUTOS } from '../api';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
  onLoginClick: () => void;
  onAdminPanelClick: () => void;
  onLogoutClick: () => void;
  onSearch?: (term: string) => void;
  onNavigate?: (destination: 'products' | 'offers') => void;
  onCategorySelect?: (category: string) => void;
}

const Header = ({ 
  cartItemsCount, 
  onCartClick, 
  onLoginClick,
  onAdminPanelClick,
  onLogoutClick,
  onSearch,
  onNavigate,
  onCategorySelect
}: HeaderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  // Verificar estado de autenticação
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(api.auth.isAuthenticated());
      setIsAdmin(api.auth.isAdmin());
      setUserName(api.auth.getCurrentUserName() || '');
    };

    checkAuth();

    // Adicionar listener para verificar mudanças de estado (ex: depois de login/logout)
    window.addEventListener('storage', checkAuth);
    
    // Detectar scroll para mudar aparência do header
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Alternar menu do usuário
  const toggleUserMenu = () => {
    setShowUserMenu(prev => !prev);
  };
  
  // Alternar menu mobile
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  // Alternar barra de pesquisa
  const toggleSearchBar = () => {
    setShowSearchBar(prev => !prev);
  };

  // Processar a busca quando o usuário pressionar Enter
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim() && onSearch) {
      onSearch(searchTerm.trim());
      // Opcionalmente, fechar a barra de busca após a pesquisa
      // setShowSearchBar(false);
    }
  };

  // Processar a busca quando o usuário clicar no botão de busca
  const handleSearchClick = () => {
    if (searchTerm.trim() && onSearch) {
      onSearch(searchTerm.trim());
    }
  };

  // Variantes de animação
  const navLinkVariants = {
    hover: {
      y: -1,
      color: "#2563eb",
      transition: { duration: 0.2 }
    }
  };

  const menuVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -5,
      transition: {
        duration: 0.15,
        ease: "easeIn"
      }
    }
  };

  const handleNavigation = (destination: 'home' | 'products' | 'categories' | 'offers') => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }

    if (destination === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (destination === 'categories') {
      setShowCategoryMenu(!showCategoryMenu);
    } else if (onNavigate && (destination === 'products' || destination === 'offers')) {
      onNavigate(destination);
    }
  };

  const handleCategorySelect = (category: string) => {
    if (onCategorySelect) {
      onCategorySelect(category);
      setShowCategoryMenu(false);
    }
  };

  return (
    <motion.header 
      className={`sticky top-0 z-50 ${
        isScrolled 
          ? 'bg-white/85 backdrop-blur-lg shadow-sm border-b border-gray-100 py-3' 
          : 'bg-gradient-to-r from-white/95 to-blue-50/95 backdrop-blur-md py-4'
      }`}
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, duration: 0.4 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo e nome da loja */}
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1 
              className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 cursor-pointer flex items-center"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => handleNavigation('home')}
            >
              <motion.span 
                className="mr-2 bg-gradient-to-br from-indigo-600 to-blue-500 p-1.5 rounded-lg text-white"
                whileHover={{ rotate: 5 }}
              >
                <FiShoppingBag className="h-5 w-5" />
              </motion.span>
              E-Shop
            </motion.h1>
          </motion.div>
          
          {/* Menu de navegação - Desktop */}
          <nav className="hidden md:flex space-x-6">
            {[
              { icon: <FiHome className="mr-1.5" />, text: "Início", action: () => handleNavigation('home') },
              { icon: <FiShoppingCart className="mr-1.5" />, text: "Produtos", action: () => handleNavigation('products') },
              { icon: <FiGrid className="mr-1.5" />, text: "Categorias", action: () => handleNavigation('categories') },
              { icon: <FiTag className="mr-1.5" />, text: "Ofertas", action: () => handleNavigation('offers') }
            ].map((item, index) => (
              <motion.button 
                key={index}
                onClick={item.action}
                className="text-gray-700 font-medium relative group py-2 px-1 flex items-center"
                variants={navLinkVariants}
                whileHover="hover"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <span className="text-blue-600 bg-blue-100 p-1 rounded-md mr-1.5">
                  {item.icon}
                </span>
                {item.text}
                <motion.span 
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            ))}
          </nav>
          
          {/* Botões de ação */}
          <div className="flex items-center space-x-4">
            {/* Botão de busca */}
            <motion.button 
              className="hidden sm:flex text-gray-700 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-colors"
              onClick={toggleSearchBar}
              whileHover={{ scale: 1.1, backgroundColor: "#EFF6FF" }}
              whileTap={{ scale: 0.95 }}
            >
              <FiSearch className="h-5 w-5" />
            </motion.button>
            
            {/* Usuário (Login/Perfil) */}
            <div className="relative">
              {isAuthenticated ? (
                <motion.button 
                  onClick={toggleUserMenu}
                  className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-1 hover:bg-blue-50 rounded-full transition-colors"
                  whileHover={{ scale: 1.05, backgroundColor: "#EFF6FF" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div 
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 text-white flex items-center justify-center mr-2 shadow-md"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <span className="font-medium text-sm">
                      {userName.substring(0, 1).toUpperCase()}
                    </span>
                  </motion.div>
                  <span className="font-medium hidden sm:inline">{userName}</span>
                  <motion.div 
                    animate={{ rotate: showUserMenu ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FiChevronDown className="h-4 w-4 ml-1" />
                  </motion.div>
                </motion.button>
              ) : (
                <motion.button 
                  onClick={onLoginClick}
                  className="flex items-center text-gray-700 hover:text-blue-600"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span 
                    className="font-medium hidden sm:flex items-center bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-4 py-2 rounded-full shadow-md"
                    whileHover={{ scale: 1.03, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <FiUser className="h-5 w-5 mr-1" />
                    Entrar
                  </motion.span>
                  <motion.div 
                    className="sm:hidden p-2 hover:bg-blue-50 rounded-full"
                    whileHover={{ backgroundColor: "#EFF6FF" }}
                  >
                    <FiUser className="h-5 w-5" />
                  </motion.div>
                </motion.button>
              )}
              
              {/* Menu dropdown do usuário */}
              <AnimatePresence>
                {showUserMenu && isAuthenticated && (
                  <motion.div 
                    className="absolute right-0 mt-2 w-60 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl py-2 z-10 border border-gray-100"
                    variants={menuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm text-gray-500">Logado como</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                    </div>
                    
                    {isAdmin && (
                      <motion.button
                        onClick={() => {
                          onAdminPanelClick();
                          setShowUserMenu(false);
                        }}
                        className="flex w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        whileHover={{ x: 5, backgroundColor: "#EFF6FF" }}
                      >
                        <FiSettings className="h-5 w-5 mr-2 text-gray-400" />
                        Painel de Administração
                      </motion.button>
                    )}
                    
                    <motion.button
                      onClick={() => {
                        onLogoutClick();
                        setShowUserMenu(false);
                      }}
                      className="flex w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                      whileHover={{ x: 5, backgroundColor: "#FEF2F2" }}
                    >
                      <FiLogOut className="h-5 w-5 mr-2 text-gray-400" />
                      Sair
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Botão do carrinho */}
            <motion.button 
              onClick={onCartClick}
              className="relative text-gray-700 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-colors"
              aria-label="Carrinho de compras"
              whileHover={{ scale: 1.1, backgroundColor: "#EFF6FF" }}
              whileTap={{ scale: 0.95 }}
            >
              <FiShoppingBag className="h-5 w-5" />
              
              {cartItemsCount > 0 && (
                <motion.span 
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-md"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  {cartItemsCount}
                </motion.span>
              )}
            </motion.button>
            
            {/* Menu mobile - ícone */}
            <motion.button 
              className="md:hidden text-gray-700 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-colors"
              onClick={toggleMobileMenu}
              whileHover={{ scale: 1.1, backgroundColor: "#EFF6FF" }}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? (
                <FiX className="h-5 w-5" />
              ) : (
                <FiMenu className="h-5 w-5" />
              )}
            </motion.button>
          </div>
        </div>
        
        {/* Menu de categorias */}
        <AnimatePresence>
          {showCategoryMenu && (
            <motion.div 
              className="mt-3 bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-4 absolute left-0 right-0 mx-4 border border-gray-100 z-20"
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h3 className="text-gray-700 font-medium mb-3 border-b pb-2">Escolha uma categoria:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {CATEGORIAS_PRODUTOS.map((categoria) => (
                  <motion.button
                    key={categoria}
                    onClick={() => handleCategorySelect(categoria)}
                    className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 py-2 px-3 rounded-lg text-sm text-left flex items-center transition-colors"
                    whileHover={{ x: 3, backgroundColor: "#EFF6FF" }}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                    {categoria}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Barra de pesquisa */}
        <AnimatePresence>
          {showSearchBar && (
            <motion.div 
              className="mt-4 relative"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex w-full">
                <div className="relative w-full">
                  <input 
                    type="text" 
                    className="w-full py-2 pl-10 pr-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearch}
                    autoFocus
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <motion.button 
                      onClick={handleSearchClick}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiSearch className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
                <motion.button 
                  className="ml-2 p-2 text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    setShowSearchBar(false);
                    setSearchTerm('');
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiX className="h-5 w-5" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Menu mobile */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              className="md:hidden mt-3 pb-3 border-t border-gray-100"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <nav className="mt-3 space-y-3">
                {[
                  { icon: <FiHome className="mr-2" />, text: "Início", action: () => handleNavigation('home') },
                  { icon: <FiShoppingCart className="mr-2" />, text: "Produtos", action: () => handleNavigation('products') },
                  { icon: <FiGrid className="mr-2" />, text: "Categorias", action: () => handleNavigation('categories') },
                  { icon: <FiTag className="mr-2" />, text: "Ofertas", action: () => handleNavigation('offers') }
                ].map((item, index) => (
                  <motion.button 
                    key={index}
                    onClick={item.action}
                    className="flex w-full items-center text-gray-700 hover:text-blue-600 font-medium py-2 px-2 rounded-lg hover:bg-blue-50"
                    whileHover={{ x: 5, backgroundColor: "#EFF6FF" }}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {item.icon}
                    {item.text}
                  </motion.button>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header; 
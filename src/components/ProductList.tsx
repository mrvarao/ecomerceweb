import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiSearch, FiGrid, FiList, FiRefreshCw, FiSliders, FiChevronDown, FiXCircle, FiTag, FiDollarSign, FiShoppingBag, FiChevronRight } from 'react-icons/fi';
import ProductCard from './ProductCard';
import type { Product } from '../api';

interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  searchTerm?: string;
  selectedCategory?: string;
  showOnlyOffers?: boolean;
}

const ProductList = ({ products: initialProducts, onAddToCart, searchTerm, selectedCategory, showOnlyOffers }: ProductListProps) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<'name_asc' | 'name_desc' | 'price_asc' | 'price_desc'>('name_asc');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [showOnlyOnSale, setShowOnlyOnSale] = useState(showOnlyOffers || false);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [filterSearchTerm, setFilterSearchTerm] = useState(searchTerm || '');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Atualizar produtos quando as props mudarem
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  // Extrair categorias e configurar preço máximo
  useEffect(() => {
    // Encontrar o preço máximo para o filtro de intervalo de preço
    const highestPrice = Math.max(...products.map(p => p.preco), 1000);
    const defaultMaxPrice = Math.ceil(highestPrice / 100) * 100; // Arredondar para cima até a centena
    setMaxPrice(defaultMaxPrice);
    setPriceRange([0, defaultMaxPrice]);
    
    // Extrair categorias únicas e expandir todas por padrão
    const categories = [...new Set(products.map(p => p.categoria))];
    setUniqueCategories(categories);
    
    // Expandir todas as categorias por padrão
    const allExpanded = categories.reduce((acc, category) => {
      acc[category] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setExpandedCategories(allExpanded);
  }, [products]);

  // Filtrar e ordenar produtos
  useEffect(() => {
    let result = [...products];
    
    // Filtrar por termo de pesquisa (externo ou interno)
    const term = filterSearchTerm?.toLowerCase() || searchTerm?.toLowerCase();
    if (term) {
      result = result.filter(
        product => 
          product.nome.toLowerCase().includes(term) || 
          product.descricao.toLowerCase().includes(term) ||
          product.categoria.toLowerCase().includes(term)
      );
    }
    
    // Filtrar por categoria selecionada no header
    if (selectedCategory) {
      result = result.filter(product => product.categoria === selectedCategory);
    }
    
    // Filtrar por ofertas
    if (showOnlyOffers || showOnlyOnSale) {
      result = result.filter(product => product.emOferta);
    }
    
    // Filtros adicionais do painel de filtros
    if (selectedCategories.length > 0) {
      result = result.filter(product => selectedCategories.includes(product.categoria));
    }
    
    // Filtrar por faixa de preço
    result = result.filter(
      product => product.preco >= priceRange[0] && product.preco <= priceRange[1]
    );
    
    // Filtrar apenas produtos disponíveis
    if (showOnlyAvailable) {
      result = result.filter(product => product.quantidade > 0);
    }
    
    // Ordenar resultados
    switch (sortOption) {
      case 'name_asc':
        result.sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      case 'name_desc':
        result.sort((a, b) => b.nome.localeCompare(a.nome));
        break;
      case 'price_asc':
        result.sort((a, b) => a.preco - b.preco);
        break;
      case 'price_desc':
        result.sort((a, b) => b.preco - a.preco);
        break;
    }
    
    setFilteredProducts(result);
  }, [products, searchTerm, filterSearchTerm, selectedCategory, showOnlyOffers, sortOption, priceRange, selectedCategories, showOnlyAvailable, showOnlyOnSale]);

  // Toggle para o painel de filtros
  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };
  
  // Manipular alterações na faixa de preço
  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>, index: 0 | 1) => {
    const value = parseInt(e.target.value);
    setPriceRange(prev => {
      const newRange = [...prev] as [number, number];
      newRange[index] = value;
      return newRange;
    });
  };
  
  // Manipular seleção/desseleção de categoria
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  // Limpar todos os filtros
  const clearFilters = () => {
    // Efeito visual de feedback
    const filterPanel = document.querySelector('.filter-panel');
    if (filterPanel) {
      filterPanel.classList.add('bg-blue-50');
      setTimeout(() => filterPanel.classList.remove('bg-blue-50'), 300);
    }
    
    // Resetar filtros
    setSelectedCategories([]);
    setPriceRange([0, maxPrice]);
    setShowOnlyAvailable(false);
    setShowOnlyOnSale(showOnlyOffers || false);
    setSortOption('name_asc');
    setFilterSearchTerm('');
  };

  // Função para agrupar produtos por categoria
  const groupProductsByCategory = (products: Product[]): Record<string, Product[]> => {
    return products.reduce((acc, product) => {
      const category = product.categoria;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  };

  // Alternar expansão de uma categoria
  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Expandir todas as categorias
  const expandAllCategories = () => {
    const allExpanded = uniqueCategories.reduce((acc, category) => {
      acc[category] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setExpandedCategories(allExpanded);
  };

  // Recolher todas as categorias
  const collapseAllCategories = () => {
    setExpandedCategories({});
  };

  // Modificar a renderização dos produtos para agrupá-los por categoria
  const renderProductsByCategoryGrid = () => {
    const productsByCategory = groupProductsByCategory(filteredProducts);
    const sortedCategories = Object.keys(productsByCategory).sort();
    
    if (sortedCategories.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FiSearch className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhum produto encontrado</h3>
          <p className="text-gray-600 max-w-md">
            Não conseguimos encontrar produtos que correspondam aos seus critérios de busca. 
            Tente ajustar os filtros ou procurar por termos diferentes.
          </p>
          <button 
            onClick={clearFilters}
            className="mt-4 btn-secondary"
          >
            Limpar Filtros
          </button>
        </div>
      );
    }
    
    return (
      <div className="space-y-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-700">
            {sortedCategories.length} {sortedCategories.length === 1 ? 'categoria encontrada' : 'categorias encontradas'}
          </h3>
          <div className="flex gap-4">
            <button 
              onClick={expandAllCategories} 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Expandir todas
            </button>
            <button 
              onClick={collapseAllCategories} 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Recolher todas
            </button>
          </div>
        </div>
        
        {sortedCategories.map(category => (
          <motion.div 
            key={category}
            className="bg-white/95 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-100 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div 
              className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex justify-between items-center cursor-pointer"
              onClick={() => toggleCategoryExpansion(category)}
            >
              <div className="flex items-center">
                <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3"></div>
                <h3 className="text-xl font-bold text-gray-800">{category}</h3>
                <span className="ml-3 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {productsByCategory[category].length} {productsByCategory[category].length === 1 ? 'produto' : 'produtos'}
                </span>
              </div>
              <motion.div
                animate={{ rotate: expandedCategories[category] ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <FiChevronRight className="w-5 h-5 text-gray-500" />
              </motion.div>
            </div>
            
            <AnimatePresence>
              {expandedCategories[category] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {productsByCategory[category].map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onAddToCart={() => onAddToCart(product)}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    );
  };
  
  const renderProductsByCategoryList = () => {
    const productsByCategory = groupProductsByCategory(filteredProducts);
    const sortedCategories = Object.keys(productsByCategory).sort();
    
    if (sortedCategories.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FiSearch className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhum produto encontrado</h3>
          <p className="text-gray-600 max-w-md">
            Não conseguimos encontrar produtos que correspondam aos seus critérios de busca. 
            Tente ajustar os filtros ou procurar por termos diferentes.
          </p>
          <button 
            onClick={clearFilters}
            className="mt-4 btn-secondary"
          >
            Limpar Filtros
          </button>
        </div>
      );
    }
    
    return (
      <div className="space-y-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-700">
            {sortedCategories.length} {sortedCategories.length === 1 ? 'categoria encontrada' : 'categorias encontradas'}
          </h3>
          <div className="flex gap-4">
            <button 
              onClick={expandAllCategories} 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Expandir todas
            </button>
            <button 
              onClick={collapseAllCategories} 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Recolher todas
            </button>
          </div>
        </div>
        
        {sortedCategories.map(category => (
          <motion.div 
            key={category}
            className="bg-white/95 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-100 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div 
              className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex justify-between items-center cursor-pointer"
              onClick={() => toggleCategoryExpansion(category)}
            >
              <div className="flex items-center">
                <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3"></div>
                <h3 className="text-xl font-bold text-gray-800">{category}</h3>
                <span className="ml-3 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {productsByCategory[category].length} {productsByCategory[category].length === 1 ? 'produto' : 'produtos'}
                </span>
              </div>
              <motion.div
                animate={{ rotate: expandedCategories[category] ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <FiChevronRight className="w-5 h-5 text-gray-500" />
              </motion.div>
            </div>
            
            <AnimatePresence>
              {expandedCategories[category] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-6">
                    <div className="space-y-4">
                      {productsByCategory[category].map((product, index) => (
                        <motion.div
                          key={product.id}
                          className="card flex flex-col sm:flex-row overflow-hidden group"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          whileHover={{
                            y: -5,
                            boxShadow: "var(--shadow-lg)",
                            transition: { type: "spring", stiffness: 200, damping: 15 }
                          }}
                        >
                          <div className="sm:w-48 h-40 sm:h-auto relative overflow-hidden">
                            {product.imagem ? (
                              <motion.img 
                                src={product.imagem} 
                                alt={product.nome} 
                                className="w-full h-full object-cover object-center"
                                whileHover={{ scale: 1.08 }}
                                transition={{ duration: 0.4 }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                                <FiShoppingBag className="h-10 w-10 text-gray-400" />
                              </div>
                            )}
                            
                            {product.emOferta && (
                              <div className="absolute top-2 left-2 badge-accent">
                                <FiTag className="h-3 w-3 mr-1" />
                                <span>Oferta</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="p-4 flex-grow flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                                  {product.nome}
                                </h3>
                                <div className="badge-primary ml-2 hidden sm:flex">
                                  {product.categoria}
                                </div>
                              </div>
                              
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {product.descricao}
                              </p>
                            </div>
                            
                            <div className="flex flex-wrap items-center justify-between mt-auto">
                              <div>
                                {product.emOferta ? (
                                  <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs line-through">
                                      {(product.preco * 1.2).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                    <span className="text-gradient-primary font-bold text-lg">
                                      {product.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gradient-primary font-bold text-lg">
                                    {product.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                  </span>
                                )}
                                
                                <span className="text-xs text-gray-500 block">
                                  {product.quantidade > 0 
                                    ? `${product.quantidade} em estoque` 
                                    : <span className="text-rose-500 font-medium">Esgotado</span>}
                                </span>
                              </div>
                              
                              <motion.button 
                                onClick={() => onAddToCart(product)}
                                className={`mt-2 sm:mt-0 ${
                                  product.quantidade > 0 
                                    ? 'btn-primary'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed px-4 py-2 rounded-lg'
                                }`}
                                whileHover={product.quantidade > 0 ? { scale: 1.05 } : {}}
                                whileTap={product.quantidade > 0 ? { scale: 0.95 } : {}}
                                disabled={product.quantidade <= 0}
                              >
                                <FiShoppingBag className="h-4 w-4 mr-1" />
                                {product.quantidade > 0 ? 'Adicionar' : 'Indisponível'}
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header da seção de produtos */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 md:mb-0"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gradient-primary mb-2">
            {searchTerm 
              ? `Resultados para "${searchTerm}"` 
              : selectedCategory 
                ? `Categoria: ${selectedCategory}` 
                : showOnlyOffers 
                  ? 'Ofertas Especiais' 
                  : 'Nossos Produtos'}
          </h2>
          <p className="text-gray-600">
            {filteredProducts.length} 
            {filteredProducts.length === 1 ? ' produto encontrado' : ' produtos encontrados'}
          </p>
        </motion.div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <motion.div 
            className="flex space-x-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-sm border border-gray-100"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <motion.button
              onClick={() => setViewMode('grid')}
              className={`flex items-center justify-center p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiGrid className="h-5 w-5" />
            </motion.button>
            <motion.button
              onClick={() => setViewMode('list')}
              className={`flex items-center justify-center p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiList className="h-5 w-5" />
            </motion.button>
          </motion.div>
          
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.button
              onClick={toggleFilters}
              className="btn-secondary flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiFilter className="h-4 w-4" />
              <span>Filtros</span>
              <motion.div
                animate={{ rotate: showFilters ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <FiChevronDown className="h-4 w-4" />
              </motion.div>
            </motion.button>
          </motion.div>
          
          <motion.div 
            className="relative flex-grow md:flex-grow-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="appearance-none w-full md:w-auto pl-4 pr-10 py-2 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            >
              <option value="name_asc">Nome (A-Z)</option>
              <option value="name_desc">Nome (Z-A)</option>
              <option value="price_asc">Preço (Menor-Maior)</option>
              <option value="price_desc">Preço (Maior-Menor)</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
              <FiSliders className="h-4 w-4" />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Painel de filtros */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            className="mb-8 bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-100 filter-panel transition-colors duration-300"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2 md:mb-0">Filtros Avançados</h3>
              <motion.button 
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 self-start"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <FiRefreshCw className="h-3 w-3" />
                Limpar Filtros
              </motion.button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Campo de busca */}
              <div className="md:col-span-3 mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <FiSearch className="mr-2 text-blue-600" /> 
                  Busca por Texto
                </h4>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Digite para buscar..."
                    value={filterSearchTerm}
                    onChange={(e) => setFilterSearchTerm(e.target.value)}
                    className="w-full py-2 pl-10 pr-4 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  {filterSearchTerm && (
                    <button
                      onClick={() => setFilterSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <FiXCircle className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Filtro de preço */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <FiDollarSign className="mr-2 text-blue-600" /> 
                  Faixa de Preço
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{priceRange[0].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    <span>{priceRange[1].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  <div className="relative pt-1">
                    <div className="h-1 bg-gray-200 rounded-full">
                      <div 
                        className="absolute h-1 bg-blue-500 rounded-full"
                        style={{
                          left: `${(priceRange[0] / maxPrice) * 100}%`,
                          width: `${((priceRange[1] - priceRange[0]) / maxPrice) * 100}%`
                        }}
                      ></div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      step="50"
                      value={priceRange[0]}
                      onChange={(e) => handlePriceRangeChange(e, 0)}
                      className="absolute w-full h-1 opacity-0 cursor-pointer"
                    />
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      step="50"
                      value={priceRange[1]}
                      onChange={(e) => handlePriceRangeChange(e, 1)}
                      className="absolute w-full h-1 opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        max={priceRange[1]}
                        value={priceRange[0]}
                        onChange={(e) => handlePriceRangeChange(e, 0)}
                        className="w-full py-2 pl-8 pr-2 border border-gray-200 rounded-md text-sm"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">
                        R$
                      </span>
                    </div>
                    <span className="text-gray-400 flex items-center">-</span>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min={priceRange[0]}
                        max={maxPrice}
                        value={priceRange[1]}
                        onChange={(e) => handlePriceRangeChange(e, 1)}
                        className="w-full py-2 pl-8 pr-2 border border-gray-200 rounded-md text-sm"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">
                        R$
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Filtro de categoria */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <FiTag className="mr-2 text-blue-600" /> 
                  Categorias
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {uniqueCategories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer hover:text-blue-600"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded border-gray-300"
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Outros filtros */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <FiShoppingBag className="mr-2 text-blue-600" /> 
                  Status
                </h4>
                <div className="space-y-2">
                  <label
                    className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer hover:text-blue-600"
                  >
                    <input
                      type="checkbox"
                      checked={showOnlyAvailable}
                      onChange={() => setShowOnlyAvailable(!showOnlyAvailable)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded border-gray-300"
                    />
                    <span>Apenas itens em estoque</span>
                  </label>
                  
                  <label
                    className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer hover:text-blue-600"
                  >
                    <input
                      type="checkbox"
                      checked={showOnlyOnSale}
                      onChange={() => setShowOnlyOnSale(!showOnlyOnSale)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded border-gray-300"
                    />
                    <span className="flex items-center">
                      <span className="animate-pulse-custom mr-1.5 h-2 w-2 rounded-full bg-rose-500"></span>
                      Apenas ofertas
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Estado de carregamento */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Carregando produtos...</p>
        </div>
      )}
      
      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg my-6">
          <div className="flex items-center">
            <FiXCircle className="h-5 w-5 text-red-500 mr-2" />
            <p>{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Tentar novamente
          </button>
        </div>
      )}
      
      {/* Lista de produtos */}
      {!isLoading && !error && (
        <>
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FiSearch className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-600 max-w-md">
                Não conseguimos encontrar produtos que correspondam aos seus critérios de busca. 
                Tente ajustar os filtros ou procurar por termos diferentes.
              </p>
              <button 
                onClick={clearFilters}
                className="mt-4 btn-secondary"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            viewMode === 'grid' ? renderProductsByCategoryGrid() : renderProductsByCategoryList()
          )}
        </>
      )}
    </div>
  );
};

export default ProductList; 
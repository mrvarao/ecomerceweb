import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiStar, FiTag, FiImage, FiBox, FiFolder, FiArrowRight, FiEye } from 'react-icons/fi';
import type { Product } from '../api';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Formatar preço em reais
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Variantes de animação
  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    },
    hover: { 
      y: -8,
      boxShadow: "var(--shadow-lg)",
      transition: { 
        type: "spring", 
        stiffness: 200,
        damping: 15
      }
    }
  };

  // Gerar estrelas com base em uma avaliação simulada
  const randomRating = Math.floor(Math.random() * 2) + 4; // Valores entre 4 e 5
  const stars = Array(5).fill(0).map((_, i) => i < randomRating);

  return (
    <motion.div 
      className="card group overflow-visible"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      layout
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative h-64 overflow-hidden group">
        {product.imagem ? (
          <>
            <motion.img 
              src={product.imagem} 
              alt={product.nome} 
              className="w-full h-full object-cover object-center"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
            <FiImage className="h-16 w-16 text-gray-400" />
          </div>
        )}
        
        {/* Badge de categoria */}
        <motion.div 
          className="absolute top-3 left-3 badge-primary"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="flex items-center gap-1">
            <FiFolder className="h-3 w-3" />
            <span>{product.categoria}</span>
          </div>
        </motion.div>
        
        {/* Badge de oferta */}
        {product.emOferta && (
          <motion.div 
            className="absolute top-3 right-3 badge bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm animate-pulse-custom"
            initial={{ scale: 0, x: 20 }}
            animate={{ scale: 1, x: 0 }}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.1 }}
          >
            <div className="flex items-center gap-1">
              <FiTag className="h-3 w-3" />
              <span className="animate-shine">OFERTA</span>
            </div>
          </motion.div>
        )}
        
        {/* Badge de estoque baixo */}
        {product.quantidade <= 5 && product.quantidade > 0 && (
          <motion.div 
            className="absolute top-10 left-3 badge-warning"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.1 }}
          >
            <div className="flex items-center gap-1">
              <FiBox className="h-3 w-3" />
              <span>Últimas unidades</span>
            </div>
          </motion.div>
        )}
        
        {/* Botões rápidos flutuantes */}
        <motion.div 
          className="absolute bottom-3 right-3 left-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ y: 10, opacity: 0 }}
          animate={isHovered ? { y: 0, opacity: 1 } : { y: 10, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <motion.div 
            className="flex items-center gap-1 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-md"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex gap-0.5">
              {stars.map((filled, i) => (
                <FiStar 
                  key={i} 
                  className={`h-3.5 w-3.5 ${filled ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="text-xs font-medium text-gray-700 ml-1">{randomRating}.0</span>
          </motion.div>
          
          <div className="flex items-center gap-2">
            <motion.button 
              className="p-2 bg-white/95 backdrop-blur-sm rounded-full shadow-md text-gray-700 hover:text-rose-500 hover:bg-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiHeart className="h-4 w-4" />
            </motion.button>
            <motion.button 
              className="p-2 bg-white/95 backdrop-blur-sm rounded-full shadow-md text-gray-700 hover:text-blue-600 hover:bg-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiEye className="h-4 w-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>
      
      <div className="p-5">
        <motion.h3 
          className="text-lg font-bold text-gray-800 mb-1.5 line-clamp-1 group-hover:text-blue-600 transition-colors"
          layout
        >
          {product.nome}
        </motion.h3>
        <motion.p 
          className="text-gray-600 text-sm mb-4 line-clamp-2 h-10"
          layout
        >
          {product.descricao}
        </motion.p>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex flex-col">
            {product.emOferta ? (
              <>
                <motion.span 
                  className="text-gray-500 text-xs line-through"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ delay: 0.3 }}
                >
                  {formatPrice(product.preco * 1.2)}
                </motion.span>
                <motion.span 
                  className="text-gradient-primary font-bold text-xl"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {formatPrice(product.preco)}
                </motion.span>
              </>
            ) : (
              <motion.span 
                className="text-gradient-primary font-bold text-xl"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {formatPrice(product.preco)}
              </motion.span>
            )}
            
            {/* Exibir quantidade disponível */}
            <motion.span 
              className="text-xs text-gray-500 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {product.quantidade > 0 
                ? `${product.quantidade} em estoque` 
                : <span className="text-rose-500 font-medium">Esgotado</span>}
            </motion.span>
          </div>
          
          <motion.button 
            onClick={onAddToCart}
            className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
              product.quantidade > 0 
                ? 'btn-primary' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            whileHover={product.quantidade > 0 ? { 
              scale: 1.02,
              boxShadow: "var(--shadow-md)"
            } : {}}
            whileTap={product.quantidade > 0 ? { scale: 0.98 } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            disabled={product.quantidade <= 0}
          >
            {product.quantidade > 0 ? (
              <>
                <FiShoppingCart className="h-4 w-4" />
                <span>Adicionar</span>
                <FiArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </>
            ) : (
              <>
                <FiBox className="h-4 w-4" />
                <span>Indisponível</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard; 
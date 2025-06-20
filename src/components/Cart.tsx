import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiMinus, 
  FiPlus, 
  FiShoppingBag, 
  FiTrash2, 
  FiArrowRight, 
  FiShoppingCart 
} from 'react-icons/fi';
import { useEffect } from 'react';

interface CartItem {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  imagem?: string;
}

interface CartProps {
  items: CartItem[];
  total: number;
  onUpdateQuantity: (productId: string, quantidade: number) => void;
  onRemoveItem: (productId: string) => void;
  onClose: () => void;
  onCheckout: () => void;
  isLoading?: boolean;
}

const Cart = ({
  items,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onClose,
  onCheckout,
  isLoading = false
}: CartProps) => {
  // Adicionar estilos CSS para a scrollbar customizada
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .cart-scroll::-webkit-scrollbar {
        width: 4px;
      }
      
      .cart-scroll::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
      }
      
      .cart-scroll::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 10px;
      }
      
      .cart-scroll::-webkit-scrollbar-thumb:hover {
        background: #9ca3af;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Formatar preço em reais
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Variantes de animação
  const cartItemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    exit: { 
      opacity: 0, 
      x: -20, 
      transition: { 
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-xl p-6 h-full border border-gray-100"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <motion.h2 
          className="text-2xl font-bold text-gray-800 flex items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.span 
            className="text-blue-600 mr-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
          >
            <FiShoppingBag className="h-6 w-6" />
          </motion.span>
          Seu Carrinho
        </motion.h2>
        <motion.button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
          whileHover={{ rotate: 90, backgroundColor: "#EEF2FF" }}
          whileTap={{ scale: 0.9 }}
        >
          <FiX className="h-5 w-5" />
        </motion.button>
      </div>

      {items.length === 0 ? (
        <motion.div 
          className="py-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: 0.3, 
              type: "spring", 
              stiffness: 300, 
              damping: 20 
            }}
            className="bg-blue-50 p-6 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6"
          >
            <FiShoppingCart className="h-12 w-12 text-blue-500" />
          </motion.div>
          <motion.p 
            className="text-gray-500 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Seu carrinho está vazio
          </motion.p>
          <motion.p 
            className="text-sm text-gray-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Adicione produtos para continuar comprando
          </motion.p>
          <motion.button
            onClick={onClose}
            className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-full font-medium flex items-center mx-auto"
            whileHover={{ scale: 1.05, backgroundColor: "#2563EB" }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Explorar produtos
            <FiArrowRight className="ml-2" />
          </motion.button>
        </motion.div>
      ) : (
        <>
          <div className="max-h-96 overflow-y-auto mb-4 pr-2 -mr-2 cart-scroll">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div 
                  key={item.id} 
                  className="flex py-4 border-b border-gray-100 last:border-b-0"
                  variants={cartItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
                    {item.imagem ? (
                      <motion.img 
                        src={item.imagem} 
                        alt={item.nome} 
                        className="h-full w-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      />
                    ) : (
                      <motion.div 
                        className="h-full w-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center"
                        whileHover={{ backgroundColor: "#E5E7EB" }}
                      >
                        <span className="text-gray-400 text-xs">Sem imagem</span>
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex flex-1 flex-col">
                    <div className="flex justify-between text-base font-medium text-gray-800">
                      <h3 className="line-clamp-1">{item.nome}</h3>
                      <motion.p 
                        className="ml-4 font-semibold text-blue-600"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 + (index * 0.05) }}
                      >
                        {formatPrice(item.preco * item.quantidade)}
                      </motion.p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        <motion.button
                          onClick={() => onUpdateQuantity(item.id, item.quantidade - 1)}
                          className="px-2 py-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                          whileHover={{ backgroundColor: "#EFF6FF" }}
                          whileTap={{ scale: 0.9 }}
                          disabled={item.quantidade <= 1}
                        >
                          <FiMinus className="h-4 w-4" />
                        </motion.button>
                        <span className="px-3 py-1 text-gray-800 font-medium bg-gray-50">{item.quantidade}</span>
                        <motion.button
                          onClick={() => onUpdateQuantity(item.id, item.quantidade + 1)}
                          className="px-2 py-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                          whileHover={{ backgroundColor: "#EFF6FF" }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FiPlus className="h-4 w-4" />
                        </motion.button>
                      </div>
                      
                      <motion.button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center"
                        whileHover={{ scale: 1.05, x: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FiTrash2 className="h-4 w-4 mr-1" />
                        Remover
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <motion.div 
            className="border-t border-gray-100 pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex flex-col space-y-3 mb-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Frete</span>
                <span className="text-green-600 font-medium">Grátis</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-800 pt-3 border-t border-dashed border-gray-200">
                <span>Total</span>
                <motion.span
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-lg"
                >
                  {formatPrice(total)}
                </motion.span>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-2">
                <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-blue-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: ["0%", "100%"],
                      transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
                    }}
                  />
                </div>
                <span className="ml-3 text-sm text-gray-600">Processando...</span>
              </div>
            ) : (
              <button
                onClick={onCheckout}
                disabled={items.length === 0}
                className={`w-full py-3 px-4 rounded-lg font-bold text-white flex items-center justify-center gap-2 ${
                  items.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <FiShoppingBag className="h-5 w-5" />
                <span>Finalizar Compra</span>
              </button>
            )}
            
            <div className="mt-4">
              <motion.button
                onClick={onClose}
                className="w-full text-blue-600 hover:text-blue-700 font-medium text-center py-2 flex items-center justify-center"
                whileHover={{ x: -3 }}
              >
                <FiArrowRight className="h-4 w-4 mr-2 transform rotate-180" />
                Continuar Comprando
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default Cart; 
import { motion } from 'framer-motion';
import { FiArrowRight, FiShoppingBag, FiTag, FiTrendingUp } from 'react-icons/fi';

interface HeroBannerProps {
  onShopNow: () => void;
  onViewOffers: () => void;
}

const HeroBanner = ({ onShopNow, onViewOffers }: HeroBannerProps) => {
  return (
    <div className="relative overflow-hidden mb-16">
      {/* Background decorativo */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-blue-200/40 to-indigo-200/40 blur-3xl"></div>
        <div className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-pink-200/30 to-purple-200/30 blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/2 transform -translate-x-1/2 w-full h-72 rounded-full bg-gradient-to-r from-blue-100/30 via-indigo-100/30 to-purple-100/30 blur-3xl"></div>
        
        <svg className="absolute top-0 left-0 w-full h-full text-gray-100 opacity-40" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotPattern)" />
        </svg>
      </div>
      
      <div className="container mx-auto px-4 pt-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Conteúdo de texto */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full">
                <FiTrendingUp className="h-4 w-4" />
                <span>Nova coleção de produtos</span>
              </span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight"
            >
              <span className="text-gray-900">Descubra nossos</span>
              <br />
              <span className="text-gradient-primary">produtos incríveis</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-gray-600 text-lg mb-8 max-w-xl"
            >
              Explore nossa seleção exclusiva de produtos de alta qualidade com design moderno e preços acessíveis. Atualizamos nosso catálogo semanalmente!
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <motion.button
                onClick={onShopNow}
                className="btn-primary flex items-center gap-2 px-6 py-3 text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiShoppingBag className="h-5 w-5" />
                <span>Comprar Agora</span>
                <FiArrowRight className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                onClick={onViewOffers}
                className="btn-secondary flex items-center gap-2 px-6 py-3 text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiTag className="h-5 w-5" />
                <span>Ver Ofertas</span>
              </motion.button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-10 flex items-center space-x-6"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((_, index) => (
                  <div 
                    key={index} 
                    className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {String.fromCharCode(65 + index)}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center space-x-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((_, index) => (
                    <svg key={index} className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm">+1500 clientes satisfeitos</p>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Imagem principal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                  alt="Coleção de Produtos" 
                  className="w-full h-full object-cover rounded-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl"></div>
              </div>
              
              {/* Badge flutuante */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute -top-6 -right-6 bg-white rounded-xl p-3 shadow-lg"
              >
                <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold px-4 py-2 rounded-lg animate-shine relative overflow-hidden">
                  <span className="block text-xl">Até 50%</span>
                  <span className="block text-sm">DE DESCONTO</span>
                </div>
              </motion.div>
              
              {/* Cartão de produto flutuante */}
              <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -bottom-8 -left-8 glass p-4 rounded-xl shadow-lg max-w-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiShoppingBag className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Entrega Rápida</h3>
                    <p className="text-gray-600 text-sm">Entregamos em até 48h em todo o país</p>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Círculos decorativos */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border-4 border-dashed border-blue-200 animate-slow-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border-4 border-dashed border-indigo-100 animate-reverse-slow-spin"></div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner; 
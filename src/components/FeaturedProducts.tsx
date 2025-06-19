import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiStar } from 'react-icons/fi';
import ProductCard from './ProductCard';
import type { Product } from '../api';
import { api } from '../api';

interface FeaturedProductsProps {
  maxProducts?: number;
}

const FeaturedProducts = ({ maxProducts = 4 }: FeaturedProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const allProducts = await api.products.getAll();
        
        // Filtrando para pegar apenas produtos em oferta ou destacados
        // Em um sistema real, você teria uma marcação específica para produtos em destaque
        const featured = allProducts
          .filter(product => product.emOferta || product.quantidade > 10)
          .sort(() => Math.random() - 0.5) // Ordenação aleatória
          .slice(0, maxProducts);
        
        setProducts(featured);
        setIsLoading(false);
      } catch (err) {
        setError('Não foi possível carregar os produtos em destaque.');
        setIsLoading(false);
        console.error('Erro ao carregar produtos em destaque:', err);
      }
    };
    
    fetchFeaturedProducts();
  }, [maxProducts]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-blue-50/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 mb-3"
            >
              <div className="bg-amber-100 text-amber-600 p-1.5 rounded-lg">
                <FiStar className="h-4 w-4" />
              </div>
              <span className="text-amber-600 font-medium text-sm">PRODUTOS EM DESTAQUE</span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold"
            >
              Nossos Produtos <span className="text-gradient-primary">Mais Populares</span>
            </motion.h2>
          </div>
          
          <motion.a 
            href="#all-products"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-4 md:mt-0 text-blue-600 font-medium flex items-center gap-1 group"
          >
            Ver todos os produtos
            <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </motion.a>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
            {error}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => {
                  // Lógica para adicionar ao carrinho
                  console.log(`Produto adicionado ao carrinho: ${product.nome}`);
                }}
              />
            ))}
          </motion.div>
        )}
        
        {/* Seção de depoimentos */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-20 bg-white rounded-2xl p-8 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full -translate-y-1/3 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-full translate-y-1/3 -translate-x-1/3"></div>
          
          <div className="relative z-10">
            <div className="flex justify-center mb-8">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <svg key={i} className="w-6 h-6 text-amber-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                  </svg>
                ))}
              </div>
            </div>
            
            <blockquote className="text-center text-xl md:text-2xl font-medium text-gray-800 mb-8 max-w-3xl mx-auto">
              "Os produtos superaram minhas expectativas. A qualidade é excelente e o atendimento ao cliente foi excepcional. Recomendo muito esta loja!"
            </blockquote>
            
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=100&q=80" 
                  alt="Cliente" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-bold text-gray-900">Mariana Silva</div>
                <div className="text-gray-600 text-sm">Cliente desde 2022</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProducts; 
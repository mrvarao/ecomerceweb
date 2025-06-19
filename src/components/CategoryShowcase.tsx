import { motion } from 'framer-motion';
import { FiBox, FiCpu, FiHeadphones, FiMonitor, FiSmartphone, FiWatch } from 'react-icons/fi';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  color: string;
  image: string;
}

interface CategoryShowcaseProps {
  onCategorySelect: (categoryId: string) => void;
}

const CategoryShowcase = ({ onCategorySelect }: CategoryShowcaseProps) => {
  // Categorias simuladas
  const categories: Category[] = [
    {
      id: 'smartphones',
      name: 'Smartphones',
      icon: <FiSmartphone />,
      count: 24,
      color: 'from-blue-500 to-indigo-500',
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c21hcnRwaG9uZXN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 'notebooks',
      name: 'Notebooks',
      icon: <FiMonitor />,
      count: 18,
      color: 'from-emerald-500 to-teal-500',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGFwdG9wfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 'watches',
      name: 'Smartwatches',
      icon: <FiWatch />,
      count: 12,
      color: 'from-purple-500 to-violet-500',
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c21hcnQlMjB3YXRjaHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 'headphones',
      name: 'Fones',
      icon: <FiHeadphones />,
      count: 16,
      color: 'from-rose-500 to-pink-500',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aGVhZHBob25lc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 'gadgets',
      name: 'Gadgets',
      icon: <FiCpu />,
      count: 20,
      color: 'from-amber-500 to-orange-500',
      image: 'https://images.unsplash.com/photo-1519558260268-cde7e03a0152?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Z2FkZ2V0c3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 'accessories',
      name: 'Acessórios',
      icon: <FiBox />,
      count: 32,
      color: 'from-sky-500 to-blue-500',
      image: 'https://images.unsplash.com/photo-1625932645867-4f3b55a3d6ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y29tcHV0ZXIlMjBhY2Nlc3Nvcmllc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
      }
    },
    hover: {
      y: -8,
      boxShadow: "var(--shadow-lg)",
      transition: { 
        type: "spring", 
        stiffness: 300,
        damping: 15
      }
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Explore por <span className="text-gradient-primary">Categoria</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-600 max-w-2xl mx-auto"
          >
            Navegue por nossos produtos organizados em categorias para encontrar exatamente o que você procura
          </motion.p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {categories.map((category) => (
            <motion.div
              key={category.id}
              variants={itemVariants}
              whileHover="hover"
              className="relative rounded-xl overflow-hidden h-64 group cursor-pointer"
              onClick={() => onCategorySelect(category.id)}
            >
              {/* Imagem de fundo */}
              <div className="absolute inset-0">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10"></div>
              </div>
              
              {/* Conteúdo */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className={`bg-gradient-to-br ${category.color} p-3 rounded-lg text-white`}>
                    <div className="text-xl">
                      {category.icon}
                    </div>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-white text-xs">
                    {category.count} produtos
                  </div>
                </div>
                
                <div>
                  <h3 className="text-white text-xl font-bold mb-1">{category.name}</h3>
                  <div className="flex items-center text-white/80 text-sm">
                    <span>Ver produtos</span>
                    <svg 
                      className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryShowcase; 
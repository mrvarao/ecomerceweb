import { motion } from 'framer-motion';
import { FiArrowUp } from 'react-icons/fi';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="relative">
      {/* Faixa decorativa no topo */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
      
      {/* Conteúdo principal do footer */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300">
        <div className="container mx-auto px-4 py-8">          
          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-8"></div>
          
          {/* Rodapé e botão para voltar ao topo */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} E-Shop. Todos os direitos reservados.
            </p>
            
            <div className="flex space-x-4 items-center">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Política de Privacidade</a>
              <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Termos de Serviço</a>
              
              <motion.button
                onClick={scrollToTop}
                className="ml-4 w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg hover:shadow-blue-900/20"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiArrowUp />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
import { useState, useEffect } from 'react';
import { api } from '../api';
import type { User, RegisterUserData, Product } from '../api';
import { CATEGORIAS_PRODUTOS } from '../api';
import { motion } from 'framer-motion';

interface AdminPanelProps {
  onClose: () => void;
  onProductUpdate?: () => void;
}

interface ProductFormData {
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  emOferta: boolean;
  quantidade: number;
  categoria: string;
}

const AdminPanel = ({ onClose, onProductUpdate }: AdminPanelProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [activeTab, setActiveTab] = useState<'admins' | 'products'>('admins');

  // Dados do novo usuário
  const [newUser, setNewUser] = useState<RegisterUserData>({
    name: '',
    email: '',
    password: '',
    role: 'admin'
  });

  // Dados do novo produto
  const [newProduct, setNewProduct] = useState<ProductFormData>({
    nome: '',
    descricao: '',
    preco: 0,
    imagem: '',
    emOferta: false,
    quantidade: 1,
    categoria: CATEGORIAS_PRODUTOS[0]
  });

  // Mensagem de sucesso
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Buscar usuários e produtos
  useEffect(() => {
    fetchUsers();
    fetchProducts();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.admin.getUsers();
      setUsers(data);
    } catch (err) {
      setError('Erro ao carregar usuários. Verifique se você tem permissões de administrador.');
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const data = await api.products.getAll();
      setProducts(data);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Lidar com a mudança nos campos do formulário de usuário
  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  // Lidar com a mudança nos campos do formulário de produto
  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Manipular diferentes tipos de campos
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setNewProduct(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'preco' || name === 'quantidade') {
      setNewProduct(prev => ({ 
        ...prev, 
        [name]: parseFloat(value) || 0 
      }));
    } else {
      setNewProduct(prev => ({ ...prev, [name]: value }));
    }
  };

  // Registrar novo usuário
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!newUser.name || !newUser.email || !newUser.password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    
    try {
      setIsRegistering(true);
      setError(null);
      
      const registeredUser = await api.admin.registerUser(newUser);
      
      if (registeredUser) {
        setSuccessMessage(`Usuário ${newUser.name} registrado com sucesso!`);
        // Limpar formulário
        setNewUser({
          name: '',
          email: '',
          password: '',
          role: 'admin'
        });
        // Atualizar lista de usuários
        fetchUsers();
      } else {
        setError('Erro ao registrar usuário. Tente novamente.');
      }
    } catch (err) {
      setError('Erro ao registrar usuário. Verifique se o email já está em uso.');
      console.error('Erro ao registrar usuário:', err);
    } finally {
      setIsRegistering(false);
    }
  };

  // Criar novo produto
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!newProduct.nome || !newProduct.descricao || newProduct.preco <= 0 || newProduct.quantidade < 0 || !newProduct.categoria) {
      setError('Por favor, preencha todos os campos corretamente. O preço deve ser maior que zero e a quantidade não pode ser negativa.');
      return;
    }
    
    try {
      setIsCreatingProduct(true);
      setError(null);
      
      const createdProduct = await api.products.create(newProduct);
      
      if (createdProduct) {
        setSuccessMessage(`Produto ${newProduct.nome} cadastrado com sucesso!`);
        // Limpar formulário
        setNewProduct({
          nome: '',
          descricao: '',
          preco: 0,
          imagem: '',
          emOferta: false,
          quantidade: 1,
          categoria: CATEGORIAS_PRODUTOS[0]
        });
        // Atualizar lista de produtos
        fetchProducts();
        
        // Notificar App.tsx para atualizar a lista de produtos na página principal
        if (onProductUpdate) {
          onProductUpdate();
        }
      } else {
        setError('Erro ao cadastrar produto. Tente novamente.');
      }
    } catch (err) {
      setError('Erro ao cadastrar produto.');
      console.error('Erro ao cadastrar produto:', err);
    } finally {
      setIsCreatingProduct(false);
    }
  };

  // Remover usuário
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja remover o usuário ${userName}?`)) {
      return;
    }
    
    try {
      const success = await api.admin.deleteUser(userId);
      
      if (success) {
        setSuccessMessage(`Usuário ${userName} removido com sucesso!`);
        // Atualizar lista de usuários
        fetchUsers();
      } else {
        setError('Erro ao remover usuário. Tente novamente.');
      }
    } catch (err) {
      setError('Erro ao remover usuário.');
      console.error('Erro ao remover usuário:', err);
    }
  };

  // Remover produto
  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Tem certeza que deseja remover o produto ${productName}?`)) {
      return;
    }
    
    try {
      const success = await api.products.delete(productId);
      
      if (success) {
        setSuccessMessage(`Produto ${productName} removido com sucesso!`);
        // Atualizar lista de produtos
        fetchProducts();
        
        // Notificar App.tsx para atualizar a lista de produtos na página principal
        if (onProductUpdate) {
          onProductUpdate();
        }
      } else {
        setError('Erro ao remover produto. Tente novamente.');
      }
    } catch (err) {
      setError('Erro ao remover produto.');
      console.error('Erro ao remover produto:', err);
    }
  };

  // Formatar preço em reais
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-6xl my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Painel de Administração</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        {/* Abas */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex -mb-px">
            <button
              className={`mr-1 py-2 px-4 font-medium ${
                activeTab === 'admins'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('admins')}
            >
              Administradores
            </button>
            <button
              className={`mr-1 py-2 px-4 font-medium ${
                activeTab === 'products'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('products')}
            >
              Produtos
            </button>
          </div>
        </div>

        {/* Conteúdo da aba de Administradores */}
        {activeTab === 'admins' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Formulário de registro */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Registrar Novo Administrador</h3>
              
              <form onSubmit={handleRegister}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newUser.name}
                    onChange={handleUserChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome completo"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleUserChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                    Senha
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleUserChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Senha segura"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="role" className="block text-gray-700 text-sm font-medium mb-2">
                    Função
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={newUser.role}
                    onChange={handleUserChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                
                <button
                  type="submit"
                  disabled={isRegistering}
                  className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors ${
                    isRegistering ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isRegistering ? 'Registrando...' : 'Registrar Administrador'}
                </button>
              </form>
            </div>
            
            {/* Lista de usuários */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Administradores Cadastrados</h3>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-blue-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: ["0%", "100%", "0%"],
                          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                        }}
                      />
                    </div>
                    <p className="text-gray-600 mt-3 text-sm">Carregando administradores...</p>
                  </div>
                </div>
              ) : users.length === 0 ? (
                <p className="text-gray-600">Nenhum usuário encontrado.</p>
              ) : (
                <div className="overflow-y-auto max-h-96">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b text-left">Nome</th>
                        <th className="py-2 px-4 border-b text-left">Email</th>
                        <th className="py-2 px-4 border-b text-left">Função</th>
                        <th className="py-2 px-4 border-b text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(user => user.role === 'admin').map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">{user.name}</td>
                          <td className="py-2 px-4 border-b">{user.email}</td>
                          <td className="py-2 px-4 border-b capitalize">
                            {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            <button
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              className="text-red-600 hover:text-red-800"
                              title="Remover usuário"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conteúdo da aba de Produtos */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Formulário de cadastro de produto */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Cadastrar Novo Produto</h3>
              
              <form onSubmit={handleCreateProduct}>
                <div className="mb-4">
                  <label htmlFor="nome" className="block text-gray-700 text-sm font-medium mb-2">
                    Nome do Produto
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={newProduct.nome}
                    onChange={handleProductChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Smartphone Premium"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="descricao" className="block text-gray-700 text-sm font-medium mb-2">
                    Descrição
                  </label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    value={newProduct.descricao}
                    onChange={handleProductChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descrição detalhada do produto"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="preco" className="block text-gray-700 text-sm font-medium mb-2">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    id="preco"
                    name="preco"
                    value={newProduct.preco || ''}
                    onChange={handleProductChange}
                    min="0.01"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 1299.99"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="quantidade" className="block text-gray-700 text-sm font-medium mb-2">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    id="quantidade"
                    name="quantidade"
                    value={newProduct.quantidade || ''}
                    onChange={handleProductChange}
                    min="0"
                    step="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 10"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emOferta"
                      name="emOferta"
                      checked={newProduct.emOferta}
                      onChange={handleProductChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="emOferta" className="ml-2 block text-gray-700 text-sm font-medium">
                      Produto em oferta
                    </label>
                  </div>
                  {newProduct.emOferta && (
                    <p className="mt-1 text-sm text-green-600">
                      Produtos em oferta são destacados para os clientes.
                    </p>
                  )}
                </div>
                
                <div className="mb-6">
                  <label htmlFor="categoria" className="block text-gray-700 text-sm font-medium mb-2">
                    Categoria
                  </label>
                  <select
                    id="categoria"
                    name="categoria"
                    value={newProduct.categoria}
                    onChange={handleProductChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIAS_PRODUTOS.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="imagem" className="block text-gray-700 text-sm font-medium mb-2">
                    URL da Imagem
                  </label>
                  <input
                    type="url"
                    id="imagem"
                    name="imagem"
                    value={newProduct.imagem}
                    onChange={handleProductChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                  
                  {newProduct.imagem && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">Pré-visualização:</p>
                      <img 
                        src={newProduct.imagem} 
                        alt="Pré-visualização" 
                        className="h-32 w-32 object-cover border rounded-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Erro+na+imagem';
                        }}
                      />
                    </div>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={isCreatingProduct}
                  className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors ${
                    isCreatingProduct ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isCreatingProduct ? 'Cadastrando...' : 'Cadastrar Produto'}
                </button>
              </form>
            </div>
            
            {/* Lista de produtos */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Produtos Cadastrados</h3>
              
              {isLoadingProducts ? (
                <div className="flex justify-center items-center h-64">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-blue-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: ["0%", "100%", "0%"],
                          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                        }}
                      />
                    </div>
                    <p className="text-gray-600 mt-3 text-sm">Carregando produtos...</p>
                  </div>
                </div>
              ) : products.length === 0 ? (
                <p className="text-gray-600">Nenhum produto encontrado.</p>
              ) : (
                <div className="overflow-y-auto max-h-96">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b text-left">Imagem</th>
                        <th className="py-2 px-4 border-b text-left">Nome</th>
                        <th className="py-2 px-4 border-b text-left">Preço</th>
                        <th className="py-2 px-4 border-b text-left">Estoque</th>
                        <th className="py-2 px-4 border-b text-left">Categoria</th>
                        <th className="py-2 px-4 border-b text-left">Status</th>
                        <th className="py-2 px-4 border-b text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">
                            <div className="h-12 w-12 overflow-hidden rounded-md">
                              {product.imagem ? (
                                <img 
                                  src={product.imagem}
                                  alt={product.nome}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Sem+imagem';
                                  }}
                                />
                              ) : (
                                <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-400 text-xs">Sem imagem</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-4 border-b">
                            <div className="font-medium">{product.nome}</div>
                            <div className="text-xs text-gray-500 truncate max-w-xs">{product.descricao}</div>
                          </td>
                          <td className="py-2 px-4 border-b">{formatPrice(product.preco)}</td>
                          <td className="py-2 px-4 border-b">
                            <span className={`${
                              product.quantidade <= 0 
                                ? 'text-red-600 font-medium' 
                                : product.quantidade <= 5 
                                  ? 'text-amber-600 font-medium' 
                                  : 'text-gray-700'
                            }`}>
                              {product.quantidade <= 0 
                                ? 'Esgotado' 
                                : `${product.quantidade} unidade(s)`}
                            </span>
                          </td>
                          <td className="py-2 px-4 border-b">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {product.categoria || 'Sem categoria'}
                            </span>
                          </td>
                          <td className="py-2 px-4 border-b">
                            {product.emOferta && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Em oferta
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            <button
                              onClick={() => handleDeleteProduct(product.id, product.nome)}
                              className="text-red-600 hover:text-red-800"
                              title="Remover produto"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel; 
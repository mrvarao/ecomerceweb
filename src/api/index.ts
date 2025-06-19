const API_URL = 'http://localhost:3000/api';

// Categorias de produtos disponíveis
export const CATEGORIAS_PRODUTOS = [
  'Eletrônicos',
  'Smartphones',
  'Computadores',
  'Acessórios',
  'Roupas',
  'Calçados',
  'Casa e Decoração',
  'Esportes',
  'Jogos',
  'Outros'
];

export interface Product {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem?: string;
  emOferta: boolean;
  quantidade: number;
  categoria: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}

export const api = {
  auth: {
    /**
     * Login de usuário
     */
    login: async (credentials: LoginCredentials): Promise<{ name: string; isAdmin: boolean } | null> => {
      // Simulação de delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Credenciais de demo
      if (credentials.email === 'admin@example.com' && credentials.password === 'admin123') {
        const user = { name: 'Administrador', isAdmin: true };
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
      } else if (credentials.email === 'user@example.com' && credentials.password === 'user123') {
        const user = { name: 'Usuário', isAdmin: false };
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
      }
      
      return null;
    },
    
    /**
     * Logout de usuário
     */
    logout: () => {
      localStorage.removeItem('currentUser');
    },
    
    /**
     * Verifica se o usuário está autenticado
     */
    isAuthenticated: (): boolean => {
      return localStorage.getItem('currentUser') !== null;
    },
    
    /**
     * Verifica se o usuário é administrador
     */
    isAdmin: (): boolean => {
      const user = localStorage.getItem('currentUser');
      if (!user) return false;
      
      return JSON.parse(user).isAdmin === true;
    },
    
    /**
     * Obtém o nome do usuário atual
     */
    getCurrentUserName: (): string | null => {
      const user = localStorage.getItem('currentUser');
      if (!user) return null;
      
      return JSON.parse(user).name;
    }
  },
  
  admin: {
    /**
     * Lista todos os usuários (apenas para administradores)
     */
    getUsers: async (): Promise<User[]> => {
      try {
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
          throw new Error('Usuário não autenticado');
        }
        
        const response = await fetch(`${API_URL}/users`, {
          headers: {
            'x-user-id': userId
          }
        });
        
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        return [];
      }
    },
    
    /**
     * Registra um novo usuário (apenas para administradores)
     */
    registerUser: async (userData: RegisterUserData): Promise<User | null> => {
      try {
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
          throw new Error('Usuário não autenticado');
        }
        
        const response = await fetch(`${API_URL}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId
          },
          body: JSON.stringify(userData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        return null;
      }
    },
    
    /**
     * Remove um usuário (apenas para administradores)
     */
    deleteUser: async (id: string): Promise<boolean> => {
      try {
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
          throw new Error('Usuário não autenticado');
        }
        
        const response = await fetch(`${API_URL}/users/${id}`, {
          method: 'DELETE',
          headers: {
            'x-user-id': userId
          }
        });
        
        return response.ok;
      } catch (error) {
        console.error(`Erro ao deletar usuário ${id}:`, error);
        return false;
      }
    }
  },
  
  products: {
    /**
     * Busca todos os produtos do banco de dados
     */
    getAll: async (): Promise<Product[]> => {
      try {
        // Tentativa de buscar do servidor
        const response = await fetch(`${API_URL}/items`);
        
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Erro ao buscar produtos do servidor:', error);
        
        // Fallback para produtos locais em caso de falha
        const products = localStorage.getItem('products');
        return products ? JSON.parse(products) : [];
      }
    },
    
    /**
     * Busca um produto pelo ID
     */
    getById: async (id: string): Promise<Product | null> => {
      try {
        const response = await fetch(`${API_URL}/items/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Erro ao buscar produto ${id}:`, error);
        return null;
      }
    },
    
    /**
     * Cria um novo produto (apenas para administradores)
     */
    create: async (product: Omit<Product, 'id'>): Promise<Product> => {
      try {
        // Tenta criar no servidor se o usuário estiver autenticado
        if (api.auth.isAuthenticated() && api.auth.isAdmin()) {
          const userId = localStorage.getItem('userId');
          
          const response = await fetch(`${API_URL}/items`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': userId || ''
            },
            body: JSON.stringify(product),
          });
          
          if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
          }
          
          return await response.json();
        } else {
          throw new Error('Usuário não autenticado ou sem permissões de administrador');
        }
      } catch (error) {
        console.error('Erro ao criar produto no servidor, usando armazenamento local:', error);
        
        // Fallback para armazenamento local
        // Simulação de delay de rede
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Cria novo produto com ID único
        const newProduct = {
          ...product,
          id: Math.random().toString(36).substring(2, 15)
        };
        
        // Recupera produtos existentes
        const existingProducts = localStorage.getItem('products');
        const products = existingProducts ? JSON.parse(existingProducts) : [];
        
        // Adiciona novo produto e salva
        products.push(newProduct);
        localStorage.setItem('products', JSON.stringify(products));
        
        return newProduct;
      }
    },
    
    /**
     * Atualiza um produto existente (apenas para administradores)
     */
    update: async (id: string, product: Partial<Product>): Promise<Product | null> => {
      try {
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
          throw new Error('Usuário não autenticado');
        }
        
        const response = await fetch(`${API_URL}/items/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId
          },
          body: JSON.stringify(product),
        });
        
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Erro ao atualizar produto ${id}:`, error);
        return null;
      }
    },
    
    /**
     * Remove um produto (apenas para administradores)
     */
    delete: async (id: string): Promise<boolean> => {
      try {
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
          throw new Error('Usuário não autenticado');
        }
        
        const response = await fetch(`${API_URL}/items/${id}`, {
          method: 'DELETE',
          headers: {
            'x-user-id': userId
          }
        });
        
        return response.ok;
      } catch (error) {
        console.error(`Erro ao deletar produto ${id}:`, error);
        return false;
      }
    },
    
    /**
     * Atualiza o estoque de vários produtos após finalizar a compra
     */
    updateStock: async (items: { id: string, quantidade: number }[]): Promise<boolean> => {
      try {
        // Primeiro tenta atualizar no servidor
        try {
          const response = await fetch(`${API_URL}/items/update-stock`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ items })
          });
          
          if (response.ok) {
            // Se a atualização no servidor for bem-sucedida, também atualiza localmente
            const result = await response.json();
            console.log('Estoque atualizado com sucesso no servidor:', result);
            
            // Atualiza também localmente para manter a consistência
            const existingProducts = localStorage.getItem('products');
            if (existingProducts) {
              const products = JSON.parse(existingProducts);
              
              items.forEach(item => {
                const productIndex = products.findIndex((p: Product) => p.id === item.id);
                if (productIndex !== -1) {
                  const product = products[productIndex];
                  product.quantidade = Math.max(0, product.quantidade - item.quantidade);
                  products[productIndex] = product;
                }
              });
              
              localStorage.setItem('products', JSON.stringify(products));
            }
            
            return true;
          }
          // Se falhar no servidor, continua para atualização local
        } catch (err) {
          console.error('Erro ao atualizar estoque no servidor, tentando localmente:', err);
        }
        
        // Fallback: atualiza localmente se falhar no servidor
        const existingProducts = localStorage.getItem('products');
        if (!existingProducts) return false;
        
        const products = JSON.parse(existingProducts);
        let todosAtualizados = true;
        
        // Atualiza cada produto no localStorage
        items.forEach(item => {
          const productIndex = products.findIndex((p: Product) => p.id === item.id);
          
          if (productIndex === -1) {
            todosAtualizados = false;
            return;
          }
          
          // Atualiza a quantidade no produto
          const product = products[productIndex];
          product.quantidade = Math.max(0, product.quantidade - item.quantidade);
          products[productIndex] = product;
        });
        
        // Salva a lista atualizada
        localStorage.setItem('products', JSON.stringify(products));
        
        return todosAtualizados;
      } catch (error) {
        console.error('Erro ao atualizar estoque:', error);
        return false;
      }
    },
  },
}; 
# API do Projeto

Esta é uma API RESTful desenvolvida com Node.js, Express e Firebase.

## Instalação

1. Instale as dependências:

```
cd api
npm install
```

2. Crie um arquivo `.env` na raiz do diretório `api` com o seguinte conteúdo:

```
PORT=3000
```

## Configuração do Firebase

A API utiliza o Firebase Firestore como banco de dados. As credenciais já estão configuradas no arquivo `config/firebase.js`.

## Executando a API

Para iniciar o servidor em modo de desenvolvimento com recarga automática:

```
npm run dev
```

Para iniciar o servidor em modo de produção:

```
npm start
```

Por padrão, a API estará disponível em `http://localhost:3000`

## Populando o Banco de Dados

Para adicionar dados iniciais ao Firestore, execute:

```
node scripts/seedData.js
```

Este script verificará se já existem dados no banco e, caso não existam, adicionará alguns itens de exemplo.

## Rotas Disponíveis

- `GET /`: Verificação se a API está funcionando
- `GET /api/items`: Listar todos os itens
- `GET /api/items/:id`: Buscar um item específico
- `POST /api/items`: Criar um novo item
- `PUT /api/items/:id`: Atualizar um item existente
- `DELETE /api/items/:id`: Remover um item

## Integração com o Frontend

Para integrar com o frontend em React, use o axios ou fetch para fazer chamadas à API no endereço `http://localhost:3000`. 
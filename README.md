# Controle de Estoque

Este é um sistema de controle de estoque desenvolvido com uma arquitetura full-stack, composto por um backend em Node.js com TypeScript e Prisma, e um frontend em Next.js.

## Tecnologias Utilizadas

### Backend

- **Node.js** com **TypeScript**
- **Prisma** para ORM e migrações de banco de dados
- **Express.js** para o servidor
- **Docker** para containerização
- **Swagger** para documentação da API

### Frontend

- **Next.js** com **TypeScript**
- **React Query** para gerenciamento de estado e requisições
- **Tailwind CSS** para estilização
- **Shadcn/ui** para componentes UI
- **Docker** para containerização

## Estrutura do Projeto

```
/
├── backend/          # API do servidor
│   ├── src/
│   │   ├── controllers/    # Controladores da API
│   │   ├── connection/     # Conexão com banco de dados
│   │   └── generated/      # Código gerado pelo Prisma
│   ├── prisma/             # Esquema e migrações do banco
│   └── public/             # Documentação Swagger
├── frontend/         # Aplicação web
│   ├── src/
│   │   ├── app/            # Páginas Next.js
│   │   ├── components/     # Componentes React
│   │   ├── hooks/          # Hooks customizados
│   │   ├── lib/            # Utilitários
│   │   └── providers/      # Contextos React
│   └── public/             # Assets estáticos
└── README.md         # Este arquivo
```

## Instalação e Execução

### Pré-requisitos

- Docker e Docker Compose instalados
- Node.js (versão 18 ou superior) para desenvolvimento local

### Usando Docker (Recomendado)

1. Clone o repositório:

   ```bash
   git clone <url-do-repositorio>
   cd "Controle de estoque"
   ```

2. Execute o projeto completo:

   ```bash
   docker-compose up --build
   ```

   Isso iniciará tanto o backend quanto o frontend.

### Desenvolvimento Local

#### Backend

1. Navegue para a pasta backend:

   ```bash
   cd backend
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure o banco de dados (certifique-se de ter um banco mysql rodando):

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. Execute o servidor:
   ```bash
   npm run dev
   ```

#### Frontend

1. Navegue para a pasta frontend:

   ```bash
   cd frontend
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Funcionalidades

- **Autenticação de usuários**
- **Gerenciamento de usuários**
- **Controle de rotas e permissões**
- **Interface responsiva com dashboard**

## API

A documentação completa da API está disponível em `/backend/public/swagger.json` quando o servidor estiver rodando.

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT.

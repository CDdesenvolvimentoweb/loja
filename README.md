# Loja E-commerce Simplificada

Este projeto é um sistema de e-commerce simplificado para uma loja de roupas, com integração direta com WhatsApp para pedidos.

## Tecnologias Utilizadas

- **Backend**: Node.js com Express
- **ORM**: Prisma
- **Banco de Dados**: MySQL
- **Frontend**: HTML, CSS, JavaScript com React via CDN
- **Templating**: EJS

## Funcionalidades

### Painel de Administração
- Login seguro
- Dashboard com visão geral da loja
- Gestão de categorias
- Gestão completa de produtos (CRUD)
- Upload múltiplo de imagens
- Configurações da loja
- Visualização de pedidos

### Loja Virtual
- Página inicial com destaque para categorias e produtos
- Busca de produtos
- Visualização por categorias
- Página de detalhes do produto
- Carrinho de compras
- Finalização de pedido via WhatsApp

## Instalação

1. Clone o repositório:
```
git clone <url-do-repositorio>
cd loja
```

2. Instale as dependências:
```
npm install
```

3. Configure o arquivo `.env` com suas credenciais do banco de dados:
```
DATABASE_URL="mysql://<usuario>:<senha>@<host>:<porta>/loja_ecommerce"
JWT_SECRET="sua_chave_secreta_jwt"
PORT=3000
```

4. Crie o banco de dados:
```
mysql -u root -p -e "CREATE DATABASE loja_ecommerce;"
```

5. Execute as migrações do Prisma:
```
npx prisma migrate dev
```

6. Execute o script de seed para criar um usuário administrador inicial:
```
npm run seed
```

7. Inicie o servidor:
```
npm run dev
```

## Acessando o Sistema

- **Loja Virtual**: http://localhost:3000
- **Painel de Administração**: http://localhost:3000/auth/login

### Credenciais padrão do administrador:
- **Email**: admin@loja.com
- **Senha**: admin123

## Contribuição

Sinta-se à vontade para contribuir com este projeto. Crie um fork, faça suas alterações e envie um pull request.

## Licença

Este projeto está licenciado sob a licença MIT. 
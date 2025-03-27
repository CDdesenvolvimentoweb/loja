# Guia de Deploy - Loja Virtual

Este documento contém as instruções para deploy da aplicação de e-commerce em um servidor VPS, configurando o ambiente para produção.

## Requisitos do Servidor

- Ubuntu 20.04 LTS ou superior
- Node.js 16+ 
- MySQL 8+
- Nginx
- PM2

## 1. Preparação do Servidor

### Instalar as dependências principais

```bash
# Atualizar o sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js e npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node -v
npm -v

# Instalar MySQL
sudo apt install -y mysql-server

# Iniciar e habilitar MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Instalar Nginx
sudo apt install -y nginx

# Iniciar e habilitar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Instalar PM2 globalmente
sudo npm install -g pm2
```

### Configurar MySQL

```bash
# Executar o script de segurança do MySQL
sudo mysql_secure_installation

# Entrar no MySQL
sudo mysql

# Criar usuário e banco de dados (dentro do MySQL)
CREATE DATABASE loja_ecommerce;
CREATE USER 'loja_user'@'localhost' IDENTIFIED BY 'senha_forte_aqui';
GRANT ALL PRIVILEGES ON loja_ecommerce.* TO 'loja_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 2. Configurar o Código da Aplicação

### Transferir o código para o servidor

```bash
# Opção 1: Clonar de um repositório Git (se disponível)
git clone https://seu-repositorio.git /loja

# Opção 2: Transferir arquivos por SCP/SFTP
# Execute este comando da sua máquina local:
scp -r ./loja usuario@seu_servidor:/loja
```

### Configurar variáveis de ambiente

```bash
# Navegar até a pasta da aplicação
cd /loja

# Criar o arquivo .env
nano .env
```

Adicione as seguintes variáveis ao arquivo .env:

```
DATABASE_URL="mysql://loja_user:senha_forte_aqui@localhost:3306/loja_ecommerce"
PORT=3000
JWT_SECRET=seu_token_jwt_seguro_aqui
JWT_EXPIRES_IN=7d
```

### Instalar dependências e preparar o banco de dados

```bash
# Instalar dependências
npm install

# Gerar o Prisma Client
npx prisma generate

# Executar migrações
npx prisma migrate deploy

# Executar seed (dados iniciais)
npm run seed
```

## 3. Configuração do PM2

O PM2 é um gerenciador de processos para aplicações Node.js que permite manter a aplicação em execução mesmo após o fechamento do terminal ou reinicialização do servidor.

```bash
# Criar arquivo de configuração do PM2
nano ecosystem.config.js
```

Adicione o seguinte conteúdo:

```javascript
module.exports = {
  apps : [{
    name: "loja",
    script: "src/index.js",
    instances: "max",
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    },
    watch: false,
    max_memory_restart: "500M"
  }]
};
```

Agora, inicie a aplicação com o PM2:

```bash
# Iniciar a aplicação
pm2 start ecosystem.config.js

# Configurar o PM2 para iniciar com o sistema
pm2 startup
pm2 save
```

## 4. Configuração do Nginx

O Nginx será configurado como proxy reverso para a aplicação Node.js.

```bash
# Criar arquivo de configuração para o site
sudo nano /etc/nginx/sites-available/loja
```

Adicione o seguinte conteúdo:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Configuração para servir arquivos estáticos diretamente pelo Nginx
    location /images/ {
        alias /loja/public/images/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    location /css/ {
        alias /loja/public/css/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    location /js/ {
        alias /loja/public/js/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Limitar tamanho de upload (ajustar conforme necessidade)
    client_max_body_size 10M;
}
```

Ativar a configuração e reiniciar o Nginx:

```bash
# Criar link simbólico para habilitar o site
sudo ln -s /etc/nginx/sites-available/loja /etc/nginx/sites-enabled/

# Verificar se a configuração está correta
sudo nginx -t

# Reiniciar o Nginx para aplicar as alterações
sudo systemctl restart nginx
```

## 5. Configuração do Firewall

É recomendável configurar um firewall para proteger seu servidor:

```bash
# Permitir SSH
sudo ufw allow ssh

# Permitir HTTP e HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Ativar o firewall
sudo ufw enable

# Verificar status
sudo ufw status
```

## 6. Configuração de HTTPS (Opcional, mas recomendado)

Usando Certbot para obter certificados Let's Encrypt:

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Configurar renovação automática
sudo systemctl status certbot.timer
```

## 7. Backup e Manutenção

### Configurar backup do banco de dados

```bash
# Instalar ferramenta para automatizar backups
sudo apt install -y automysqlbackup

# Configurar
sudo nano /etc/default/automysqlbackup
# Ajuste as configurações conforme necessário

# Os backups serão salvos em /var/lib/automysqlbackup/
```

### Monitoramento com PM2

```bash
# Visualizar logs
pm2 logs loja

# Monitorar recursos
pm2 monit

# Reiniciar aplicação
pm2 restart loja

# Status da aplicação
pm2 status
```

## 8. Atualização da Aplicação

Quando precisar atualizar a aplicação:

```bash
# Navegar até a pasta da aplicação
cd /loja

# Puxar as atualizações (se estiver usando Git)
git pull

# Ou transferir os novos arquivos via SCP/SFTP

# Instalar dependências (se houver novas)
npm install

# Gerar o Prisma Client (se o schema foi alterado)
npx prisma generate

# Aplicar migrações (se houver novas)
npx prisma migrate deploy

# Reiniciar a aplicação
pm2 restart loja
```

## 9. Verificações Finais

- Teste o acesso ao site pelo domínio configurado
- Verifique se as imagens e arquivos estáticos estão sendo carregados corretamente
- Teste o painel administrativo (login e funcionalidades)
- Verifique se os e-mails estão sendo enviados corretamente (se aplicável)
- Monitore os logs por possíveis erros: `pm2 logs loja`

## Notas Importantes

- Sempre faça backup do banco de dados antes de grandes atualizações
- Mantenha o Node.js, pacotes npm e sistema operacional atualizados
- Monitore regularmente o uso de CPU, memória e espaço em disco
- Considere implementar monitoramento de integridade do servidor

## Dados de Acesso do Admin

- URL: http://seu-dominio.com/admin
- Email: admin@loja.com
- Senha: admin123

**Importante:** Altere a senha padrão do administrador após o primeiro acesso! 
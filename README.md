# Casa Branca - Sistema de Fila

Sistema para exibir o número de pessoas na fila do restaurante Casa Branca.

## Como usar

### Localmente
1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor:
   ```bash
   npm start
   ```

3. Acesse: http://localhost:3000

### Deploy no Railway

1. Faça login no Railway CLI:
   ```bash
   railway login
   ```

2. Inicie o projeto:
   ```bash
   railway init
   ```

3. Faça o deploy:
   ```bash
   railway up
   ```

## Funcionalidades

- ✅ Conta automaticamente as pessoas na fila do FastGet
- ✅ Atualiza a cada 30 segundos
- ✅ Design responsivo
- ✅ Cache para evitar muitas requisições
- ✅ Tratamento de erros
- ✅ Funciona online e offline

## Estrutura

- `server.js` - Servidor Express com Puppeteer
- `public/index.html` - Interface do usuário
- `package.json` - Dependências e scripts
- `Procfile` - Configuração para Railway
- `nixpacks.toml` - Configuração de build 
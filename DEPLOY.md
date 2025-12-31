# Deploy no Railway

## Backend (API + WebSocket)

### 1. Criar projeto no Railway

1. Acesse [railway.app](https://railway.app) e faça login
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Escolha o repositório do backend (chatNode)

### 2. Adicionar PostgreSQL

1. No projeto, clique em "+ New"
2. Selecione "Database" → "PostgreSQL"
3. O Railway vai criar o banco automaticamente

### 3. Configurar variáveis de ambiente

No painel do backend, vá em "Variables" e adicione:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=<gere um secret forte: openssl rand -base64 32>
JWT_EXPIRES_IN=7d
DATABASE_URL=${{Postgres.DATABASE_URL}}
CORS_ORIGIN=<URL do frontend que será gerada>
```

**Importante**: 
- `DATABASE_URL` será preenchida automaticamente pelo Railway
- `CORS_ORIGIN` você preenche depois que deployar o frontend

### 4. Deploy automático

1. O Railway detecta automaticamente o `railway.json`
2. Executa `npm run build` (gera Prisma Client + compila TS)
3. Executa `npm run prisma:deploy` (roda migrations) + `npm start`
4. Anote a URL gerada (ex: `https://chatnode-production.up.railway.app`)

### 5. Criar usuários de teste (opcional)

Depois do primeiro deploy, você pode rodar o seed:

```bash
# Localmente, apontando para o banco do Railway
DATABASE_URL=<url-do-railway> npm run db:seed
```

---

## Frontend (React + Vite)

### 1. Atualizar variáveis de ambiente

No frontend, crie `.env.production`:

```
VITE_API_URL=<URL do backend do Railway>
```

### 2. Deploy no Railway

1. No mesmo projeto, clique em "+ New"
2. Selecione "GitHub repo" → escolha o repositório do frontend
3. Railway detecta Vite automaticamente

### 3. Configurar build

O Railway vai rodar:
```bash
npm install
npm run build
npm run preview
```

### 4. Atualizar CORS no backend

1. Copie a URL do frontend (ex: `https://chatnode-frontend.up.railway.app`)
2. Volte no backend → Variables
3. Atualize `CORS_ORIGIN` com a URL do frontend

---

## Verificação

✅ Backend rodando: `https://seu-backend.railway.app/health`  
✅ Frontend abre sem erros  
✅ Login funciona  
✅ WebSocket conecta (mensagens em tempo real)  

---

## Troubleshooting

### Erro de CORS
- Verifique se `CORS_ORIGIN` no backend tem a URL correta do frontend

### Erro de database
- Verifique se `DATABASE_URL` está configurada
- Rode migrations: Railway → Backend → Deploy logs

### Build falha
- Verifique os logs de build no Railway
- Certifique-se que `package.json` está correto

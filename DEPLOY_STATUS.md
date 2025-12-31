# Status do Deploy - ChatNode
**Data**: 31/12/2024
**Sessão interrompida em**: Configuração de CORS e Node.js

---

## 🎯 Objetivo
Deploy completo da aplicação ChatNode (backend + frontend) no Railway

---

## ✅ O que JÁ ESTÁ FUNCIONANDO

### Backend
- ✅ Código no GitHub: `github.com/hugopagnoca/chatnode-backend`
- ✅ Deploy no Railway configurado
- ✅ PostgreSQL conectado (Railway)
- ✅ Migrations rodando corretamente
- ✅ Build TypeScript funcionando
- ✅ Path aliases (@/) resolvidos com tsc-alias
- ✅ Prisma Client gerando corretamente
- ✅ URL pública: `https://chatnode-backend-production.up.railway.app`

### Frontend
- ✅ Código no GitHub: `github.com/hugopagnoca/chatnode-frontend`
- ✅ Deploy no Railway configurado
- ✅ Build TypeScript funcionando
- ✅ Variáveis de ambiente configuradas (.env.production)
- ✅ URL pública: `https://chatnode-frontend-production.up.railway.app`

### Configurações
- ✅ Variáveis de ambiente do backend no Railway:
  - `NODE_ENV=production`
  - `PORT=3000`
  - `JWT_SECRET=<configurado>`
  - `JWT_EXPIRES_IN=7d`
  - `DATABASE_URL=<Railway PostgreSQL>`
  - `CORS_ORIGIN=https://chatnode-frontend-production.up.railway.app`

---

## ❌ PROBLEMAS ATUAIS (onde paramos)

### 1. Frontend - Versão do Node.js
**Problema**: Railway está usando Node.js 18.20.5, mas Vite requer 20.19+ ou 22.12+

**Erro**:
```
You are using Node.js 18.20.5. Vite requires Node.js version 20.19+ or 22.12+.
Please upgrade your Node.js version.
```

**Status**: Criamos `.nvmrc` com "20" mas Railway não está respeitando

**Solução para amanhã**:
- Adicionar `NODE_VERSION=20` nas variáveis de ambiente do Railway (frontend)
- OU configurar no `railway.json` do frontend

### 2. Backend - Deploy não está atualizando
**Problema**: Últimos commits (com logs de debug) não aparecem nos logs do Railway

**Logs atuais mostram**:
```
[dotenv@17.2.3] injecting env (0) from .env
[ENV] CORS_ORIGIN: https://chatnode-frontend-production.up.railway.app
```

**Logs esperados** (após último commit):
```
[ENV] Loading environment variables...
[ENV] NODE_ENV: production
[ENV] PORT: 8080
[ENV] JWT_SECRET: ***SET***
[ENV] DATABASE_URL: ***SET***
[ENV] CORS_ORIGIN: https://chatnode-frontend-production.up.railway.app
```

**Possíveis causas**:
- Railway pode estar mostrando logs de deploy antigo
- Deploy novo pode ter falhado silenciosamente

**Verificar amanhã**:
- Ir em Deployments e confirmar qual commit foi deployado
- Forçar novo deploy se necessário

### 3. CORS ainda bloqueando requests
**Problema**: Frontend não consegue fazer requisições para backend

**Erro no browser**:
```
Access to fetch at 'https://chatnode-backend-production.up.railway.app/api/auth/login'
from origin 'https://chatnode-frontend-production.up.railway.app'
has been blocked by CORS policy: Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**O que já fizemos**:
- ✅ Configuramos `CORS_ORIGIN` corretamente
- ✅ Substituímos CORS manual por middleware `cors`
- ❌ Mas ainda está bloqueando

**Possível causa**: Backend pode estar crashando antes de processar requests (por isso não responde nem ao health check)

### 4. Backend não responde ao health check
**URL testada**: `https://chatnode-backend-production.up.railway.app/api/health`

**Erro**: "Application failed to respond"

**Isso indica**: Backend está crashando logo após iniciar

---

## 🔧 ÚLTIMAS MUDANÇAS FEITAS (Commits Recentes)

### Backend
1. `e6c4174` - Add debug logs for environment variables
2. `4923bdf` - Use cors middleware for better CORS handling
3. `381da1c` - Add CORS_ORIGIN debug log for production
4. `da478b3` - Fix Prisma Client: use default location instead of custom output
5. `9015527` - Update package-lock.json with tsc-alias dependencies

### Frontend
1. `560d15f` - Specify Node.js 20 for Railway (.nvmrc)
2. `64e021b` - Add Railway domain to allowedHosts
3. `26a173f` - Configure Vite preview host for Railway
4. `1f01ae1` - Fix vite preview to accept external connections
5. `1ad86bf` - Fix useRef initialization error

---

## 📋 PRÓXIMOS PASSOS (Para Continuar Amanhã)

### Passo 1: Corrigir Node.js do Frontend
1. No Railway, no serviço do **frontend**
2. Ir em **Variables**
3. Adicionar: `NODE_VERSION=20`
4. Salvar e aguardar redeploy

**OU**

Editar `railway.json` do frontend localmente:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run preview",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  },
  "nixpacks": {
    "plan": {
      "phases": {
        "setup": {
          "nixPkgs": ["nodejs-20_x"]
        }
      }
    }
  }
}
```

### Passo 2: Verificar Deploy do Backend
1. Railway → Backend → **Deployments**
2. Verificar se último deploy é commit `e6c4174`
3. Se não for, clicar em **Redeploy** manualmente
4. Aguardar deploy terminar
5. Verificar logs para ver se aparecem os debug logs:
   ```
   [ENV] Loading environment variables...
   [ENV] NODE_ENV: production
   [ENV] PORT: 8080
   [ENV] JWT_SECRET: ***SET***
   ```

### Passo 3: Testar Health Check
Quando backend estiver rodando:
- Abrir: `https://chatnode-backend-production.up.railway.app/api/health`
- Deve retornar: `{"status":"ok","timestamp":"..."}`
- Se der "Application failed to respond", verificar logs de erro

### Passo 4: Testar CORS
Se health check funcionar:
1. Abrir: `https://chatnode-frontend-production.up.railway.app`
2. Tentar fazer login (qualquer email/senha)
3. Abrir DevTools → Network
4. Verificar se request para `/api/auth/login` retorna resposta (mesmo que 401)
5. Se der CORS error, verificar response headers

### Passo 5: Criar Usuários de Teste
Quando CORS funcionar:

**Opção A - Localmente apontando para produção:**
```bash
cd C:\Repos\chatNode
DATABASE_URL=postgresql://postgres:tIXeriDHYVLoAezqHTYVeUDqHXUdGMEh@shinkansen.proxy.rlwy.net:26018/railway npm run db:seed
```

**Opção B - Via script no Railway:**
- Criar job temporário ou usar Railway shell para rodar `npm run db:seed`

Isso cria:
- alice@mail.com / password123
- bob@mail.com / password123
- Sala "General"

### Passo 6: Testar Aplicação Completa
1. Acessar: `https://chatnode-frontend-production.up.railway.app`
2. Fazer login com: alice@mail.com / password123
3. Verificar se carrega salas
4. Enviar mensagem na sala General
5. Abrir em outra aba/navegador incógnito
6. Login com bob@mail.com / password123
7. Verificar se mensagem aparece em tempo real (WebSocket)

---

## 🔑 INFORMAÇÕES IMPORTANTES

### URLs
- **Frontend**: https://chatnode-frontend-production.up.railway.app
- **Backend**: https://chatnode-backend-production.up.railway.app
- **Health Check**: https://chatnode-backend-production.up.railway.app/api/health

### Repositórios GitHub
- **Backend**: https://github.com/hugopagnoca/chatnode-backend
- **Frontend**: https://github.com/hugopagnoca/chatnode-frontend

### Credenciais Produção
- **Usuários de teste** (após seed):
  - alice@mail.com / password123
  - bob@mail.com / password123

### Railway
- **Projeto**: Mesmo projeto com 3 serviços:
  1. PostgreSQL (banco)
  2. chatnode-backend (API)
  3. chatnode-frontend (React)

### Banco de Dados
```
Host: shinkansen.proxy.rlwy.net
Port: 26018
Database: railway
User: postgres
Password: tIXeriDHYVLoAezqHTYVeUDqHXUdGMEh
```

**Connection String**:
```
postgresql://postgres:tIXeriDHYVLoAezqHTYVeUDqHXUdGMEh@shinkansen.proxy.rlwy.net:26018/railway
```

---

## 🐛 DEBUG - Como Investigar Problemas

### Backend crashando
1. Railway → Backend → Deployments → Último deploy → Logs
2. Procurar por:
   - `Error:` ou `error` (em vermelho)
   - Mensagens de exception
   - Stack traces
3. Se não aparecer nada, adicionar mais `console.log` nos arquivos principais

### CORS não funcionando
1. DevTools → Network → Selecionar request bloqueado
2. Verificar headers da response:
   - Procurar `Access-Control-Allow-Origin`
   - Verificar se valor é exatamente a URL do frontend
3. Se não tiver header, backend não está processando request

### Frontend não carrega
1. DevTools → Console
2. Procurar erros JavaScript
3. Network → Ver se requests para backend estão sendo feitas
4. Verificar se variáveis `VITE_API_URL` e `VITE_SOCKET_URL` estão corretas

---

## 📝 COMANDOS ÚTEIS

### Local Development
```bash
# Backend
cd C:\Repos\chatNode
npm run dev

# Frontend
cd C:\Repos\chatnode-frontend
npm run dev
```

### Build & Deploy
```bash
# Fazer mudança → commit → push
git add .
git commit -m "descrição"
git push
# Railway detecta automaticamente e faz redeploy
```

### Database
```bash
# Rodar migrations
npm run prisma:deploy

# Criar usuários teste
npm run db:seed

# Abrir Prisma Studio (local)
npm run prisma:studio
```

---

## 💡 DICAS PARA AMANHÃ

1. **Sempre verificar os logs primeiro** - Railway → Deployments → Ver logs completos
2. **Health check é o básico** - Se não responder, backend tem problema
3. **DevTools é seu amigo** - Console + Network tab mostram tudo
4. **Um problema de cada vez** - Resolver Node.js → Backend → CORS → Seed
5. **Railway demora 2-3min** para deploy - Não testar antes de terminar

---

## ✨ OBJETIVO FINAL

Aplicação ChatNode 100% funcional em produção:
- ✅ Login/Registro funcionando
- ✅ Criar salas
- ✅ Enviar mensagens
- ✅ Mensagens em tempo real (WebSocket)
- ✅ Direct Messages entre usuários
- ✅ Tudo acessível publicamente via Railway

**Estamos quase lá!** 🚀

---

**Última atualização**: 31/12/2024 às 03:30 (horário que paramos)
**Próxima sessão**: Continuar do Passo 1 (Node.js do Frontend)

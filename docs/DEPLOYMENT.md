# 🚀 Guia de Deploy e Configuração do Ambiente de Produção (AWS + HTTPS + Docker)

Este documento descreve a arquitetura, o fluxo de rede, os procedimentos de configuração e os comandos operacionais para implantar e manter o **Risking!** em produção na **AWS (Amazon EC2)** com domínio próprio (**Hostinger**) e certificado **SSL (HTTPS/WSS Let's Encrypt)**.

---

## 🏛️ 1. Visão Geral da Arquitetura em Produção

```
[ Usuário / Navegador ]
         │
         │  (HTTPS porta 443 / WSS)
         ▼
[ Hostinger DNS ] (Registros A -> IP Elástico AWS)
         │
         ▼
[ AWS EC2 - Nginx Reverse Proxy (risking-proxy) ]
         ├── SSL Termination (/etc/letsencrypt)
         │
         ├── location / ──────────────► [ risking-frontend (Next.js :3000) ]
         │
         └── location /socket.io/ ────► [ risking-backend (NestJS :3001) ]
                                                  │
                                                  ▼
                                       [ risking-db (PostgreSQL :5432) ]
```

---

## 📋 2. Pré-requisitos na Nuvem

1. **Instância AWS EC2**:
   - Tipo sugerido: `t4g.small` (ARM/Graviton) ou `t3.small` / `t2.micro` (Ubuntu 24.04 LTS).
   - Armazenamento: Mínimo 20 GB GP3.
2. **IP Elástico (Elastic IP)**:
   - Alocado no console da AWS e associado à instância EC2 (evita alteração de IP ao reiniciar).
3. **Security Group (Firewall AWS)**:
   - `22 (SSH)`: Restrito ao seu IP.
   - `80 (HTTP)`: Liberado para `0.0.0.0/0`.
   - `443 (HTTPS)`: Liberado para `0.0.0.0/0`.
4. **Domínio na Hostinger (ex: `risking.online`)**:
   - **Registros DNS tipo A**:
     - `@` apontando para o IP Elástico da EC2 (TTL: 14400 ou padrão).
     - `www` apontando para o IP Elástico da EC2 (TTL: 14400 ou padrão).
   - **Importante**: Não utilizar a ferramenta de "Redirecionamento 301" da Hostinger (apenas os registros DNS A).

---

## 🔐 3. Certificados SSL (Let's Encrypt / Certbot)

Para gerar o certificado gratuito na máquina EC2:

```bash
# 1. Instalar o Certbot no host Ubuntu
sudo apt update && sudo apt install -y certbot

# 2. Parar temporariamente qualquer processo na porta 80
docker compose -f docker-compose.prod.yml down

# 3. Gerar o certificado standalone para o domínio
sudo certbot certonly --standalone -d risking.online -d www.risking.online
```

Os certificados serão salvos em `/etc/letsencrypt/live/risking.online/` e montados como volume somente leitura (`:ro`) dentro do container do Nginx.

### 🔄 Renovação Automática (Crontab)
Configure a renovação automática no cron do servidor:
```bash
sudo crontab -e
```
Adicione a linha:
```cron
0 3 * * 1 certbot renew --quiet && docker restart risking-proxy
```

---

## ⚙️ 4. Variáveis de Ambiente (`.env`)

Crie o arquivo `.env` na raiz do projeto no servidor:

```env
# Banco de Dados PostgreSQL
POSTGRES_USER=risking_prod
POSTGRES_PASSWORD=DefinaSuaSenhaSeguraAqui123!
POSTGRES_DB=risking_db
DB_HOST=db
DB_PORT=5432

# URL Pública de Produção (HTTPS)
NEXT_PUBLIC_BACKEND_URL=https://risking.online
```

---

## 🐳 5. Configuração dos Containers Docker

### 1. `docker-compose.prod.yml`
Gerencia os 4 serviços da aplicação em uma rede isolada:
- **`db`**: PostgreSQL 15 com persistência no volume nomeado `risking_pgdata`.
- **`backend`**: Aplicação NestJS na porta interna `3001`.
- **`frontend`**: Aplicação Next.js 16 Standalone na porta interna `3000`.
- **`nginx`**: Proxy reverso expondo as portas públicas `80` (HTTP com redirect 301) e `443` (HTTPS/WSS).

### 2. `nginx.conf`
Responsável pelo roteamento de tráfego, terminação SSL e upgrade do protocolo WebSocket:
- `/` $\rightarrow$ Encaminha para `http://frontend:3000`.
- `/socket.io/` $\rightarrow$ Encaminha para `http://backend:3001` com cabeçalhos `Upgrade` e `Connection $connection_upgrade`.

---

## 🚀 6. Comandos Operacionais

### Subir a Aplicação em Produção
```bash
# Build e inicialização em segundo plano
docker compose -f docker-compose.prod.yml up -d --build
```

### Reconstruir o Frontend após Atualizações (sem cache de build)
```bash
docker compose -f docker-compose.prod.yml build --no-cache frontend
docker compose -f docker-compose.prod.yml up -d
```

### Verificar o Status dos Containers
```bash
docker compose -f docker-compose.prod.yml ps
```

### Monitorar Logs em Tempo Real
```bash
# Todos os logs
docker compose -f docker-compose.prod.yml logs -f

# Logs específicos do backend ou frontend
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f nginx
```

### Parar a Aplicação
```bash
docker compose -f docker-compose.prod.yml down
```
*(Nota: Nunca utilize `down -v` em produção para não apagar o volume de dados do PostgreSQL).*

---

## 🛡️ 7. Prevenção de Problemas Conhecidos

1. **Erro `(bloqueado: mixed-content)`**:
   - **Causa**: Ocorre quando a página carrega em `https://` mas o cliente tenta se conectar via `http://` no Socket.IO.
   - **Solução**: O `GameContext.tsx` resolve a conexão usando `window.location.origin` em produção, conectando diretamente na mesma origem segura (`wss://`).
2. **Cache de Build no Next.js**:
   - Variáveis `NEXT_PUBLIC_*` são fixadas no build. Sempre utilize `docker compose build --no-cache frontend` ao alterar URLs públicas.
3. **Persistência do Banco de Dados**:
   - Os dados do PostgreSQL estão salvos no volume Docker `risking_pgdata` mapeado em `/var/lib/postgresql/data`.

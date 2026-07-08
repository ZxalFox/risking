# Risking! - O Jogo (Versão Digital)

Risking é um jogo de baralho educativo focado em ensinar conceitos de gerenciamento de riscos em projetos de software, agora adaptado para uma plataforma digital multijogador em tempo real.

O projeto foi reestruturado para uma arquitetura Monorepo, separando a aplicação em **Frontend** (Next.js) e **Backend** (NestJS).

## Como Inicializar o Projeto Localmente

O projeto agora conta com uma infraestrutura Dockerizada e persiste dados via PostgreSQL.

### 1. Pré-requisitos
Certifique-se de ter o **Docker Desktop** (ou Docker Engine + Compose v2), **Node.js** (v18+) e **Yarn** instalados em sua máquina.

### 2. Configuração Inicial do Ambiente

Para baixar todas as dependências do monorepo e subir apenas o banco de dados em plano de fundo, utilize nosso script de setup:

```bash
./scripts/risk-setup.sh
```

### 3. Rodando o Projeto para Desenvolvimento

Para rodar o ambiente de desenvolvimento local (Next.js e NestJS em modo *watch*), com o banco de dados do Docker ativo em background, basta usar:

```bash
yarn dev
```

- O **Frontend** estará disponível em: [http://localhost:3000](http://localhost:3000)
- O **Backend** estará rodando em: `http://localhost:3001`

### Alternativa: Rodando a Aplicação Inteira via Docker

Caso você queira rodar os containers completos (Frontend e Backend emulando o ambiente de produção), utilize:

```bash
./scripts/risk-start.sh
```

## Documentação

Mais informações sobre as especificações do jogo, o design, o plano e as diretrizes dos agentes podem ser encontradas na pasta `/agents`.

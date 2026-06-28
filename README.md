# Risking! - O Jogo (Versão Digital)

Risking é um jogo de baralho educativo focado em ensinar conceitos de gerenciamento de riscos em projetos de software, agora adaptado para uma plataforma digital multijogador em tempo real.

O projeto foi reestruturado para uma arquitetura Monorepo, separando a aplicação em **Frontend** (Next.js) e **Backend** (NestJS).

## Como Inicializar o Projeto Localmente

Siga o passo a passo abaixo para instalar as dependências e rodar ambos os serviços (frontend e backend) simultaneamente.

### 1. Pré-requisitos
Certifique-se de ter o **Node.js** (v18+) e o gerenciador de pacotes **Yarn** instalados em sua máquina.

### 2. Instalação das Dependências

Acesse a raiz do projeto e execute o comando abaixo. Ele instalará o `concurrently` na raiz e rodará a instalação dentro das pastas `frontend` e `backend` automaticamente:

```bash
yarn install:all
```

*(Alternativamente, você pode rodar `yarn install` separadamente nas pastas `/frontend` e `/backend`)*.

### 3. Rodando o Projeto

Para inicializar tanto o servidor frontend (Next.js) quanto o servidor backend (NestJS com WebSockets) ao mesmo tempo, execute na raiz do projeto:

```bash
yarn dev
```

- O **Frontend** estará disponível em: [http://localhost:3000](http://localhost:3000)
- O **Backend** estará rodando em: `http://localhost:3001`

Acesse o endereço do frontend no seu navegador e divirta-se criando salas e convidando amigos para jogar!

## Comandos Extras

Caso deseje rodar os projetos de forma independente:

- **Frontend:** `cd frontend && yarn dev`
- **Backend:** `cd backend && yarn start:dev`

## Documentação

Mais informações sobre as especificações do jogo, o design, o plano e as diretrizes dos agentes podem ser encontradas na pasta `/agents`.

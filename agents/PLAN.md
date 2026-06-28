# PLAN.md 

Este documento tem como objetivo:
 - Descrever o plano de desenvolvimento do projeto
 - Descrever o cronograma de desenvolvimento do projeto
 - Auxiliar os Agentes e I.A's integradas a realizarem alterações assertivas

Este documento é um complemento a outros documentos que definem a aplicação, para uma visão geral do projeto, ele está integrado aos outros documentos:
 - RULES.md - Define as regras do projeto, processos e padrões de codificação
 - DESIGN.md - Define os padrões de design do projeto
 - AGENTS.md - Contexto, diretrizes e definições gerais do projeto


## Plano de desenvolvimento  

### 1. Estruturação da arquitetura

Essa etapa do projeto será reservada à definir sua arquitetura, o objetivo é fazer um bom planejamento prévio à implementação afim de evitar retrabalhos e reduzir custos de alterações.

Nessa primeira etapa deverão ser definidos aspectos como a conexão entres os serviços, sua conteinirização e sua infraestrutura de funcionamento, o projeto incluirá caraterísticas como:

    - Conteinerização com Docker Compose
    - Utilização de websockets para conexão de diferentes usuários em uma única sessão
    - Internacionalização com utilização de next-intl
    - Gerenciomento de sessões online
    - Projeto monolítico mas com dois subprojetos de frontend e backend
    - Banco de dados em postgree SQL
    

A ideia aqui é focar em estabelecer os alicerces do projeto, então deverão ser realizadas tarefas como:

#### 1.1 Organização dos diretórios e ambiente do projeto

Estabeleça a organização dos diretório do projeto, a estrutura macro planejada é a seguinte:
    
    #raiz
    + agents -> arquivos de diretrizes, planejamento e regras do projeto, auxiliáres para agentes de I.A
    + frontend -> projeto NEXT.JS
    + backend -> projeto NEST.JS
    + bd -> arquivos de configurações relacionadas ao banco de dados
    + scripts -> scripts auxiliáres para execução, manutenção e verificações de integridade do projeto
    + docker-compose.yml -> ira realizar a orquestração de contâiners docker do projeto
    + CHANGELOG.md -> arquivo de versionamento do projeto
    + README.md -> arquivo de instruções do projeto

#### 1.2 Contêinerização

Os projetos frontend e backend deverão possuir seus respectivos dockerfile com a configuração de seus ambientes e instalação de dependencias,

O banco de dados deverá ser definido diretamente no docker-compose.yml mas sus configurações poderão ser escritas dentro da pasta bd

E importante que sejam garatindas conexões estáveis e seguras entre backend, frontend e bd

#### 1.3 Criação dos scripts auxiliáres

Escrever scripts que auxiliam em diversas operações, os scripts devem ser facilmentes executados através de comandos simples, seguem as sugestões:

    - check-integrity: verifica as questões de integridade do projeto como acessibilidade, SEO, lint e tipagem
    - risk-setup: realiza todo o processo de construção do projeto, baixa as imagens docker, cria os containers, cria o banco de dados e instala as dependencias do projeto
    - risk-start: inicia os serviços do projeto como servidores, bd e frontend

#### 1.4 Esquematização do banco de dados

O banco de dados deve suportar armazenar dados de sessões online e de seus jogadores, ele deverá também armazenar os dados das cartas e regras do jogo e também deverá possibilitar guardar as configurações e preferencias do usuário, como suas escolhas de acessibilidade e opções de jogo

O banco de dados não deverá se preocupar com estruturas de autenticação, os acessos serão simplificados para que qualquer jogador consiga utilizar sem dificuldade e com passo simplificados de identificação, informando apenas um nickname por exemplo

### 2. Configuração e implementação do Backend

Adicione todas as configurações necessárias ao backend para que a aplicação possa funcionar da maneira mais eficiente possível, utilizando poucos recursos e técnicas simples de implementação que entreguem as funcionalidades essenciais

### 3. Configuração e implementação do Frontend

Configure o frontend com as bibliotecas e recursos necessários, se atente as regras de design e visual consistente, utilize o que for preciso para trazer responsividade e acessibilidade, a interface deve rodar de forma fluida em diferentes dispositivos

### 4. Pipeline de verificação e Build

Utilize de scripts de automação para possibilitar etapas de pós-implementação, como verificação de integridade do projeto, consistencia de padrões de código, build, lint dentre outros.






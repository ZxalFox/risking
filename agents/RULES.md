# RULES.md

Este documento tem como objetivo:

- Definir as regras do projeto
- Definir os processos do projeto
- Definir os padrões de codificação do projeto
- Auxiliar os Agentes e I.A's integradas a realizarem alterações assertivas

Este documento é um complemento a outros documentos que definem a aplicação, para uma visão geral do projeto, ele está integrado aos outros documentos:

- PLAN.md - Plano e cronograma de etapas do projeto
- DESIGN.md - Define os padrões de design do projeto
- AGENTS.md - Contexto, diretrizes e definições gerais do projeto

## 1. Regras do projeto

### 1.1 Regras de Sintaxe

Os projetos deverão seguir a respectiva sintaxe e indentação recomendadas de suas linguagens

Deverá ser preferida a utilização de kebab-case sempre que possível

- Para React/Next.js, componentes e arquivos de componente devem usar PascalCase
- Hooks customizados devem iniciar com use\*
- Tipos e interfaces devem usar PascalCase, com sufixo claro quando necessário (ex.: *Props, *State)

### 1.2 Regras de versionamento

Todos os push para a branch main deverão ser versionados no arquivo CHANGELOG.md utilizando o versionamento semântico, caso a alteração a forma de se executar ou utilizar o projeto, suas descrições deverão ser também adicionadas ao arquivo README.md

Deverá ser realizada a checagem de integridade antes de push's para main com o script check-integrity

### 1.3 Regras de estilização

A estilização deverá se feita utilizando as diretivas de design em DESIGN.md

### 1.4 Regras de organização de arquivos

- Componentes reutilizáveis devem ficar em src/components
- Configurações de internacionalização devem ficar em src/i18n
- Assets estáticos devem ficar em public

### 1.5 Regras de internacionalização (i18n)

- Toda string exibida ao usuário deve estar nos arquivos de messages
- Chaves de tradução devem ser descritivas e consistentes entre idiomas
- Não é permitido fallback silencioso para textos fixos em português

### 1.6 Regras de qualidade

- Alterações que impactam UI devem ser verificadas em mobile e desktop
- Lint e typecheck devem passar antes de abrir PR

### 1.7 Regras de segurança e privacidade

- Não armazenar dados sensíveis no cliente
- Validar entradas do usuário no backend e no frontend quando possível
- Logs não devem expor dados pessoais

### 1.8 Regras de branches e commits

- Preferir branches curtas e focadas por funcionalidade




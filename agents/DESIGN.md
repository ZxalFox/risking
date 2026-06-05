# DESIGN.md

Este documento tem como objetivo:

- Descrever os padrões de design do projeto
- Auxiliar os Agentes e I.A's integradas a realizarem alterações assertivas

Este documento é um complemento a outros documentos que definem a aplicação, para uma visão geral do projeto, ele está integrado aos outros documentos:

- PLAN.md - Plano e cronograma de etapas do projeto
- RULES.md - Define as regras do projeto, processos e padrões de codificação
- AGENTS.md - Contexto, diretrizes e definições gerais do projeto

## 1. Padrões de design

### Premissas de Design

O design do projeto deve priorizar acessibilidade e conforto visual acima de tudo, devem ser utilizadas heurísticas de acessibilidade como WCAG e o projeto deverá possuir avaliações positivas em ferramentas de análise

### Estilização

- A estilização deve ser feita utilizando TailwindCSS, e as configurações de padrões devem ser definidas no arquivo de configuração do TailwindCSS

#### Cores

As cores primárias estarão relacionadas aos riscos, enquanto as secundárias estarão relacionadas às mitigações

- Cor primária: #cd5400
- Cor secundária: #3d8066
- Cor primária-clara: #ffb3a1
- Cor secundária-clara: #9ef9d4
- Cor primária-escura: #602300
- Cor secundária-escura: #295a47

#### Biblioteca de componentes

O objetivo é utilizar a biblioteca chadcn/ui como principal biblioteca de componentes, contudo o design deve ser o mais acessível possível

#### Análise de métricas e SEO

A biblioteca unlighthouse deve ser utilizada para avaliar as métricas da aplicação

#### Tipografia

- Priorizar legibilidade em textos longos e instruções
- Usar hierarquia clara entre títulos, subtítulos e corpo
- Evitar tamanhos de fonte abaixo de 14px para textos informativos

#### Layout e espaçamento

- Usar grades simples e consistentes
- Manter espaçamento vertical previsível entre seções
- Evitar excesso de elementos por tela; priorizar foco na ação principal

#### Componentes e estados

- Todo componente interativo deve ter estados de hover, focus e disabled
- Estados de erro e sucesso devem ser claramente distinguíveis por cor e texto
- Campos obrigatórios devem indicar obrigação antes da interação

#### Acessibilidade visual

- Garantir contraste adequado para texto e elementos críticos
- Evitar comunicação apenas por cor; usar ícones e texto de apoio
- Respeitar preferências de movimento reduzido quando houver animações

#### Responsividade

- Layout deve funcionar bem em telas pequenas e grandes
- Priorizar botões e áreas clicáveis confortáveis no mobile
- Evitar tabelas extensas em telas pequenas sem adaptação

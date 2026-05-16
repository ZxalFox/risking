# Risking! - O Jogo

Este documento tem como objetivo:
 - Descrever as caraterísticas do projeto
 - Definir os padrões de projeto
 - Definir os guias de codificação
 - Definir natureza da aplicação
 - Auxiliar os Agentes e I.A's integradas a realizarem alterações assertivas

## 1. Definição do Jogo Risking!
Risking! é um jogo de baralho baseado em uma dinâmica de ataque (o surgimento de riscos em projetos de desenvolvimento de software) e defesa (o uso de mitigações adequadas para estes riscos) para abordar os imprevistos que podem ocorrer em um projeto de desenvolvimento de software.

O objetivo do jogo é ensinar aos jogadores conceitos de gerenciamento de riscos, apresentar as categorias de riscos, riscos existentes dentro destas categorias e as mitigações que podem ser usadas para diminuir o impacto negativo dos riscos nos projetos. Com isso, o jogo permite fazer o relacionamento existente entre categorias de riscos e riscos, assim como riscos e mitigações.

Consequentemente, espera-se que os participantes adquiram conhecimentos sobre gerenciamento de riscos, permitindo que entendam o impacto que os riscos podem ocasionar nos projetos de software e a importância de realizar planos de gerenciamento de riscos. 

Durante o jogo, os participantes podem usar seus conhecimentos prévios adquiridos durante as aulas de Engenharia de Software juntamente com os elementos do jogo para evitar que
riscos aconteçam em seu projeto. 

Diante do exposto, os objetivos de aprendizagem do jogo são: 

 - Conhecimento e compreensão (listar e interpretar os diferentes riscos, assim como suas mitigações)

 - Análise (relacionar os riscos com suas possíveis mitigações).
 
Estes objetivos podem ser alcançados a partir da repetição e da tentativa de relacionar os riscos com suas respectivas mitigações, avaliando se uma mitigação minimiza um risco.

## Tabela 1: Categorias de riscos, com excemplos de riscos e suas respectivas mitigações identificadas

| Categoria                | Risco                                                                | Mitigações                                                                                                                                                 |
|--------------------------|----------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1. Tarefa                | 1. Indisponibilidade de documentos de requisitos para testes         | 1. Ter um representante da equipe no local do cliente.  2. Envolva a equipe de testes no projeto desde o início.                                           |
| 2. Estrutura             | 1. Horários e cronogramas irreais                                    | 1. Estimativa detalhada de custo e cronograma de várias fontes.  2. Projetar de acordo com o custo.  3. Adotar desenvolvimento Incremental.                |
| 3. Ator                  | 1. Riscos ocasionados pelas deficiências da equipe                   | 1. Equipe trabalhando por correspondência de trabalho.  2. Fazer treinamentos cruzado.  3. Elaborar um pré-cronograma adequado.                            |
| 4. Tecnologia            | 1. Deficiências em componentes fornecidos por agentes externos       | 1. Elaborar avaliação comparativa.  2. Realizar inspeções.  3. Fazer análise de Compatibilidade.                                                           |
| 5. Tarefa-Ator           | 1. Atores inadequados desenvolvendo uma determinada tarefa           | 1. Treinar a equipe de desenvolvimento.  2. Definir as tarefas de acordo com as habilidades individuais.  3. Adotar uma estrutura de governança flexível.  |
| 6. Tarefa-Tecnologia     | 1. A tecnologia adotada é inadequada para uma determinada tarefa     | 1. Adotar modelos de contingência para desenvolvimento de software.  2. Gerenciar opções de tecnologia.                                                    |
| 7. Estrutura-Tarefas     | 1. A estrutura existente é inadequada para a realização das tarefas  | 1. Adaptar a estrutura de decisão.  2. Modificar o modelo de processo.                                                                                     |
| 8. Ator-Tecnologia       | 1. Atores incompetentes ou competentes demais para a tecnologia dada | 1. Fazer a prototipagem do produto.  2. Fazer análise técnica do processo.  3. Utilizar técnicas de cenários.  4. Fazer treinamento técnico da equipe.     |
| 9. Ator-Estrutura        | 1. Falta de compromisso dos stakeholders                             | 1. Aplicar táticas de liderança apropriadas.  2. Contratar pessoas com boa cooperação e habilidades de gestão.  3. Adotar programas de formação de equipes |
| 10. Estrutura-Tecnologia | 1. Ajustes do sistema inadequado                                     | 1. Mudar a autoridade ou fluxo de trabalho  2. Adotar/configurar novas tecnologias organizacionais                                                         |

## 2. Elementos e Dinâmica do Jogo

- O jogo Arriscando foi projetado para ser jogado em grupos de 3 a 5 pessoas. 

- Cada participante irá interpretar o papel de um gerente de projetos que deverá desenvolver planos de gerenciamento de riscos.

- O objetivo do jogo é ser o participante que detém a maior quantidade de unidades de dinheiro ao fim da partida. Para isso, a dinâmica do jogo constitui-se em ataques com cartas de risco e
defesas através do uso de cartas de mitigação.

- O jogo é composto pelos seguintes elementos:
    - 26 cartas de risco
    - 17 cartas de mitigação
    - 25 notas de 5 unidades de dinheiro
    - 10 notas de 10 unidades de dinheiro
    - 1 dado

### Cartas de Risco

- São cartas de cor alaranjada, que possuem o cabeçalho “Risco”, evidenciando sua função. Na frente das cartas de risco são apresentados:
    - (a) uma categoria de risco, que pode ser simples ou composta (uma combinação de duas categorias de risco)
    - (b) a descrição de um risco
    - (c) uma imagem para a categoria daquele risco

- No verso é apresentada a mesma categoria e descrição do risco que é apresentado na frente da carta, acrescentando as mitigações para este risco.

### Cartas de Mitigação

- São cartas esverdeadas, que possuem o cabeçalho “Mitigação”, evidenciando sua função.
- Na frente é apresentado somente a função da carta.
- No verso das cartas de mitigação são apresentados: 
    - (a) uma categoria de risco, que pode ser simples ou composta;
    - (b) várias mitigações que podem ser usadas para mitigar riscos daquela categoria do risco.

### Notas de Unidades de Dinheiro

- As notas de unidades de dinheiro serão pagas após analisar o efeito da ação dos jogadores. Há notas laranjas que valem 5 unidades de dinheiro e notas verdes que valem 10 unidades de dinheiro.

### Dado

- O dado será usado para fazer o sorteio de qual participante irá iniciar a partida.


### Dinâmica do Jogo

O jogo acontece em 4 rodadas. Com o grupo formado, cada pessoa deve, individualmente, receber 3 cartas de risco e 2 cartas de mitigação, além de uma quantia de 30 unidades de dinheiro do jogo (sendo 4 notas de 5 unidades de dinheiro e 1 nota de 10 unidades de dinheiro). Cada participante joga o dado uma vez e o participante que tirar o maior número no dado irá iniciar a partida, seguindo a
ordem de jogo em sentido horário.

O jogador da vez sempre terá que realizar um ataque, para isso ele deverá escolher uma carta de risco, dentre as que estão na sua mão, e atacar um jogador de sua escolha. 

Quando um jogador é atacado, é possível se defender de duas formas:
 - (a) usando uma carta de mitigação da mesma categoria do risco com o que foi atacado para se defender automaticamente; 
 - (b) se não possuir ou não desejar usar uma carta de mitigação, deverá apontar pelo menos uma mitigação presente na carta de risco da qual foi atacado em, no máximo, 1 minuto.

Se foi feito um ataque com sucesso, ou seja, o jogador que foi atacado não conseguiu se defender, esse deverá pagar 5 unidades de dinheiro para o jogador que o atacou. Se foi feita uma
defesa adequada, em outras palavras um ataque sem sucesso, então o atacante deverá pagar 5 unidades de dinheiro para o jogador que fez a defesa da forma correta.

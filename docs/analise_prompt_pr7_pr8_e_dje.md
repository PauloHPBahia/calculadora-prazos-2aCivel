# Análise do provável prompt usado nos PR #7 e #8 + cálculo DJE/DJEN

Data: 2026-04-14.

> Observação: o repositório não guarda o texto original dos prompts usados em cada PR. Portanto, a análise abaixo é uma **reconstrução por inferência técnica**, feita a partir dos diffs, commits e código final.

## 1) O que o PR #7 provavelmente pediu (reconstrução por inferência)

Com base nas mudanças de `9e461cc`, o prompt do PR #7 aparenta ter pedido **expansão ampla** da calculadora, incluindo:

1. Inclusão de regras de **Domicílio Judicial Eletrônico** (intimação/citação).
2. Inclusão de **prazo em dobro** para entes institucionais.
3. Inclusão de validações de **prazo próprio por tema**.
4. Exposição de novos estados no fluxo (`confirmada`, `sem_consulta`, `estimativa`, `bloqueado`).
5. Exposição desses cenários na UI (mais campos e comportamento dinâmico).

### Efeito colateral observado

Esse escopo aumentou muito a superfície da interface e da lógica ao mesmo tempo, gerando a sensação de “mudou demais” e elevando o risco de interferência no fluxo principal do DJEN.

## 2) O que o PR #8 provavelmente pediu (reconstrução por inferência)

Com base nas mudanças de `3c85b4b`, o prompt do PR #8 aparenta ter pedido:

1. Foco em separar claramente **DJEN confirmado** e **DJEN por envio (estimativa)**.
2. Mostrar raciocínio do cálculo e marcos temporais de forma detalhada.
3. Ajustar o canal de sistema para variante institucional (`sistema_mp`).
4. Alertas visuais e status (confirmado/estimado/bloqueado).

### Efeito colateral observado

Apesar de melhorar a leitura do DJEN, a UI deixou de expor o canal `domicilio` e manteve campos de Domicílio ocultos/forçados, criando desalinhamento entre frontend e motor de cálculo.

## 3) Como o DJE/DJEN está sendo calculado hoje no motor

## 3.1 DJEN confirmado

Fluxo implementado no motor:

1. Entrada: data de disponibilização.
2. Publicação = próximo dia útil.
3. Início do prazo = próximo dia útil após a publicação.
4. Vencimento = soma em dias úteis a partir do início.

## 3.2 DJEN por envio (estimativa)

Fluxo implementado no motor:

1. Entrada: data/hora de envio.
2. Se envio em dia útil até 17h: disponibilização estimada no próximo dia útil.
3. Caso contrário: disponibilização estimada no ciclo útil seguinte (estimativa conservadora).
4. Publicação estimada = próximo dia útil da disponibilização estimada.
5. Início = próximo dia útil da publicação estimada.
6. Vencimento = dias úteis.
7. Resultado com aviso de conferência quando necessário.

## 4) Diagnóstico objetivo para preparar novo prompt

Se o objetivo é voltar ao comportamento que “funcionava bem até PR #6”, o novo prompt deve separar **escopo obrigatório** de **escopo proibido**.

### 4.1 Escopo obrigatório (novo prompt)

1. Preservar o fluxo DJEN clássico e a estimativa DJEN por envio.
2. Não alterar fórmula-base de contagem em dias úteis.
3. Corrigir somente incompatibilidades que afetem cálculo DJEN.

### 4.2 Escopo proibido (novo prompt)

1. Não redesenhar layout/estilo da página.
2. Não adicionar novos campos permanentes sem autorização expressa.
3. Não misturar no mesmo PR “melhoria de UX” e “mudança de regra jurídica”.

## 5) Prompt-base sugerido para você reutilizar depois

"""
Objetivo: restaurar e estabilizar o cálculo do DJEN sem expandir a interface.

Contexto:
- Considerar como referência funcional o comportamento até o PR #6.
- O foco é o DJEN (confirmado e estimado por envio), sem introduzir novas modalidades.

Regras obrigatórias:
1) Manter fórmula DJEN confirmada: disponibilização -> publicação (próximo dia útil) -> início (próximo dia útil) -> vencimento em dias úteis.
2) Manter fórmula DJEN estimada por envio com corte às 17h e alerta de conferência quando aplicável.
3) Manter parser de data sem deslocamento de fuso.
4) Não alterar layout, estrutura visual ou quantidade de campos da tela sem pedido explícito.
5) Não inserir lógica de Domicílio Judicial neste PR.
6) Criar/ajustar testes unitários cobrindo os cenários DJEN críticos (antes/depois das 17h, feriado, fim de semana).

Entregáveis:
- patch mínimo em `prazo.js` e, se necessário, ajustes mínimos em `index.html`;
- testes passando;
- resumo curto explicando exatamente o que foi alterado.
"""

## 6) Evidências técnicas no código atual

- O motor ainda possui funções de Domicílio (`calcularDomicilioIntimacao` e `calcularDomicilioCitacao`).
- A UI atual não oferece `domicilio` no seletor de canal.
- A UI oferece `djen` e `djen_envio`, que usam o motor para cálculo confirmado e estimado.


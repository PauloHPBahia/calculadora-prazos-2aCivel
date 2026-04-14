# Levantamento técnico das fórmulas de cálculo (histórico PR #1 a #8)

Data da análise: 2026-04-14.
Branch analisada: `work` (HEAD `e643cd3`).

## Linha do tempo resumida por PR

1. **PR #1 (`codex/sugerir-tarefas-para-problemas-de-código`)**
   - Gerou apenas material de apoio (`REVIEW_TAREFAS.md`) com recomendações de manutenção.
   - Não introduziu fórmula nova de contagem.

2. **PR #2 (`codex/corrigir-botão-calcular-não-funciona`)**
   - Restaurou comportamento da calculadora e consolidou lógica em `prazo.js`.
   - Reestabeleceu cálculo de dias úteis e integração UI -> cálculo.

3. **PR #3 (`codex/adicionar-feriados-para-2026`)**
   - Incluiu feriados de 2026 na lista de indisponibilidade forense.
   - Impacto direto: contagem de prazo em dias úteis passou a respeitar 2026.

4. **PR #4 (`codex/alterar-fórmula-de-cálculo-para-djen`)**
   - Introduziu fluxo DJEN com separação explícita de marcos.
   - Base para distinção entre cálculo “confirmado” e “estimado”.

5. **PR #5 (`codex/remover-lógica-de-tempo-para-estimativa-djen`)**
   - Removeu o corte de horário (17h) na estimativa de envio DJEN.
   - Efeito colateral: a estimativa ficou simplificada demais (perdeu o comportamento conservador por horário).

6. **PR #6 (`codex/fix-date-estimation-logic`)**
   - Corrigiu parsing de data (evitar deslocamentos de fuso).
   - Ajustou cálculo de estimativa DJEN após regressão da PR #5.

7. **PR #7 (`codex/refactor-and-enhance-judicial-deadline-calculator`)**
   - Grande refatoração: adicionou regras de Domicílio Judicial, prazo em dobro, prazo próprio por tema, bloqueios e avisos.
   - Criou funções para cenários de intimação/citação com ciência confirmada, automática e estimada.

8. **PR #8 (`codex/alterar-fórmula-de-cálculo-do-djen`)**
   - Reforçou fluxo DJEN com modo “envio para estimativa” e exibição detalhada de marcos.
   - **Mudança funcional relevante na interface**: removeu da UI o canal “domicílio”, embora a lógica continue implementada no backend (`prazo.js`).

## Fórmulas atualmente ativas no site (UI + motor)

As fórmulas abaixo estão acessíveis pelo fluxo do `index.html` e executadas por `calcularPrazoDetalhado`:

1. **Dias úteis (regra-base CPC 219)**
   - `isDiaUtil`, `proximoDiaUtil`, `somarDiasUteis`.

2. **DJEN confirmado**
   - disponibilização -> publicação (próximo dia útil) -> início (próximo dia útil) -> vencimento em dias úteis.

3. **DJEN por envio (estimativa)**
   - Se envio em dia útil até 17:00: estimativa simples.
   - Caso contrário: estimativa conservadora (+1 ciclo útil adicional), com aviso de conferência.

4. **Sistema/portal eletrônico**
   - início no próximo dia útil da ciência/intimação informada.

5. **Regra de prazo em dobro / prazo próprio**
   - Dobra para MP, Defensoria, Fazenda, Autarquia e Fundação Pública em prazo comum.
   - Exceções: defensor dativo (sem dobra), prazo próprio legal, e temas com cautela de lei especial.

## Fórmulas implementadas no código, mas perdidas da interface (não acionáveis pelo usuário no site)

> “Perdidas” aqui significa: continuam no código, porém não estão mais disponíveis no fluxo atual da interface.

1. **Canal Domicílio Judicial Eletrônico**
   - O motor ainda possui `calcularDomicilioIntimacao` e `calcularDomicilioCitacao`.
   - Porém o seletor de canal da UI não oferece mais `domicilio`.

2. **Situações de ciência do Domicílio**
   - `sem_consulta`, `estimativa` e `bloqueado` continuam tratadas no motor.
   - Na UI, o bloco de situação é ocultado e fixado em `confirmada` no fluxo atual.

3. **Tipo do ato para Domicílio (intimação x citação)**
   - O motor depende de `tipoAto` para escolher regras de intimação/citação.
   - Na UI, o tipo do ato fica oculto e é resetado para `comunicacao_geral` no fluxo padrão.

## Pontos de desalinhamento identificados

1. **Desalinhamento principal: UI x motor**
   - O backend suporta Domicílio Judicial (inclusive regras especiais), mas o frontend não expõe esse caminho.

2. **Complexidade não coberta por testes de interface**
   - Os testes automatizados validam funções de domínio (Node), incluindo Domicílio.
   - Não há teste de ponta a ponta para garantir que a UI realmente ofereça todos os cenários do motor.

3. **Histórico de regressão na estimativa DJEN**
   - O corte por horário foi removido na PR #5 e posteriormente corrigido.
   - Hoje a regra conservadora por horário voltou a existir no código.

## O que precisará ser reaplicado em etapa futura (sem alterar agora)

1. Reexpor na interface o canal **Domicílio Judicial Eletrônico** (se for requisito operacional atual).
2. Reativar os campos dinâmicos de **situação da ciência** e **tipo do ato** para o fluxo de Domicílio.
3. Criar testes de interface (E2E) para garantir que canais e campos dinâmicos não sejam removidos acidentalmente.
4. Manter cobertura de testes para a regra DJEN com corte às 17h (para prevenir nova regressão).

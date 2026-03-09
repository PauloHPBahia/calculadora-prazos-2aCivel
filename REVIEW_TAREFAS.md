# Revisão rápida da base e tarefas sugeridas

## Problemas encontrados

1. **Possível bug de contagem com erro de +1 dia no prazo final**
   - Em `calcularPrazo()`, a data é incrementada no início da contagem e também ao final de cada iteração, o que tende a devolver o próximo dia útil após o término real do prazo.
2. **Falta de validação de entrada**
   - Se `dataIntimacao` ou `prazoConcedido` estiverem vazios/inválidos, o resultado pode exibir `Invalid Date` e valores inconsistentes.
3. **Discrepância de documentação/manual**
   - O manual não deixa explícito que a lista de feriados está fixa apenas para 2024-2025, o que impacta cálculos fora desse intervalo.
4. **Ausência de testes automatizados**
   - Não há cobertura para regras sensíveis (DJE, dobra de prazo, fins de semana/feriados e validações).

## 4 tarefas objetivas sugeridas

1. **Tarefa (erro de digitação)**
   - Padronizar o texto da opção `SISTEMA (MP,DP,AUTARQUIA)` para `SISTEMA (MP, DP, AUTARQUIA)` para manter consistência com o manual.

2. **Tarefa (correção de bug)**
   - Ajustar o algoritmo de `calcularPrazo()` para remover o deslocamento de +1 dia na data final, incluindo teste de regressão para prazo de 1 dia útil.

3. **Tarefa (comentário/documentação)**
   - Atualizar o “Manual de Uso” para explicitar a janela de cobertura de feriados (2024-2025) e comportamento esperado fora desse período.

4. **Tarefa (melhoria de teste)**
   - Criar suíte de testes unitários para `ehDiaUtil` e para cenários de `calcularPrazo` (SISTEMA, DJE, autarquia, entrada inválida e datas em fim de semana/feriado).

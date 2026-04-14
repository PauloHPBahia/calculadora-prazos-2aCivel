# PR #7 e #8: apagar os ramos volta para o PR #6?

Resposta curta: **não**.

## Por quê?

- Os PRs #7 e #8 já foram mesclados no histórico da branch de trabalho.
- Apagar os ramos remotos/locais (`codex/...`) remove só os ponteiros de branch, não remove os commits já integrados.

## O que realmente volta para o estado do PR #6

Há duas estratégias corretas:

1. **Reverter commits merge** (mais seguro para branch compartilhada)
   - Reverter o merge da PR #8.
   - Reverter o merge da PR #7.
   - Mantém histórico auditável, sem reescrever histórico público.

2. **Reset para o commit da PR #6** (mais agressivo)
   - Mover a branch para `8ddafb1` (merge da PR #6).
   - Exige `push --force` se já houve push da branch atual.
   - Só é recomendável quando a equipe concorda com reescrita de histórico.

## Referências de commits relevantes

- PR #6 (merge): `8ddafb1`
- PR #7 (merge): `e7c6cdf`
- PR #8 (merge): `a62ce46`

## Recomendação prática

Para evitar risco em repositório compartilhado, prefira **revert** de PR #8 e #7, nessa ordem.

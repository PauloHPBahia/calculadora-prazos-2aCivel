# Como mesclar o PR no GitHub (passo a passo)

Este guia é para quando o código já está correto, mas a mesclagem no GitHub não foi concluída.

## 1) Abrir o Pull Request certo

1. Entre no repositório no GitHub.
2. Clique em **Pull requests**.
3. Abra o PR mais recente com as mudanças de DJE/DJEN.

## 2) Verificar se o PR pode ser mesclado

No topo do PR, verifique se aparece:
- **"This branch has no conflicts with the base branch"** (sem conflitos), e
- checks obrigatórios aprovados (se o repositório exigir).

Se estiver tudo verde, siga para a etapa 4.

## 3) Se aparecer conflito

1. Clique em **Resolve conflicts**.
2. Em cada bloco de conflito, mantenha a versão correta (a dos últimos arquivos já validados).
3. Clique em **Mark as resolved**.
4. Clique em **Commit merge**.
5. Volte para o PR.

## 4) Fazer a mesclagem

1. Clique em **Merge pull request**.
2. Confirme em **Confirm merge**.
3. (Opcional) Clique em **Delete branch** para limpar a branch do PR.

## 5) Atualizar sua branch local

No terminal local:

```bash
git checkout work
git pull origin work
```

Se você trabalha em `main`, troque `work` por `main`.

## 6) Se o botão de merge estiver desabilitado

Verifique:
- PR com **review obrigatório** pendente;
- checks de CI pendentes/falhando;
- branch desatualizada em relação à base.

Nesses casos:
1. Atualize a branch do PR com a base (botão **Update branch**, se disponível).
2. Reexecute os checks.
3. Tente mesclar novamente.

---

Se quiser, posso te orientar com os cliques exatos na tela conforme o status que estiver aparecendo no seu PR agora.

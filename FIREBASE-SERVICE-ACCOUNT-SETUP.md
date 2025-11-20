# Firebase Service Account Setup

## ⚠️ SEGURANÇA CRÍTICA

**NUNCA commite service account keys no Git!** Essas chaves dão acesso completo ao seu projeto Firebase.

---

## 📥 Como obter o Service Account

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto **nous-e3e7a**
3. Vá em **Project Settings** (ícone de engrenagem)
4. Clique na aba **Service accounts**
5. Clique em **Generate new private key**
6. Confirme e baixe o arquivo JSON

---

## 🎯 Recomendação por Ambiente

| Ambiente | Método Recomendado | Por quê |
|----------|-------------------|---------|
| **Desenvolvimento Local** | ✅ Arquivo Local | Mais fácil, funciona com emulators |
| **Produção (Firebase)** | ✅ Automático | Functions já tem credenciais |
| **CI/CD (GitHub Actions)** | ✅ Variável de Ambiente | Mais seguro, usa secrets |

---

## 📁 Setup para Desenvolvimento Local (RECOMENDADO)

### 1. Baixe o Service Account JSON

Siga os passos acima para baixar o arquivo.

### 2. Salve na raiz do projeto:

```
F:\JARVA\firebase-service-account.json
```

✅ Esse arquivo **já está protegido** no `.gitignore`

### 3. Pronto!

O Firebase Admin SDK detecta automaticamente esse arquivo.

**Não precisa configurar mais nada!**

---

## 🔧 Como usar no código (Backend)

O Firebase Admin SDK detecta automaticamente o service account. Basta inicializar:

```typescript
import * as admin from 'firebase-admin';

// Desenvolvimento: detecta firebase-service-account.json automaticamente
// Produção: usa credenciais automáticas do Firebase Functions
admin.initializeApp();
```

**Simples assim!** Não precisa configurar caminhos ou variáveis.

---

## 🛡️ Proteções Implementadas

O `.gitignore` já ignora:

```
*-service-account.json
service-account*.json
serviceAccountKey.json
firebase-adminsdk-*.json
*-firebase-adminsdk-*.json
private-key.json
*-private-key.json
```

---

## ✅ Checklist de Segurança

- [ ] Baixar service account JSON do Firebase Console
- [ ] Colocar em `F:\JARVA\firebase-service-account.json`
- [ ] Verificar que está no `.gitignore`
- [ ] **NUNCA** commitar no Git
- [ ] Usar apenas em desenvolvimento local
- [ ] Para produção, usar Firebase Functions environment config

---

## 🚀 Produção (Firebase Functions)

**NÃO precisa fazer nada!**

Quando você fizer deploy para Firebase Functions, o ambiente de produção já tem credenciais automáticas.

O mesmo código funciona em desenvolvimento e produção:

```typescript
import * as admin from 'firebase-admin';

// Funciona em desenvolvimento E produção
admin.initializeApp();
```

Firebase detecta automaticamente:
- **Local:** Usa `firebase-service-account.json` se existir
- **Produção:** Usa credenciais automáticas do Functions

---

## 📞 Suporte

Se você acidentalmente commitou o service account:

1. **Revogue a chave imediatamente** no Firebase Console
2. Gere uma nova chave
3. Use `git filter-branch` ou BFG Repo-Cleaner para remover do histórico

---

**Última atualização:** 2025-01-20

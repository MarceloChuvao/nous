# Como Limpar a Autenticação

## Método 1: Pelo Console do Navegador (MAIS RÁPIDO)

1. Abra o DevTools (F12)
2. Vá na aba **Console**
3. Cole este comando e pressione Enter:

```javascript
localStorage.removeItem('nous-auth-storage')
location.reload()
```

Isso vai limpar a autenticação e recarregar a página.

## Método 2: Pelo DevTools Application

1. Pressione F12
2. Vá na aba **Application** (ou Aplicação)
3. No menu esquerdo: **Local Storage** → `http://localhost:3000`
4. Procure a chave `nous-auth-storage`
5. Clique com botão direito e delete
6. Recarregue a página (F5)

## Método 3: Limpar Tudo

No Console (F12), cole:

```javascript
localStorage.clear()
location.reload()
```

Isso remove TUDO do localStorage.

---

Depois de fazer isso, você verá a tela de login!

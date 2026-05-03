# Cozinha48 - Site Oficial

Site institucional + painel do lojista para a plataforma de delivery Cozinha48.

## Stack
- React 18
- Firebase (Auth + Firestore)
- React Router v6
- Deploy: Vercel

## Como configurar

### 1. Configure o Firebase
Abra `src/firebase.js` e substitua as credenciais pelas suas:
- Acesse: https://console.firebase.google.com
- Projeto: cozinha48-d4408
- Configurações do projeto > Seus aplicativos > Web
- Copie o objeto `firebaseConfig` e cole em `src/firebase.js`

### 2. Instale as dependências
```bash
npm install
```

### 3. Rode localmente
```bash
npm start
```
Acesse: http://localhost:3000

### 4. Build para produção
```bash
npm run build
```

## Deploy na Vercel

1. Suba este projeto para o GitHub
2. Acesse vercel.com > Add New Project
3. Importe o repositório do GitHub
4. A Vercel detecta automaticamente que é React
5. Clique em Deploy

## Estrutura do projeto

```
src/
├── components/
│   ├── Navbar.jsx        # Navegação principal
│   ├── Home.jsx          # Página inicial (institucional)
│   ├── Login.jsx         # Login do lojista
│   ├── Cadastro.jsx      # Cadastro de novos lojistas
│   └── Painel.jsx        # Dashboard do lojista (protegido)
├── firebase.js           # Configuração do Firebase
├── App.js                # Rotas da aplicação
└── index.js              # Entrada do React
```

## Funcionalidades

- [x] Site institucional completo
- [x] Cadastro de lojistas com Firebase Auth
- [x] Login com e-mail/senha
- [x] Painel protegido por autenticação
- [x] Dashboard com pedidos em tempo real (Firestore)
- [ ] Gerenciamento de cardápio (Fase 2)
- [ ] Pedidos detalhados (Fase 2)
- [ ] Impressão de comanda (Fase 2)
- [ ] Dashboard financeiro (Fase 3)

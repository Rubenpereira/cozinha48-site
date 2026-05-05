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
│   ├── Navbar.jsx                   # Navegação pública
│   ├── Home.jsx                     # Página inicial
│   ├── Login.jsx                    # Login do lojista
│   ├── Cadastro.jsx                 # Cadastro de novos lojistas
│   ├── Painel.jsx                   # Roteador admin/lojista
│   ├── PainelLojista.jsx            # Dashboard do lojista
│   ├── PainelAdmin.jsx              # Dashboard do admin
│   ├── LoginAdmin.jsx               # Login do admin
│   ├── AdminDashboard.jsx           # Painel administrativo
│   ├── SidebarLojista.jsx           # Sidebar reutilizável (Fase 2)
│   ├── Cardapio.jsx                 # CRUD de cardápio (Fase 2)
│   ├── Pedidos.jsx                  # Lista completa de pedidos (Fase 2)
│   ├── PedidoDetalhe.jsx            # Detalhe + ações (Fase 2)
│   ├── Comanda.jsx                  # Comanda térmica imprimível (Fase 2)
│   ├── Financeiro.jsx               # Dashboard financeiro (Fase 3)
│   ├── RelatorioFinanceiroPrint.jsx # Relatório PDF A4 (Fase 3)
│   ├── Rastreamento.jsx             # Rastreio de entrega
│   ├── pedidoUtils.js               # Helpers de pedido
│   └── financeiroUtils.js           # Helpers financeiros (KPIs, CSV, etc.)
├── hooks/
│   └── useUsuario.js                # Hook de auth + dados do lojista
├── firebase.js                      # Auth + Firestore + Storage
├── App.js                           # Rotas
└── index.js                         # Entrada do React
```

## Modelagem Firestore (Fase 2/3)

| Coleção       | Campos                                                                                              |
|---------------|-----------------------------------------------------------------------------------------------------|
| `usuarios`    | `nome, email, role/tipo, nomeEstabelecimento, plano, comissaoPlataforma (%), cnpj, endereco, ...`  |
| `categorias`  | `lojistaId, nome, ordem, criadoEm`                                                                  |
| `cardapio`    | `lojistaId, categoriaId, nome, descricao, preco, disponivel, imagem, ordem, criadoEm, atualizadoEm` |
| `pedidos`     | `lojistaId, nomeCliente, telefoneCliente, itens[], total, status, formaPagamento, endereco, ...`    |

Imagens dos itens do cardápio são comprimidas no navegador (600px, JPEG q=0.75 ≈ 50–80KB) e armazenadas como **base64 dentro do próprio documento** — não é necessário ativar o Firebase Storage / plano Blaze.

## Funcionalidades

- [x] Site institucional completo
- [x] Cadastro de lojistas com Firebase Auth
- [x] Login com e-mail/senha
- [x] Painel protegido por autenticação
- [x] Dashboard com pedidos em tempo real (Firestore)
- [x] **Gerenciamento de cardápio (Fase 2)** — CRUD de categorias e itens, upload de fotos, toggle de disponibilidade
- [x] **Pedidos detalhados (Fase 2)** — Lista filtrável + detalhe com timeline de status e ações (avançar/cancelar)
- [x] **Impressão de comanda (Fase 2)** — Layout térmico 80mm (`@media print`) com cabeçalho, itens, endereço e total
- [x] **Dashboard financeiro (Fase 3)** — KPIs (faturamento, ticket médio), gráfico SVG por dia, top 10 itens, heatmap por hora, comissão da plataforma e repasse líquido, exportação CSV/PDF

## Próximos passos pra publicar

1. **Configure regras do Firestore** para `categorias` e `cardapio` (mesma lógica de `pedidos`: lojistaId == request.auth.uid).
2. **(Opcional)** Defina `comissaoPlataforma` no documento do usuário (default = 10%).
3. `npm run build` e deploy na Vercel.

> Não é necessário ativar o Firebase Storage nem o plano Blaze — as fotos são comprimidas no navegador e salvas direto no Firestore.

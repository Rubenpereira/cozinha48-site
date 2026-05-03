import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-badge">🚀 Sistema completo de delivery</div>
          <h1>Seu negócio<br />entregando <span>mais rápido</span></h1>
          <p>O Cozinha48 conecta clientes, lojistas e motoboys em uma plataforma completa, moderna e simples de usar.</p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => navigate('/cadastro')}>
              Cadastrar minha loja
            </button>
            <button className="btn-secondary" onClick={() => {
              document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Ver como funciona
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <span className="stat-num">3</span>
              <span className="stat-label">Aplicativos</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-num">2</span>
              <span className="stat-label">Meses grátis</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-num">24h</span>
              <span className="stat-label">Suporte</span>
            </div>
          </div>
        </div>
      </section>

      {/* APPS */}
      <section className="section bg-dark" id="apps">
        <div className="wrap">
          <div className="section-label">Ecossistema</div>
          <h2>3 aplicativos,<br />1 plataforma integrada</h2>
          <div className="apps-grid">
            <div className="app-card">
              <div className="app-icon icon-orange">🛒</div>
              <h3>Cozinha48 Cliente</h3>
              <p>O app para quem quer pedir. Navegue por restaurantes, monte seu pedido e acompanhe a entrega em tempo real.</p>
              <div className="app-tags">
                <span className="tag">Rastreio em tempo real</span>
                <span className="tag">Histórico de pedidos</span>
                <span className="tag">Avaliações</span>
              </div>
              <a href="#download" className="app-link">Baixar na Play Store →</a>
            </div>

            <div className="app-card">
              <div className="app-icon icon-blue">🏪</div>
              <h3>Cozinha48 Lojista</h3>
              <p>Gerencie seu restaurante completo. Cardápio, pedidos, financeiro, impressão de comanda e muito mais.</p>
              <div className="app-tags">
                <span className="tag">Gestão de cardápio</span>
                <span className="tag">Pedidos ao vivo</span>
                <span className="tag">Impressão</span>
                <span className="tag">Financeiro</span>
              </div>
              <a href="#download" className="app-link">Baixar na Play Store →</a>
            </div>

            <div className="app-card">
              <div className="app-icon icon-green">🛵</div>
              <h3>Cozinha48 Motoboy</h3>
              <p>Para os entregadores. Veja o valor da corrida antes de aceitar e receba via PIX toda semana.</p>
              <div className="app-tags">
                <span className="tag">Ganho visível</span>
                <span className="tag">PIX semanal</span>
                <span className="tag">Rotas otimizadas</span>
              </div>
              <a href="#download" className="app-link">Baixar na Play Store →</a>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="section" id="como-funciona">
        <div className="wrap">
          <div className="section-label">Processo</div>
          <h2>Como funciona</h2>
          <div className="steps-grid">
            {[
              { num: '1', title: 'Lojista se cadastra', desc: 'Cria sua loja, cadastra produtos com fotos e preços no app ou no site.' },
              { num: '2', title: 'Cliente faz pedido', desc: 'Escolhe o restaurante, monta o carrinho e confirma o pedido pelo app.' },
              { num: '3', title: 'Lojista confirma', desc: 'Recebe o pedido no app, imprime a comanda e prepara o produto.' },
              { num: '4', title: 'Motoboy coleta', desc: 'Aceita a entrega, vê o valor, coleta no estabelecimento e entrega ao cliente.' },
              { num: '5', title: 'Pedido entregue', desc: 'Cliente avalia, lojista recebe e motoboy é pago. Simples assim.' },
            ].map((step) => (
              <div className="step" key={step.num}>
                <div className="step-num">{step.num}</div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section className="section bg-dark" id="planos">
        <div className="wrap">
          <div className="section-label">Planos</div>
          <h2>Escolha o plano ideal<br />para sua loja</h2>
          <div className="plans-grid">
            <div className="plan-card">
              <div className="plan-name">Básico</div>
              <div className="plan-price"><span className="currency">R$</span>110<span className="period">/mês</span></div>
              <div className="plan-commission">+ 12% de comissão por pedido</div>
              <ul className="plan-features">
                <li>Cadastro de cardápio completo</li>
                <li>Recebimento de pedidos</li>
                <li>Impressão de comanda</li>
                <li>Relatórios básicos</li>
                <li>2 meses grátis no início</li>
              </ul>
              <button className="plan-btn" onClick={() => navigate('/cadastro')}>Começar grátis</button>
            </div>

            <div className="plan-card featured">
              <div className="plan-badge">Mais completo</div>
              <div className="plan-name">Delivery</div>
              <div className="plan-price"><span className="currency">R$</span>150<span className="period">/mês</span></div>
              <div className="plan-commission">+ 23% de comissão por pedido</div>
              <ul className="plan-features">
                <li>Tudo do plano Básico</li>
                <li>Integração com motoboys</li>
                <li>Rastreio de entregadores</li>
                <li>Relatórios avançados</li>
                <li>Dashboard financeiro</li>
                <li>2 meses grátis no início</li>
              </ul>
              <button className="plan-btn featured-btn" onClick={() => navigate('/cadastro')}>Começar grátis</button>
            </div>
          </div>
          <p className="plans-note">
            Pagamento recorrente. Primeiro ciclo começa 30 dias após os 2 meses gratuitos.
          </p>
        </div>
      </section>

      {/* MOTOBOY */}
      <section className="section" id="motoboy">
        <div className="wrap">
          <div className="moto-card">
            <div className="moto-left">
              <div className="section-label">Entregadores</div>
              <h3>Seja um motoboy Cozinha48</h3>
              <p>Trabalhe com liberdade. Você escolhe quando e quanto trabalhar, vê o valor de cada entrega antes de aceitar e recebe toda semana via PIX.</p>
              <button className="btn-primary" onClick={() => navigate('/motoboy')}>Quero ser motoboy</button>
            </div>
            <div className="moto-items">
              {[
                { icon: '💰', title: 'Ganho transparente', desc: 'Veja o valor completo da entrega antes de aceitar qualquer corrida.' },
                { icon: '📅', title: 'PIX toda quarta-feira', desc: 'Pagamento semanal automático, sem burocracia, direto na sua conta.' },
                { icon: '📍', title: 'Extras por distância', desc: 'Quanto mais longe a entrega, maior o seu ganho. Rota calculada automaticamente.' },
              ].map((item) => (
                <div className="moto-item" key={item.title}>
                  <div className="moto-dot">{item.icon}</div>
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="section cta-section">
        <div className="wrap cta-inner">
          <h2>Pronto para começar?</h2>
          <p>Cadastre sua loja agora e aproveite 2 meses gratuitos. Sem cartão de crédito.</p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => navigate('/cadastro')}>Criar minha loja grátis</button>
            <button className="btn-secondary" onClick={() => navigate('/login')}>Já tenho cadastro</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contato">
        <div className="wrap">
          <div className="footer-inner">
            <div className="footer-brand">
              <div className="logo-footer">Cozinha<span>48</span></div>
              <p>Plataforma completa de delivery conectando clientes, lojistas e motoboys em uma só solução.</p>
            </div>
            <div className="footer-col">
              <h5>Plataforma</h5>
              <ul>
                <li><a href="#apps">App Cliente</a></li>
                <li><a href="#apps">App Lojista</a></li>
                <li><a href="#motoboy">App Motoboy</a></li>
                <li onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>Painel Web</li>
              </ul>
            </div>
            <div className="footer-col">
              <h5>Empresa</h5>
              <ul>
                <li><a href="#como-funciona">Como funciona</a></li>
                <li><a href="#planos">Planos e preços</a></li>
                <li><a href="mailto:contato@cozinha48.com.br">contato@cozinha48.com.br</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Cozinha48. Todos os direitos reservados.</p>
            <p>Desenvolvido com Firebase + React</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

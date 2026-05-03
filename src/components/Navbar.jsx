import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="wrap nav-inner">
        <Link to="/" className="logo">
          Cozinha<span>48</span>
        </Link>

        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <li><a href="#apps" onClick={() => setMenuOpen(false)}>Aplicativos</a></li>
          <li><a href="#como-funciona" onClick={() => setMenuOpen(false)}>Como funciona</a></li>
          <li><a href="#planos" onClick={() => setMenuOpen(false)}>Planos</a></li>
          <li><a href="#motoboy" onClick={() => setMenuOpen(false)}>Motoboys</a></li>
          <li><a href="#contato" onClick={() => setMenuOpen(false)}>Contato</a></li>
        </ul>

        <div className="nav-actions">
          <button className="nav-btn-outline" onClick={() => navigate('/login')}>
            Entrar
          </button>
          <button className="nav-btn" onClick={() => navigate('/cadastro')}>
            Seja Lojista
          </button>
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
  );
}

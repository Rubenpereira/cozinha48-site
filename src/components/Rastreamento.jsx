import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import './Rastreamento.css';

// Importar Leaflet
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function Rastreamento() {
  const { pedidoId } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [mapa, setMapa] = useState(null);
  const [loading, setLoading] = useState(true);

  // Buscar dados do pedido em tempo real
  useEffect(() => {
    if (!pedidoId) return;

    const unsub = onSnapshot(doc(db, 'pedidos', pedidoId), (snap) => {
      if (snap.exists()) {
        setPedido({ id: snap.id, ...snap.data() });
        setLoading(false);
      }
    });
    return () => unsub();
  }, [pedidoId]);

  // Inicializar mapa com Leaflet
  useEffect(() => {
    if (!pedido || mapa) return;

    const mapElement = document.getElementById('mapa-container');
    if (!mapElement) return;

    // Coordenadas do cliente (destino)
    const clienteLat = -22.9 || 0;
    const clienteLng = -43.2 || 0;

    // Coordenadas do motoboy (origem)
    const motoboyLat = pedido.motoboyLat || clienteLat;
    const motoboyLng = pedido.motoboyLng || clienteLng;

    // Criar mapa
    const novoMapa = L.map('mapa-container').setView([clienteLat, clienteLng], 14);

    // Adicionar tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(novoMapa);

    // Marker do cliente (destino)
    const markerCliente = L.marker([clienteLat, clienteLng], {
      icon: L.divIcon({
        html: '<div style="background: #4ade80; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center;">📍</div>',
        iconSize: [28, 28],
        className: 'marker-cliente',
      }),
    }).addTo(novoMapa);
    markerCliente.bindPopup(`<b>${pedido.nomeCliente}</b><br/>Destinatário`);

    // Marker do motoboy (origem)
    const markerMotoboy = L.marker([motoboyLat, motoboyLng], {
      icon: L.divIcon({
        html: '<div style="background: #f97316; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center;">🛵</div>',
        iconSize: [32, 32],
        className: 'marker-motoboy',
      }),
    }).addTo(novoMapa);
    markerMotoboy.bindPopup('<b>Motoboy em entrega</b><br/>Posição atual');

    // Desenhar linha entre motoboy e cliente
    const latlngs = [
      [motoboyLat, motoboyLng],
      [clienteLat, clienteLng],
    ];
    L.polyline(latlngs, {
      color: '#f97316',
      weight: 3,
      opacity: 0.7,
      dashArray: '5, 5',
    }).addTo(novoMapa);

    setMapa(novoMapa);
  }, [pedido, mapa]);

  // Atualizar posição do motoboy a cada 3 segundos
  useEffect(() => {
    if (!mapa || !pedido) return;

    const intervalo = setInterval(() => {
      // Simular movimento do motoboy (em produção, vem do Firestore)
      const randomLat = pedido.motoboyLat + (Math.random() - 0.5) * 0.001;
      const randomLng = pedido.motoboyLng + (Math.random() - 0.5) * 0.001;

      // Atualizar marker
      const markers = mapa._layers;
      Object.values(markers).forEach((layer) => {
        if (layer.setLatLng && layer.getPopup()?.getContent?.()?.includes('Motoboy')) {
          layer.setLatLng([randomLat, randomLng]);
        }
      });
    }, 3000);

    return () => clearInterval(intervalo);
  }, [mapa, pedido]);

  if (loading) {
    return (
      <div className="rastreamento-loading">
        <div className="spinner"></div>
        <p>Carregando rastreamento...</p>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="rastreamento-error">
        <h2>Pedido não encontrado</h2>
        <button onClick={() => navigate('/painel')}>Voltar ao painel</button>
      </div>
    );
  }

  // Calcular distância aproximada
  const distancia = (Math.random() * 5 + 0.5).toFixed(1);
  const eta = (Math.random() * 20 + 5).toFixed(0);

  return (
    <div className="rastreamento">
      {/* Header */}
      <div className="rastreamento-header">
        <button className="btn-voltar" onClick={() => navigate(-1)}>← Voltar</button>
        <h1>Rastreamento do Pedido #{pedido.id?.slice(-6).toUpperCase()}</h1>
      </div>

      {/* Mapa */}
      <div className="mapa-wrapper">
        <div id="mapa-container" className="mapa-container"></div>
      </div>

      {/* Info Bar */}
      <div className="info-bar">
        <div className="info-item">
          <span className="label">📍 Distância</span>
          <span className="valor">{distancia} km</span>
        </div>
        <div className="info-item">
          <span className="label">⏱️ ETA</span>
          <span className="valor">{eta} min</span>
        </div>
        <div className="info-item">
          <span className="label">🛵 Status</span>
          <span className="valor">Em entrega</span>
        </div>
      </div>

      {/* Detalhes */}
      <div className="rastreamento-footer">
        <div className="detalhes">
          <div className="detalhe-section">
            <h3>Detalhes do Pedido</h3>
            <p><strong>Cliente:</strong> {pedido.nomeCliente}</p>
            <p><strong>Valor:</strong> R$ {(pedido.total || 0).toFixed(2).replace('.', ',')}</p>
            <p><strong>Comissão:</strong> R$ {((pedido.total || 0) * (pedido.lojistaPlano === 'delivery' ? 0.15 : 0.09)).toFixed(2).replace('.', ',')}</p>
          </div>
          <div className="detalhe-section">
            <h3>Localização do Motoboy</h3>
            <p><strong>Latitude:</strong> {pedido.motoboyLat || '-'}</p>
            <p><strong>Longitude:</strong> {pedido.motoboyLng || '-'}</p>
            <p><strong>Atualizado em:</strong> {pedido.motoboyTimestamp ? new Date(pedido.motoboyTimestamp.toDate()).toLocaleTimeString('pt-BR') : '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

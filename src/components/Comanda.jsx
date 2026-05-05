import React from 'react';
import { formatBRL, formatDataHora, statusLabel } from './pedidoUtils';
import './Comanda.css';

/**
 * Comanda imprimível para impressoras térmicas (58mm / 80mm).
 * Fica oculta na tela e só aparece em @media print.
 * Disparada via window.print() de qualquer parte da página.
 */
export default function Comanda({ pedido, usuario }) {
  if (!pedido) return null;

  const subtotal = (pedido.itens || []).reduce(
    (acc, i) => acc + Number(i.preco || 0) * Number(i.quantidade || 1),
    0
  );
  const taxaEntrega = Number(pedido.taxaEntrega || 0);
  const desconto = Number(pedido.desconto || 0);
  const total = pedido.total || subtotal + taxaEntrega - desconto;
  const numeroCurto = pedido.id.slice(-6).toUpperCase();

  return (
    <div className="comanda-print">
      <div className="comanda-cabecalho">
        <h1>{usuario?.nomeEstabelecimento || 'Cozinha48'}</h1>
        {usuario?.cnpj && <p>CNPJ: {usuario.cnpj}</p>}
        {usuario?.endereco && (
          <p>
            {usuario.endereco.rua && `${usuario.endereco.rua}, `}
            {usuario.endereco.numero}
          </p>
        )}
        {usuario?.telefone && <p>Tel: {usuario.telefone}</p>}
      </div>

      <div className="comanda-divisor">================================</div>

      <div className="comanda-pedido">
        <p className="comanda-numero">PEDIDO #{numeroCurto}</p>
        <p>Data: {formatDataHora(pedido.criadoEm)}</p>
        <p>Status: {statusLabel(pedido.status).replace(/[^\w\sÁ-ú]/g, '').trim()}</p>
      </div>

      <div className="comanda-divisor">--------------------------------</div>

      <div className="comanda-cliente">
        <p><strong>CLIENTE</strong></p>
        <p>{pedido.nomeCliente || '—'}</p>
        {pedido.telefoneCliente && <p>Tel: {pedido.telefoneCliente}</p>}
      </div>

      {pedido.endereco && (
        <>
          <div className="comanda-divisor">--------------------------------</div>
          <div className="comanda-endereco">
            <p><strong>ENTREGA</strong></p>
            <p>
              {pedido.endereco.rua}, {pedido.endereco.numero}
              {pedido.endereco.complemento && ` - ${pedido.endereco.complemento}`}
            </p>
            <p>
              {pedido.endereco.bairro} - {pedido.endereco.cidade}/{pedido.endereco.uf}
            </p>
            {pedido.endereco.cep && <p>CEP: {pedido.endereco.cep}</p>}
            {pedido.endereco.referencia && (
              <p>Ref.: {pedido.endereco.referencia}</p>
            )}
          </div>
        </>
      )}

      <div className="comanda-divisor">================================</div>

      <div className="comanda-itens">
        <p><strong>ITENS DO PEDIDO</strong></p>
        {(pedido.itens || []).map((it, i) => (
          <div key={i} className="comanda-item">
            <div className="comanda-item-linha">
              <span>{it.quantidade || 1}x {it.nome}</span>
              <span>{formatBRL(Number(it.preco || 0) * Number(it.quantidade || 1))}</span>
            </div>
            {it.observacao && (
              <p className="comanda-obs">  &gt; {it.observacao}</p>
            )}
          </div>
        ))}
      </div>

      <div className="comanda-divisor">--------------------------------</div>

      <div className="comanda-totais">
        <div className="comanda-item-linha">
          <span>Subtotal:</span>
          <span>{formatBRL(subtotal)}</span>
        </div>
        {taxaEntrega > 0 && (
          <div className="comanda-item-linha">
            <span>Taxa entrega:</span>
            <span>{formatBRL(taxaEntrega)}</span>
          </div>
        )}
        {desconto > 0 && (
          <div className="comanda-item-linha">
            <span>Desconto:</span>
            <span>-{formatBRL(desconto)}</span>
          </div>
        )}
        <div className="comanda-item-linha comanda-total">
          <span><strong>TOTAL:</strong></span>
          <span><strong>{formatBRL(total)}</strong></span>
        </div>
      </div>

      <div className="comanda-divisor">--------------------------------</div>

      <div className="comanda-pagamento">
        <p><strong>PAGAMENTO</strong></p>
        <p>{pedido.formaPagamento || '—'}</p>
        {pedido.troco && (
          <p>Troco para: {formatBRL(pedido.troco)}</p>
        )}
      </div>

      {pedido.observacao && (
        <>
          <div className="comanda-divisor">--------------------------------</div>
          <div className="comanda-observacao">
            <p><strong>OBSERVAÇÕES</strong></p>
            <p>{pedido.observacao}</p>
          </div>
        </>
      )}

      <div className="comanda-divisor">================================</div>

      <div className="comanda-rodape">
        <p>Obrigado pela preferência!</p>
        <p className="comanda-pequeno">cozinha48.com.br</p>
      </div>
    </div>
  );
}

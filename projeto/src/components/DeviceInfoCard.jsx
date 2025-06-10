import React from 'react';

// Função para formatar o timestamp para data e hora no padrão brasileiro
const formatTimestamp = (timestamp) => {
  if (!timestamp || isNaN(timestamp)) {
    return 'Data não disponível';
  }
  // Assumindo que o timestamp seja em segundos; multiplicamos por 1000 para milissegundos
  const date = new Date(timestamp * 1000);
  
  // Verificação extra para evitar datas absurdas
  if (date.getFullYear() < 1970 || date.getFullYear() > 2100) {
    return 'Data inválida';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(date);
};

// Função para obter um link amigável do Google Maps
const getGoogleMapsLink = (lat, lng) => {
  if (!lat || !lng) {
    return 'Coordenadas inválidas';
  }
  return (
    <a
      href={`https://www.google.com/maps?q=${lat},${lng}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      Ver no Google Maps
    </a>
  );
};

const DeviceInfoCard = ({ device, address, onClose }) => {
  if (!device) return null;

  // Extraindo os dados solicitados do objeto 'device'
  const { device_key } = device;
  const { lat, lng, latlng_valid, location_date } = device.status;

  return (
    <div className="info-card">
      <div className="info-card-header">
        <h3>Detalhes do Dispositivo</h3>
        <button onClick={onClose} className="info-card-close-btn" aria-label="Fechar">
          &times;
        </button>
      </div>
      <div className="info-card-content">
        <div className="info-item">
          <span className="info-label">Device Key:</span>
          <span className="info-value">{device_key || 'N/A'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Latitude:</span>
          <span className="info-value">{lat || 'N/A'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Longitude:</span>
          <span className="info-value">{lng || 'N/A'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Data da Localização:</span>
          <span className="info-value">{formatTimestamp(location_date)}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Localização no Mapa:</span>
          <span className="info-value">{getGoogleMapsLink(lat, lng)}</span>
        </div>
      </div>
    </div>
  );
};

export default DeviceInfoCard;

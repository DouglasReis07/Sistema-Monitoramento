import { useState } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import './Busca.css'; // Reutilizando o mesmo CSS

const GeofenceMap = () => {
  // Estados
  const [deviceName, setDeviceName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deviceData, setDeviceData] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: -14.235004, lng: -51.92528 });
  const [mapZoom, setMapZoom] = useState(4);
  const [showInfoCard, setShowInfoCard] = useState(false);

  // Função para buscar dispositivo pelo nome
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!deviceName.trim()) {
      setError('Por favor, informe o nome do dispositivo');
      return;
    }
    
    setError('');
    setIsLoading(true);
    setDeviceData(null);
    setShowInfoCard(false);

    try {
      const response = await axios.get('http://127.0.0.1:5004/api/devices/search/04427338879-464020', {
        headers: { 'x-api-key': '123456789' }
      });
      if (response.data.error) {
        setError('Dispositivo não encontrado');
        return;
      }
      
      const data = response.data;
      setDeviceData(data);
      setShowInfoCard(true);
      
      // Definir o centro do mapa para as coordenadas do dispositivo
      if (data.device_coords && data.device_coords[0] && data.device_coords[1]) {
        setMapCenter({
          lat: data.device_coords[0],
          lng: data.device_coords[1]
        });
        setMapZoom(17);
      }
      
    } catch (err) {
      setError('Erro ao buscar dispositivo');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Resetar a busca
  const resetSearch = () => {
    setDeviceName('');
    setDeviceData(null);
    setShowInfoCard(false);
    setMapCenter({ lat: -14.235004, lng: -51.92528 });
    setMapZoom(4);
  };

  return (
    <div className="map-layout">
      {/* Mapa ocupando toda a tela */}
      <div className="map-container">
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={mapCenter}
            zoom={mapZoom}
            options={{
              styles: [
                {
                  featureType: "poi",
                  stylers: [{ visibility: "off" }]
                },
                {
                  featureType: "transit",
                  elementType: "labels.icon",
                  stylers: [{ visibility: "off" }]
                }
              ],
              disableDefaultUI: true,
              zoomControl: true,
              streetViewControl: true
            }}
          >
            {/* Marcador do dispositivo */}
            {deviceData && deviceData.device_coords && deviceData.device_coords[0] && deviceData.device_coords[1] && (
              <Marker
                position={{
                  lat: deviceData.device_coords[0],
                  lng: deviceData.device_coords[1]
                }}
                icon={{
                  url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                  scaledSize: new window.google.maps.Size(40, 40)
                }}
              />
            )}
            
            {/* Marcador do CEP */}
            {deviceData && deviceData.cep_coords && deviceData.cep_coords[0] && deviceData.cep_coords[1] && (
              <Marker
                position={{
                  lat: deviceData.cep_coords[0],
                  lng: deviceData.cep_coords[1]
                }}
                icon={{
                  url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                  scaledSize: new window.google.maps.Size(40, 40)
                }}
              />
            )}
            
            {/* Linha entre os dois pontos */}
            {deviceData && 
              deviceData.device_coords && deviceData.device_coords[0] && deviceData.device_coords[1] &&
              deviceData.cep_coords && deviceData.cep_coords[0] && deviceData.cep_coords[1] && (
              <Polyline
                path={[
                  { lat: deviceData.device_coords[0], lng: deviceData.device_coords[1] },
                  { lat: deviceData.cep_coords[0], lng: deviceData.cep_coords[1] }
                ]}
                options={{
                  strokeColor: "#FF0000",
                  strokeOpacity: 0.8,
                  strokeWeight: 3,
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      {/* Header flutuante */}
      <motion.header 
        className="floating-header"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 15 }}
      >
        <div className="header-content">
          <motion.div 
            className="logo-section"
            whileHover={{ scale: 1.05 }}
          >
            <span className="counter-icon">📍</span>
            <h1 className="app-title">Jupiter v3.0</h1>
          </motion.div>
        </div>
      </motion.header>

      {/* Overlay de busca centralizado */}
      <div className="search-overlay">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="input-group">
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="Digite o nome do dispositivo"
              className="search-input"
            />
            <div className="button-group">
              <motion.button
                type="submit"
                className="search-button"
                disabled={isLoading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <span className="icon">🔍</span> Buscar
                  </>
                )}
              </motion.button>
              <motion.button
                type="button"
                className="reset-button"
                onClick={resetSearch}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="icon">🔄</span> Limpar
              </motion.button>
            </div>
          </div>
        </form>
      </div>

      {/* Mensagens de erro sobrepostas */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="error-overlay"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card de informações do dispositivo */}
      <AnimatePresence>
        {deviceData && showInfoCard && (
          <motion.div
            className="device-card-overlay"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="card-header">
              <h3>Detalhes do Dispositivo</h3>
              <button className="close-button" onClick={() => setShowInfoCard(false)}>
                &times;
              </button>
            </div>
            
            <div className="card-content">
              <div className="info-row">
                <span className="info-label">Nome:</span>
                <span className="info-value">{deviceData.name || 'N/A'}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">CEP:</span>
                <span className="info-value">{deviceData.cep || 'N/A'}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Número:</span>
                <span className="info-value">{deviceData.numero || 'N/A'}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Código:</span>
                <span className="info-value">{deviceData.codigo || 'N/A'}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Caso:</span>
                <span className="info-value">{deviceData.caso || 'N/A'}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Device Key:</span>
                <span className="info-value">{deviceData.device_key || 'N/A'}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Distância (metros):</span>
                <span className="info-value">
                  {deviceData.distance_meters ? deviceData.distance_meters.toFixed(2) : 'N/A'}
                </span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Modelo:</span>
                <span className="info-value">{deviceData.model || 'N/A'}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{deviceData.email || 'N/A'}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Status Geocerca:</span>
                <span className="info-value">{deviceData.status_geocerca || 'N/A'}</span>
              </div>
              
              {/* Novos campos de data */}
              <div className="info-row">
                <span className="info-label">Data de Localização:</span>
                <span className="info-value">{deviceData.location_date || 'N/A'}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Data:</span>
                <span className="info-value">{deviceData.date || 'N/A'}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Último Heartbeat:</span>
                <span className="info-value">{deviceData.heartbeat_time || 'N/A'}</span>
              </div>
              
              <div className="coordinates-container">
                <div className="coordinate-section">
                  <h4>Coordenadas do Dispositivo</h4>
                  <p>Latitude: {deviceData.device_coords?.[0]?.toFixed(6) || 'N/A'}</p>
                  <p>Longitude: {deviceData.device_coords?.[1]?.toFixed(6) || 'N/A'}</p>
                </div>
                
                <div className="coordinate-section">
                  <h4>Coordenadas do CEP</h4>
                  <p>Latitude: {deviceData.cep_coords?.[0]?.toFixed(6) || 'N/A'}</p>
                  <p>Longitude: {deviceData.cep_coords?.[1]?.toFixed(6) || 'N/A'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer flutuante */}
      <footer className="floating-footer">
        <p>Jupiter &copy; {new Date().getFullYear()}</p>
        <p>Sistema de monitoramento de geocercas</p>
      </footer>
    </div>
  );
};

export default GeofenceMap;
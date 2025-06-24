import { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import './Busca.css';

const BuscaCliente = () => {
  // Estados
  const [numeroContrato, setNumeroContrato] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [allDevices, setAllDevices] = useState([]);
  const [allMarkers, setAllMarkers] = useState([]);
  const [filteredMarkers, setFilteredMarkers] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceAddress, setDeviceAddress] = useState('');
  const [showAllMarkers, setShowAllMarkers] = useState(true);
  const [mapCenter, setMapCenter] = useState({ lat: -14.235004, lng: -51.92528 });
  const [mapZoom, setMapZoom] = useState(4);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Carregar dispositivos
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('https://03ae-187-32-76-162.ngrok-free.app:5004/api/devices', {
          headers: { 'x-api-key': '123456789' }
        });
        
        if (response.data) {
          // Transformação de dados otimizada
          const devicesArray = Object.entries(response.data).flatMap(([email, userData]) => 
            userData.devices?.map(device => ({ ...device, email })) || []
          );
          
          setAllDevices(devicesArray);
          
          // Criação de marcadores otimizada
          const markers = devicesArray.reduce((acc, device) => {
            const position = getDevicePosition(device);
            return position ? [...acc, {
              id: device.device_key,
              position,
              device: { ...device, ...position }
            }] : acc;
          }, []);
          
          setAllMarkers(markers);
          setFilteredMarkers(markers);
          
          if (markers.length > 0) {
            setMapCenter(markers[0].position);
            setMapZoom(10);
          }
        }
      } catch (error) {
        setError('Falha ao carregar dispositivos. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDevices();
  }, []);

  // Funções auxiliares
  const getDevicePosition = (device) => {
    if (device.status?.lat && device.status?.lng && 
        device.status.lat !== 0 && device.status.lng !== 0) {
      return { lat: device.status.lat, lng: device.status.lng };
    } 
    if (device.lbs_position?.lat && device.lbs_position?.lng) {
      return { lat: device.lbs_position.lat, lng: device.lbs_position.lng };
    }
    return null;
  };

  const fetchAddress = async (lat, lng) => {
    if (!lat || !lng) {
      setDeviceAddress('Endereço indisponível');
      return;
    }
    
    setDeviceAddress('Buscando endereço...');
    
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      );
      
      setDeviceAddress(
        response.data.results?.[0]?.formatted_address || 
        'Endereço não encontrado'
      );
    } catch {
      setDeviceAddress('Erro ao buscar endereço');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!numeroContrato.trim()) {
      setError('Por favor, informe a chave natural');
      return;
    }
    
    setError('');
    setSelectedDevice(null);
    setIsLoading(true);

    try {
      const device = allDevices.find(d => d.config?.name === numeroContrato);
      
      if (!device) {
        setError('Dispositivo não encontrado');
        return;
      }
      
      const position = getDevicePosition(device);
      
      if (!position) {
        setError('Coordenadas indisponíveis');
        return;
      }
      
      // Atualiza o mapa e dispositivo selecionado
      setMapCenter(position);
      setMapZoom(17);
      setSelectedDevice({ ...device, ...position });
      setFilteredMarkers([{ id: device.device_key, position, device }]);
      setShowAllMarkers(false);
      fetchAddress(position.lat, position.lng);
    } catch {
      setError('Erro na busca');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setNumeroContrato('');
    setSelectedDevice(null);
    setFilteredMarkers(allMarkers);
    setShowAllMarkers(true);
    setMapCenter({ lat: -14.235004, lng: -51.92528 });
    setMapZoom(4);
  };

  return (
    <div className="map-layout">
      {/* Mapa ocupando toda a tela */}
      <div className="map-container">
        {!isMapLoaded && (
          <div className="map-skeleton">
            <div className="skeleton-loader"></div>
            <p>Carregando mapa...</p>
          </div>
        )}
        
        <LoadScript 
          googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
          onLoad={() => setIsMapLoaded(true)}
        >
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
            {(showAllMarkers ? allMarkers : filteredMarkers).map(marker => (
              <Marker
                key={marker.id}
                position={marker.position}
                onClick={() => {
                  setSelectedDevice(marker.device);
                  setMapCenter(marker.position);
                  setMapZoom(17);
                  fetchAddress(marker.position.lat, marker.position.lng);
                }}
                icon={{
                  url: marker.id === (selectedDevice?.device_key || '') 
                    ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                    : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                  scaledSize: new window.google.maps.Size(40, 40)
                }}
              />
            ))}
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
            <h1 className="app-title">Jupiter</h1>
          </motion.div>
        </div>
      </motion.header>

      {/* Overlay de busca centralizado */}
      <div className="search-overlay">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="input-group">
            <input
              type="text"
              value={numeroContrato}
              onChange={(e) => setNumeroContrato(e.target.value)}
              placeholder="Digite a Chave Natural"
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
        {selectedDevice && (
          <motion.div
            className="device-card-overlay"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="card-header">
              <h3>Informações do Dispositivo</h3>
              <button className="close-button" onClick={() => setSelectedDevice(null)}>
                &times;
              </button>
            </div>
            
            <div className="card-content">
              <div className="info-row">
                <span className="info-label">Chave:</span>
                <span className="info-value">{selectedDevice.config?.name || 'N/A'}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{selectedDevice.email || 'N/A'}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Modelo:</span>
                <span className="info-value">{selectedDevice.model || 'N/A'}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Endereço:</span>
                <span className="info-value">{deviceAddress || 'Carregando...'}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Última atualização:</span>
                <span className="info-value">
                  {selectedDevice.status?.location_date 
                    ? new Date(selectedDevice.status.location_date).toLocaleString() 
                    : 'N/A'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contador de dispositivos */}
      <motion.div 
        className="counter-overlay"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="counter-content">
          <span className="counter-icon">📍</span>
          {allMarkers.length} dispositivos ativos
        </div>
      </motion.div>

      {/* Footer flutuante */}
      <footer className="floating-footer">
        <p>Jupiter power Loovi &copy; {new Date().getFullYear()}</p>
        <p>Atualizado em: {new Date().toLocaleDateString('pt-BR')}</p>
      </footer>
    </div>
  );
};

export default BuscaCliente;
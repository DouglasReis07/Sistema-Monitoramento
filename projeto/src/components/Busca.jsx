import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Busca.css';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import DeviceInfoCard from './DeviceInfoCard';
import { motion } from 'framer-motion'; // Importando Framer Motion para animações

const BuscaCliente = () => {
  const navigate = useNavigate();
  const [numeroContrato, setNumeroContrato] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceAddress, setDeviceAddress] = useState('');
  const [hasSearched, setHasSearched] = useState(false); // Novo estado para controlar se já fez busca

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get('http://192.168.0.94:5000/get-devices-data', {
          headers: { 'X-API-KEY': process.env.REACT_APP_API_KEY },
        });
        if (response.data && response.data.devices) {
          setDevices(response.data.devices);
        } else {
          setError('Erro ao carregar os dispositivos.');
        }
      } catch (error) {
        setError('Falha ao carregar a lista de dispositivos. Verifique a conexão.');
      }
    };
    fetchDevices();
  }, []);

  const fetchAddress = async (lat, lng) => {
    if (!lat && !lng) {
      setDeviceAddress('Endereço não disponível (coordenadas zeradas)');
      return;
    }
    setDeviceAddress('Buscando endereço...');
    try {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.REACT_APP_Maps_API_KEY}`;
      const response = await axios.get(geocodeUrl);
      if (response.data.results && response.data.results.length > 0) {
        setDeviceAddress(response.data.results[0].formatted_address);
      } else {
        setDeviceAddress('Endereço não encontrado para estas coordenadas.');
      }
    } catch (error) {
      setDeviceAddress('Não foi possível buscar o endereço.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSelectedDevice(null);
    setDeviceAddress('');

    if (!numeroContrato.trim()) {
      setError('Por favor, insira o número do contrato');
      return;
    }

    setIsLoading(true);

    try {
      const filteredDevice = devices.find(
        (device) => device.config?.name === numeroContrato
      );

      if (filteredDevice) {
        const { lat, lng } = filteredDevice.status;
        if (typeof lat !== 'undefined' && typeof lng !== 'undefined') {
          setMapCoordinates({ lat, lng });
          setSelectedDevice(filteredDevice);
          fetchAddress(lat, lng);
          setHasSearched(true); // Marca que já fez uma busca
        } else {
          setError('Coordenadas inválidas ou não informadas.');
        }
      } else {
        setError('Dispositivo não encontrado.');
      }
    } catch (error) {
      setError('Erro ao buscar os dados. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCloseCard = () => {
    setSelectedDevice(null);
    setMapCoordinates(null);
  };

  return (
    <div className="busca-container">
      <header className="header">
        <img src="/logo.png" alt="JUPITER" className="logo" />
        <div className="header-actions">
          <form onSubmit={handleSubmit} className="header-form">
            <input
              type="text"
              id="contrato"
              value={numeroContrato}
              onChange={(e) => setNumeroContrato(e.target.value)}
              placeholder="Digite a Chave Natural do cliente"
              className="header-input"
            />
            <button type="submit" className="header-button" disabled={isLoading}>
              {isLoading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>
        </div>
      </header>

      <main className="map-main">
        {error && <p className="error-message">{error}</p>}
        
        {selectedDevice && (
          <DeviceInfoCard 
            device={selectedDevice} 
            address={deviceAddress}
            onClose={handleCloseCard}
          />
        )}

        {hasSearched ? (
          <div className="map-container">
            <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={mapCoordinates || { lat: -14.235004, lng: -51.92528 }}
                zoom={mapCoordinates ? 17 : 4}
                options={{ streetViewControl: false, mapTypeControl: false }}
              >
                {mapCoordinates && <Marker position={mapCoordinates} />}
              </GoogleMap>
            </LoadScript>
          </div>
        ) : (
          <motion.div 
            className="initial-animation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="animation-content">
              <motion.div 
                className="pulse-circle"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#4285F4"/>
                </svg>
              </motion.div>
              <h2>Localize seu cliente</h2>
              <p>Digite a Chave Natural acima para visualizar a localização no mapa</p>
              <motion.div 
                className="arrow-down"
                animate={{
                  y: [0, 10, 0]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
              
              </motion.div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default BuscaCliente;
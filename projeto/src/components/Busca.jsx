import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Busca.css';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import DeviceInfoCard from './DeviceInfoCard'; // Importe o novo componente

const BuscaCliente = () => {
  const navigate = useNavigate();
  const [numeroContrato, setNumeroContrato] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState(null);
  const [devices, setDevices] = useState([]);
  
  // Novo estado para guardar os dados do dispositivo encontrado
  const [selectedDevice, setSelectedDevice] = useState(null);
  // Novo estado para o endereço buscado via geocodificação
  const [deviceAddress, setDeviceAddress] = useState('');

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

  // Função para buscar o endereço a partir das coordenadas
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
    setSelectedDevice(null); // Limpa o card anterior
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
          setSelectedDevice(filteredDevice); // Guarda o dispositivo encontrado
          fetchAddress(lat, lng); // Busca o endereço
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
          <button onClick={() => navigate('/')} className="header-back-button">
            Voltar
          </button>
        </div>
      </header>

      <main className="map-main">
        {error && <p className="error-message">{error}</p>}
        
        {/* Card de informações do dispositivo */}
        {selectedDevice && (
          <DeviceInfoCard 
            device={selectedDevice} 
            address={deviceAddress}
            onClose={handleCloseCard}
          />
        )}

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
        
        {!mapCoordinates && !error && (
          <p className="placeholder">Pesquise um cliente para visualizar sua localização no mapa.</p>
        )}
      </main>
    </div>
  );
};

export default BuscaCliente;
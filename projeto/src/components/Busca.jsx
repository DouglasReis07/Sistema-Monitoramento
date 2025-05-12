import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Busca.css';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const BuscaCliente = () => {
  const navigate = useNavigate();
  const [numeroContrato, setNumeroContrato] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState(null);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get('http://10.0.0.64:5000/get-devices-data');
        if (response.data && response.data.devices) {
          setDevices(response.data.devices);
        } else {
          setError('Erro ao carregar os dispositivos.');
        }
      } catch (error) {
        setError('Erro ao carregar os dispositivos.');
      }
    };

    fetchDevices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!numeroContrato.trim()) {
      setError('Por favor, insira o número do contrato');
      return;
    }

    setIsLoading(true);

    try {
      const filteredDevice = devices.find(device => device.config?.name === numeroContrato);

      if (filteredDevice) {
        const { lat: latitude, lng: longitude } = filteredDevice.status;
        if (latitude && longitude) {
          setMapCoordinates({ lat: latitude, lng: longitude });
        } else {
          setError('Coordenadas inválidas recebidas.');
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

  return (
    <div className="busca-container">
      <div className="busca-box">
        <h1 className="busca-title">Buscar Chave Natural</h1>
        <p className="busca-subtitle">Informe o número da chave natural do cliente</p>

        <form className="busca-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="contrato" className="form-label">Buscar Cliente</label>
            <input
  type="text"
  id="contrato"
  value={numeroContrato}
  onChange={(e) => setNumeroContrato(e.target.value)}
  placeholder="Digite a Chave Natural do cliente"
  className={`form-input ${error ? 'input-error' : ''}`}
/>

            {error && <span className="error-message">{error}</span>}
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Buscando...' : 'Buscar Cliente'}
          </button>
        </form>

        {mapCoordinates && (
          <div className="map-container">
            <LoadScript googleMapsApiKey="AIzaSyDi6KSLEamd-XEGKF3vtk5B0J5bLwchLcs">
              <GoogleMap
                mapContainerStyle={{ width: '600px', height: '450px' }}
                center={mapCoordinates}
                zoom={15}
              >
                <Marker position={mapCoordinates} />
              </GoogleMap>
            </LoadScript>
          </div>
        )}

        <button 
          onClick={() => navigate('/')}
          className="voltar-button"
        >
          Voltar para Login
        </button>
      </div>
    </div>
  );
};

export default BuscaCliente;

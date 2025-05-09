import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [userData, setUserData] = useState({
    userName: 'Usuário',
    userEmail: 'email@exemplo.com'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showPipelineButton, setShowPipelineButton] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentProcess, setCurrentProcess] = useState('');
  const [carDirection, setCarDirection] = useState('right');
  const [devicesOutsideGeofence, setDevicesOutsideGeofence] = useState(0);
  const [devicesInsideGeofence, setDevicesInsideGeofence] = useState(0);
  const [totalDevices, setTotalDevices] = useState(0);
  const [showVerifyAgain, setShowVerifyAgain] = useState(false);
  const [showDevicesModal, setShowDevicesModal] = useState(false);
  const [devicesOutsideList, setDevicesOutsideList] = useState([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [showTicketsModal, setShowTicketsModal] = useState(false);
  const [ticketsData, setTicketsData] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  
  const userPhoto = 'https://media.licdn.com/dms/image/v2/D4D0BAQHpJGnF5-GZZA/company-logo_200_200/company-logo_200_200/0/1667321694116/loovibrasil_logo?e=2147483647&v=beta&t=avAmwjkQlBYBy8GvwWQb2wVaT-4i8rLgn26_bpmOLa0';
  const progressInterval = useRef(null);

  const fetchDevicesData = async () => {
    try {
      const response = await axios.get('http://10.0.0.249:5000/get-devices-data');
      
      if (response.data && response.data.code === 0 && Array.isArray(response.data.devices)) {
        const devices = response.data.devices;
        setTotalDevices(devices.length);
        return devices.length;
      }
      throw new Error('Estrutura de dados inválida');
    } catch (error) {
      console.error('Erro ao buscar dispositivos:', error);
      setTotalDevices(0);
      return 0;
    }
  };

  const fetchDevicesOutsideList = async () => {
    setIsLoadingDevices(true);
    try {
      const response = await axios.get('http://10.0.0.249:5000/get-processed-status');
      
      if (response.data && typeof response.data === 'object') {
        const devicesArray = Object.entries(response.data).map(([deviceId, deviceData]) => {
          const rawStatus = deviceData?.status || "STATUS_INDEFINIDO";
          const status = rawStatus.replace(/_/g, ' ');
          
          const rawDateTime = deviceData?.timestamp || deviceData?.send_date;
          let dateTime = "N/A";
          
          if (rawDateTime) {
            try {
              dateTime = new Date(rawDateTime).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              });
            } catch (e) {
              console.warn("Formato de data inválido:", rawDateTime);
              dateTime = rawDateTime.toString();
            }
          }
          
          const message = deviceData?.message || "Nenhuma mensagem disponível";

          return {
            deviceId,
            status,
            dateTime,
            message
          };
        });
        
        setDevicesOutsideList(devicesArray);
        setDevicesOutsideGeofence(devicesArray.length);
        setDevicesInsideGeofence(totalDevices - devicesArray.length);
      } else {
        console.error('Resposta inválida do servidor:', response.data);
        setDevicesOutsideList([]);
      }
    } catch (error) {
      console.error('Erro ao buscar status dos dispositivos:', error);
      setDevicesOutsideList([]);
    } finally {
      setIsLoadingDevices(false);
    }
  };

  const fetchTicketsData = async () => {
    setIsLoadingTickets(true);
    try {
      // Executa o próximo passo
      await axios.post('http://10.0.0.249:5000/run-next-step');
      
      // Busca os tickets atualizados
      const response = await axios.get('http://10.0.0.249:5000/get-tickets2');
      
      if (response.data && Array.isArray(response.data)) {
        setTicketsData(response.data.map(ticket => {
          const nameParts = ticket.name?.split('|') || [];
          const userName = nameParts[0]?.trim() || 'N/A';
          const deviceId = nameParts[1]?.trim() || 'N/A';
          
          return {
            userName,
            deviceId,
            alerts: ticket.alerts?.join(', ') || 'Nenhum alerta',
            locationDate: ticket.location_date ? 
              new Date(ticket.location_date).toLocaleString('pt-BR') : 'N/A',
            status: ticket.status || 'PENDENTE'
          };
        }));
      } else {
        console.error('Resposta inválida do servidor para tickets:', response.data);
        setTicketsData([]);
      }
    } catch (error) {
      console.error('Erro ao buscar tickets:', error);
      setTicketsData([]);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const refreshDevicesList = async () => {
    try {
      setIsLoadingDevices(true);
      await axios.post('http://10.0.0.249:5000/run-status-commands');
      await fetchDevicesOutsideList();
    } catch (error) {
      console.error('Erro ao atualizar dispositivos:', error);
    } finally {
      setIsLoadingDevices(false);
    }
  };

  const handleOutsideCardClick = async () => {
    if (totalDevices > 0) {
      setShowDevicesModal(true);
      await refreshDevicesList();
    }
  };

  const handleVerifyAgain = async () => {
    setShowTicketsModal(true);
    await fetchTicketsData();
  };

  useEffect(() => {
    if (location.state) {
      setUserData({
        userName: location.state.userName,
        userEmail: location.state.userEmail
      });
      localStorage.setItem('user', JSON.stringify(location.state));
    } else {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUserData(JSON.parse(savedUser));
      }
    }
    fetchDevicesData();
  }, [location]);

  useEffect(() => {
    let interval;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setShowVerifyAgain(true);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
    window.location.reload();
  };

  const handleSettings = () => {
    navigate('/settings');
    setShowUserMenu(false);
  };

  const handleRunPipeline = async () => {
    setIsLoading(true);
    setLoadingProgress(0);
    setCurrentProcess("Processando verificação...");
    setCarDirection('right');
    setShowVerifyAgain(false);

    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    try {
      progressInterval.current = setInterval(() => {
        setLoadingProgress(prev => {
          const newProgress = prev + Math.random() * 3;
          return Math.min(newProgress, 100);
        });
      }, 300);

      await axios.post('http://10.0.0.249:5000/run-pipeline');

      clearInterval(progressInterval.current);
      setLoadingProgress(100);
      setCurrentProcess("Verificação concluída com sucesso!");
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const total = await fetchDevicesData();
      await refreshDevicesList();
      
      setTimer(1 * 60);
      setIsTimerRunning(true);
      setShowVerifyAgain(false);
      setShowPipelineButton(false);
    } catch (error) {
      console.error('Erro ao executar o pipeline:', error);
      setCurrentProcess("Erro no processamento!");
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="logo">JÚPITER</h1>
          <div className="user-area" onClick={() => setShowUserMenu(!showUserMenu)}>
            <div className="user-name-photo">
              <span className="username">{userData.userName}</span>
              <img src={userPhoto} alt={`Foto de ${userData.userName}`} className="user-photo"/>
            </div>
            {showUserMenu && (
              <div className="user-menu">
                <div className="user-info">
                  <img src={userPhoto} alt={`Foto de ${userData.userName}`} className="menu-user-photo"/>
                  <div>
                    <p className="menu-username">{userData.userName}</p>
                    <p className="menu-useremail">{userData.userEmail}</p>
                  </div>
                </div>
                <button className="menu-item settings-button" onClick={handleSettings}>
                  Configurações
                </button>
                <button className="menu-item logout-button" onClick={handleLogout}>
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="dashboard-main-content">
        <div className="pipeline-section">
          {showPipelineButton && (
            <button
              className={`pipeline-button ${isLoading ? 'loading' : ''}`}
              onClick={handleRunPipeline}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loading-content">
                  <div className="loader"></div>
                  <span>Aguarde enquanto a IA faz a verificação!</span>
                  <div className="progress-animation-container">
                    <div 
                      className="car-position" 
                      style={{ left: `${loadingProgress}%` }}
                    >
                      <div className={`car-icon ${carDirection}`}>🚀</div>
                    </div>
                    <div className="progress-info">
                      <div className="current-process">
                        {currentProcess}
                        {loadingProgress < 100 && (
                          <div className="process-ellipsis">
                            <span>.</span><span>.</span><span>.</span>
                          </div>
                        )}
                      </div>
                      <div className="progress-track">
                        <div 
                          className="progress-bar" 
                          style={{ width: `${loadingProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                '🚀 INICIAR VERIFICAÇÃO'
              )}
            </button>
          )}
        </div>

        <div className="geofence-cards-container">
          <div className="geofence-card total">
            <h3>Total de Dispositivos</h3>
            <div className="geofence-value">{totalDevices.toLocaleString()}</div>
            <div className="geofence-subtext">
              {totalDevices === 1 ? '1 dispositivo' : `${totalDevices.toLocaleString()} dispositivos`}
            </div>
          </div>
          <div 
            className="geofence-card outside" 
            onClick={handleOutsideCardClick}
            style={{ cursor: totalDevices > 0 ? 'pointer' : 'default' }}
          >
            <h3>Fora da Geofence</h3>
            <div className="geofence-value">{devicesOutsideGeofence.toLocaleString()}</div>
            <div className="geofence-subtext">
              {totalDevices > 0 ? `${Math.round((devicesOutsideGeofence / totalDevices) * 100)}% do total` : '0%'}
            </div>
          </div>
          <div className="geofence-card inside">
            <h3>Dentro da Geofence</h3>
            <div className="geofence-value">{devicesInsideGeofence.toLocaleString()}</div>
            <div className="geofence-subtext">
              {totalDevices > 0 ? `${Math.round((devicesInsideGeofence / totalDevices) * 100)}% do total` : '0%'}
            </div>
          </div>
        </div>

        {isTimerRunning ? (
          <div className="timer-container">
            <div className="hourglass-icon">
              <div className={`hourglass ${timer % 2 === 0 ? 'flip' : ''}`}>⏳</div>
            </div>
            <div className="timer-display">
              <h2 className="results-title">PRÓXIMA VERIFICAÇÃO</h2>
              <div className="timer-value">
                {formatTime(timer)}
              </div>
            </div>
          </div>
        ) : showVerifyAgain ? (
          <div className="timer-container">
            <button className="restart-verification-button" onClick={handleVerifyAgain}>
               VERIFICAR NOVAMENTE
            </button>
          </div>
        ) : null}

        {showDevicesModal && (
          <div className="modal-overlay">
            <div className="devices-modal">
              <div className="modal-header">
                <h2>Dispositivos Fora da Geofence ({devicesOutsideList.length})</h2>
                <div>
                  <button 
                    onClick={refreshDevicesList}
                    disabled={isLoadingDevices}
                    className="refresh-button"
                  >
                    {isLoadingDevices ? (
                      <>
                        <span className="refresh-icon">🔄</span> Atualizando...
                      </>
                    ) : (
                      <>
                        <span className="refresh-icon">🔄</span> Atualizar
                      </>
                    )}
                  </button>
                  <button 
                    className="close-modal" 
                    onClick={() => setShowDevicesModal(false)}
                  >
                    &times;
                  </button>
                </div>
              </div>
              <div className="modal-content">
                {isLoadingDevices ? (
                  <div className="loading-devices">
                    <div className="loader"></div>
                    <span>Carregando dispositivos...</span>
                  </div>
                ) : devicesOutsideList.length > 0 ? (
                  <div className="devices-table-container">
                    <table className="devices-table">
                      <thead>
                        <tr>
                          <th>ID do Dispositivo</th>
                          <th>Status</th>
                          <th>Data e Hora</th>
                          <th>Mensagem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {devicesOutsideList.map((device, index) => (
                          <tr key={index}>
                            <td>{device.deviceId}</td>
                            <td>
                              <span className={`status-badge ${
                                device.status.includes("ACATADO") ? 'acatado' 
                                : device.status.includes("AGUARDANDO") ? 'aguardando'
                                : 'default-status'
                              }`}>
                                {device.status}
                              </span>
                            </td>
                            <td>{device.dateTime}</td>
                            <td>{device.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="no-devices">
                    Nenhum dispositivo encontrado fora da geofence.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showTicketsModal && (
          <div className="modal-overlay">
            <div className="devices-modal">
              <div className="modal-header">
                <h2>Tickets Gerados ({ticketsData.length})</h2>
                <div>
                  <button 
                    onClick={fetchTicketsData}
                    disabled={isLoadingTickets}
                    className="refresh-button"
                  >
                    {isLoadingTickets ? (
                      <>
                        <span className="refresh-icon">🔄</span> Atualizando...
                      </>
                    ) : (
                      <>
                        <span className="refresh-icon">🔄</span> Atualizar
                      </>
                    )}
                  </button>
                  <button 
                    className="close-modal" 
                    onClick={() => setShowTicketsModal(false)}
                  >
                    &times;
                  </button>
                </div>
              </div>
              <div className="modal-content">
                {isLoadingTickets ? (
                  <div className="loading-devices">
                    <div className="loader"></div>
                    <span>Carregando tickets...</span>
                  </div>
                ) : ticketsData.length > 0 ? (
                  <div className="devices-table-container">
                    <table className="devices-table">
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>ID do Dispositivo</th>
                          <th>Alertas</th>
                          <th>Data/Hora Localização</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ticketsData.map((ticket, index) => (
                          <tr key={index}>
                            <td>{ticket.userName}</td>
                            <td>{ticket.deviceId}</td>
                            <td>{ticket.alerts}</td>
                            <td>{ticket.locationDate}</td>
                            <td>
                              <span className={`status-badge ${
                                ticket.status === "RESOLVIDO" ? 'acatado' 
                                : ticket.status === "PENDENTE" ? 'aguardando'
                                : 'default-status'
                              }`}>
                                {ticket.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="no-devices">
                    Nenhum ticket encontrado.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
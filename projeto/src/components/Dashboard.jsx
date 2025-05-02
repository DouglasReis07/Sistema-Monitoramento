import { useState, useEffect } from 'react';
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
  const [processedData, setProcessedData] = useState([]);
  const [showPipelineButton, setShowPipelineButton] = useState(true);
  const userPhoto = 'https://media.licdn.com/dms/image/v2/D4D0BAQHpJGnF5-GZZA/company-logo_200_200/company-logo_200_200/0/1667321694116/loovibrasil_logo?e=2147483647&v=beta&t=avAmwjkQlBYBy8GvwWQb2wVaT-4i8rLgn26_bpmOLa0';

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
  }, [location]);

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

    try {
      await axios.post('http://10.0.1.93:5000/run-pipeline');
      pollProcessedStatus();
      setShowPipelineButton(false);
    } catch (error) {
      console.error('Erro ao executar o pipeline:', error);
      alert('Erro ao executar o pipeline. Verifique o console para mais detalhes.');
    } finally {
      setIsLoading(false);
    }
  };

  const pollProcessedStatus = async () => {
    try {
      // Primeiro, consome o endpoint /run-status-commands
      await axios.post('http://10.0.1.93:5000/run-status-commands');

      // Em seguida, consome o endpoint /get-processed-status para atualizar os dados da tabela
      const response = await axios.get('http://10.0.1.93:5000/get-processed-status');
      if (response.data && Object.keys(response.data).length > 0) {
        setProcessedData(Object.entries(response.data)); // Atualiza os dados processados
      } else {
        alert('Nenhum dado encontrado. Tente novamente mais tarde.');
      }
    } catch (error) {
      console.error('Erro ao buscar o status processado:', error);
      alert('Erro ao buscar os dados. Verifique o console para mais detalhes.');
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="logo">GARY</h1>

          <div 
            className="user-area" 
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-name-photo">
              <span className="username">{userData.userName}</span>
              <img 
                src={userPhoto} 
                alt={`Foto de ${userData.userName}`} 
                className="user-photo"
              />
            </div>

            {showUserMenu && (
              <div className="user-menu">
                <div className="user-info">
                  <img
                    src={userPhoto}
                    alt={`Foto de ${userData.userName}`}
                    className="menu-user-photo"
                  />
                  <div>
                    <p className="menu-username">{userData.userName}</p>
                    <p className="menu-useremail">{userData.userEmail}</p>
                  </div>
                </div>

                <button
                  className="menu-item settings-button"
                  onClick={handleSettings}
                >
                  Configurações
                </button>

                <button
                  className="menu-item logout-button"
                  onClick={handleLogout}
                >
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
                </div>
              ) : (
                <>
                  🚀 Rodar Pipeline
                </>
              )}
            </button>
          )}
        </div>

        {processedData.length > 0 && (
          <div className="results-section">
            <div className="results-header">
              <h2 className="results-title">Resultados do Processamento</h2>
              <button className="refresh-button" onClick={pollProcessedStatus}>
                Atualizar
              </button>
            </div>
            <div className="table-container">
              <table className="processed-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Status</th>
                    <th>Mensagem</th>
                    <th>Data de Envio</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {processedData.map(([key, value]) => (
                    <tr key={key}>
                      <td>{value.id}</td>
                      <td>{value.status}</td>
                      <td>{value.message}</td>
                      <td>{value.send_date}</td>
                      <td>{value.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [userData, setUserData] = useState({
    userName: 'Usuário',
    userEmail: 'email@exemplo.com'
  });

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

  const [showUserMenu, setShowUserMenu] = useState(false);
  const userPhoto = 'https://media.licdn.com/dms/image/v2/D4D0BAQHpJGnF5-GZZA/company-logo_200_200/company-logo_200_200/0/1667321694116/loovibrasil_logo?e=2147483647&v=beta&t=avAmwjkQlBYBy8GvwWQb2wVaT-4i8rLgn26_bpmOLa0';

  const handleLogout = () => {
    // 1. Limpa os dados do usuário
    localStorage.removeItem('user');
    
    // 2. Redireciona para a tela de login
    navigate('/login', { 
      replace: true // Impede voltar com o botão "voltar"
    });
    
    // 3. (Opcional) Força recarregamento para limpar estados
    window.location.reload();
  };

  const handleSettings = () => {
    navigate('/settings');
    setShowUserMenu(false);
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
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

    </div>
  );
};

export default Dashboard;
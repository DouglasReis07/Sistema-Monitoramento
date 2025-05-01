import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import users from '../data/users.json'; // Importe o JSON de usuários
import './Dashboard.css';

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estado para armazenar os dados CORRETOS do usuário
  const [userData, setUserData] = useState({
    userName: '',
    userEmail: ''
  });

  // Carrega os dados do usuário logado
  useEffect(() => {
    // 1. Tenta pegar dos dados de navegação
    if (location.state) {
      setUserData({
        userName: location.state.userName,
        userEmail: location.state.userEmail
      });
    } 
    // 2. Se não tiver, busca do localStorage
    else {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUserData(JSON.parse(savedUser));
      }
      // 3. Se não tiver no localStorage, busca do JSON
      else {
        const loggedUserEmail = localStorage.getItem('loggedUserEmail');
        if (loggedUserEmail) {
          const userFromJson = users.find(u => u.email === loggedUserEmail);
          if (userFromJson) {
            setUserData({
              userName: userFromJson.name,
              userEmail: userFromJson.email
            });
          }
        }
      }
    }
  }, [location]);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const userPhoto = 'https://media.licdn.com/dms/image/v2/D4D0BAQHpJGnF5-GZZA/company-logo_200_200/company-logo_200_200/0/1667321694116/loovibrasil_logo?e=2147483647&v=beta&t=avAmwjkQlBYBy8GvwWQb2wVaT-4i8rLgn26_bpmOLa0';

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('loggedUserEmail');
    navigate('/login', { replace: true });
  };

  const handleDashboard = () => {
    navigate('/dashboard', { state: userData });
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="logo">GARRY</h1>
          
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
                  onClick={handleDashboard}
                >
                  Voltar ao Dashboard
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

      <main className="dashboard-content">
        <h2>DOCUMENTAÇÃO</h2>
      </main>
    </div>
  );
};

export default Settings;
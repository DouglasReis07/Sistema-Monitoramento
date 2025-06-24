import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import './Busca.css'; // Usando o mesmo CSS principal

// Registra os componentes necessários do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const Dashboard = ({ onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://192.168.3.71:5004/api/status', {
          headers: { 'x-api-key': '123456789' }
        });
        setStats(response.data);
      } catch (err) {
        setError('Falha ao carregar as estatísticas.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Configuração dos dados para o gráfico de pizza (Doughnut)
  const chartData = {
    labels: ['Com GPS Válido', 'Com LBS', 'Sem Localização'],
    datasets: [
      {
        label: '# de Dispositivos',
        data: [
          stats?.dispositivos_com_gps_valido || 0,
          stats?.dispositivos_com_lbs || 0,
          stats?.dispositivos_sem_localizacao || 0,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
            color: '#ffffff'
        }
      },
      title: {
        display: true,
        text: 'Distribuição de Localização dos Dispositivos Hoje',
        font: {
            size: 18
        },
        color: '#ffffff'
      },
    },
  };

  return (
    <motion.div
      className="dashboard-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="dashboard-content"
        initial={{ y: "100vh" }}
        animate={{ y: 0 }}
        exit={{ y: "100vh" }}
        transition={{ type: 'spring', damping: 20, stiffness: 150 }}
      >
        <div className="dashboard-header">
          <h2>Dashboard de Relatórios</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {loading && <div className="spinner-container"><div className="spinner"></div></div>}
        {error && <p className="error-message">{error}</p>}
        
        {stats && !loading && (
          <div className="stats-grid">
            <div className="main-chart">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
            <div className="kpi-cards">
                <div className="kpi-card">
                  <h4>Total Hoje</h4>
                  <p>{stats.total_dispositivos_hoje}</p>
                </div>
                 <div className="kpi-card">
                  <h4>Com GPS</h4>
                  <p>{stats.dispositivos_com_gps_valido} ({stats.percentuais.com_gps})</p>
                </div>
                 <div className="kpi-card">
                  <h4>Com LBS</h4>
                  <p>{stats.dispositivos_com_lbs} ({stats.percentuais.com_lbs})</p>
                </div>
                 <div className="kpi-card">
                  <h4>Localização 2h AM</h4>
                  <p>{stats.dispositivos_localizacao_2am} ({stats.percentuais.localizacao_2am})</p>
                </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
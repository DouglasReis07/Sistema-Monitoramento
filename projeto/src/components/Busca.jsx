import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Busca.css';

const BuscaCliente = () => {
  const navigate = useNavigate();
  const [numeroContrato, setNumeroContrato] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!numeroContrato.trim()) {
      setError('Por favor, insira o número do contrato');
      return;
    }

    // Simular busca
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Aqui você faria a chamada à API real
      // Por enquanto vamos apenas navegar para uma página de resultado fictícia
      navigate(`/resultado-busca/${numeroContrato}`);
    }, 1500);
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

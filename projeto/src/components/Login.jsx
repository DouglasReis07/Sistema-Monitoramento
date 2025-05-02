import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import users from '../data/users.json';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    auth: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setErrors({
      ...errors,
      [name]: '',
      auth: ''
    });
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const user = users.find(
      (u) => u.email === formData.email && u.password === formData.password
    );

    if (user) {
      localStorage.setItem('user', JSON.stringify({
        name: user.name,
        email: user.email
      }));
      localStorage.setItem('loggedUserEmail', user.email);

      navigate('/dashboard', {
        state: {
          userName: user.name,
          userEmail: user.email
        }
      });
    } else {
      setErrors({ ...errors, auth: 'Credenciais inválidas' });
    }
  };

  return (
    <div className="login-container">
      {/* Lado esquerdo azul */}
      <div className="login-left">
        <div className="login-left-content">
          <h2>Bem vindo ao GARY!</h2>
          {/* Imagem abaixo do título */}
          <img
            src="/Jovem-monitoramento.png"
            alt="Ilustração Jovem Monitoramento"
            className="login-image"
          />
        </div>
      </div>

      {/* Lado direito branco */}
      <div className="login-right">
        <div className="login-box">
          <h1 className="login-title">Login GARY</h1>

          {errors.auth && <div className="auth-error">{errors.auth}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="exemplo@email.com"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Senha</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Digite sua senha"
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '🔒'}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <button type="submit" className="submit-button">
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

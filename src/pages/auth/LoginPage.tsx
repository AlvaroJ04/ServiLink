import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, type Role } from '../../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('CLIENTE');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const mockUser = {
      id: '123',
      name: email.split('@')[0],
      email: email,
      role: role,
    };
    const mockToken = 'fake-jwt-token-12345';

    login(mockUser, mockToken);

    if (role === 'CLIENTE') navigate('/cliente');
    else if (role === 'TRABAJADOR') navigate('/trabajador');
    else if (role === 'ADMIN') navigate('/admin');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Iniciar Sesión - ServiLink</h2>
        
        <form onSubmit={handleLogin}>
          
          <div className="form-group">
            <label>Email:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Contraseña:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="form-input"
            />
          </div>

          {/* Selector temporal (le dejamos un pequeño estilo en línea para diferenciarlo como zona de pruebas) */}
          <div className="form-group" style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '4px', marginTop: '1.5rem' }}>
            <label>Simular Rol (Entorno de pruebas):</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value as Role)}
              className="form-input"
            >
              <option value="CLIENTE">Cliente</option>
              <option value="TRABAJADOR">Trabajador</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <button type="submit" className="btn-primary">
            Ingresar
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
};
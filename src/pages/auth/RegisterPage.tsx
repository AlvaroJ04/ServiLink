import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { type Role } from '../../context/AuthContext';

export const RegisterPage = () => {
  const navigate = useNavigate();
  
  const [role, setRole] = useState<Role>('CLIENTE');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Simulando registro de ${role}: ${name}\n\nEn el futuro, esto se enviará a FastAPI.`);
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Registro - ServiLink</h2>
        
        {/* Selector de rol con estilos dinámicos */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
           <button 
             type="button"
             onClick={() => setRole('CLIENTE')} 
             style={{ 
               flex: 1, 
               padding: '0.8rem', 
               background: role === 'CLIENTE' ? 'var(--primary-color)' : '#e0e0e0', 
               color: role === 'CLIENTE' ? 'white' : 'black', 
               border: 'none', 
               borderRadius: '4px',
               cursor: 'pointer',
               fontWeight: 'bold',
               transition: '0.2s'
             }}
           >
             Soy Cliente
           </button>
           <button 
             type="button"
             onClick={() => setRole('TRABAJADOR')} 
             style={{ 
               flex: 1, 
               padding: '0.8rem', 
               background: role === 'TRABAJADOR' ? 'var(--primary-color)' : '#e0e0e0', 
               color: role === 'TRABAJADOR' ? 'white' : 'black', 
               border: 'none', 
               borderRadius: '4px',
               cursor: 'pointer',
               fontWeight: 'bold',
               transition: '0.2s'
             }}
           >
             Soy Trabajador
           </button>
        </div>

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Nombre completo:</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              className="form-input"
            />
          </div>

          {/* Campo exclusivo para trabajadores */}
          {role === 'TRABAJADOR' && (
            <div className="form-group">
              <label>Especialidad técnica:</label>
              <input 
                type="text" 
                placeholder="Ej: Electricista, Plomero..." 
                required 
                className="form-input"
              />
            </div>
          )}

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

          <button type="submit" className="btn-primary" style={{ backgroundColor: 'var(--success-color)' }}>
            Crear cuenta
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia Sesión aquí</Link>
        </p>
      </div>
    </div>
  );
};
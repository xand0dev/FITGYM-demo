import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../utils/api';

export default function RegisterModal({ onClose }) {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Паролі не збігаються');
            return;
        }

        try {
            const res = await fetch(`${BASE_URL}/api/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.detail || 'Помилка реєстрації');
            
            if (data.token) {
                login(data.token, formData.username);
                onClose();
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="modal-overlay" style={{
            display: 'flex',
            position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 99999,
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div className="modal-content-premium" style={{
                background: '#fff',
                padding: '40px',
                width: '100%',
                maxWidth: '420px',
                borderRadius: '2px',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                borderTop: '5px solid #ff0000'
            }}>
                <button 
                    onClick={onClose} 
                    style={{
                        position: 'absolute', top: '15px', right: '15px', 
                        background: 'none', border: 'none', color: '#ccc', 
                        fontSize: '24px', cursor: 'pointer', transition: '0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#000'}
                    onMouseLeave={(e) => e.target.style.color = '#ccc'}
                >×</button>
                
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: '800',
                        fontSize: '1.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: '#000',
                        margin: 0
                    }}>Реєстрація</h2>
                    <div style={{ width: '40px', height: '2px', background: '#ff0000', margin: '10px auto' }}></div>
                </div>
                
                {error && <p style={{color: '#ff0000', textAlign: 'center', fontSize: '0.85rem', marginBottom: '15px', fontWeight: '600'}}>{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <input 
                        placeholder="Логін" required 
                        value={formData.username}
                        onChange={e => setFormData({...formData, username: e.target.value})}
                        style={inputStyle}
                    />
                    <input 
                        type="email" placeholder="Email" required 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        style={inputStyle}
                    />
                    <input 
                        type="password" placeholder="Пароль" required 
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        style={inputStyle}
                    />
                    <input 
                        type="password" placeholder="Підтвердіть пароль" required 
                        value={formData.confirmPassword}
                        onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                        style={{...inputStyle, marginBottom: '25px'}}
                    />
                    
                    <button type="submit" style={{
                        width: '100%', padding: '15px', background: '#000', 
                        color: '#fff', border: 'none', fontWeight: '700', 
                        fontSize: '0.9rem', cursor: 'pointer', 
                        textTransform: 'uppercase', letterSpacing: '1.5px',
                        transition: '0.3s'
                    }}
                    className="submit-btn-hover"
                    >
                        Створити акаунт
                    </button>
                </form>
            </div>

            <style>{`
                .submit-btn-hover:hover {
                    background: #ff0000;
                    letter-spacing: 2px;
                }
                input:focus {
                    border-color: #ff0000 !important;
                }
            `}</style>
        </div>
    );
}

const inputStyle = {
    width: '100%', 
    padding: '12px 14px', 
    marginBottom: '12px', 
    border: '1px solid #eee', 
    background: '#fcfcfc',
    borderRadius: '0', 
    outline: 'none', 
    boxSizing: 'border-box',
    fontFamily: 'inherit'
};
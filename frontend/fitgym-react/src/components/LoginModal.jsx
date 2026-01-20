import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../utils/api';

export default function LoginModal({ onClose }) {
    const { login } = useAuth();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch(`${BASE_URL}/api/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.detail || 'Помилка входу');
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
            // --- СИЛОВІ СТИЛІ ЩОБ ПЕРЕБИТИ СТАРИЙ CSS ---
            display: 'flex',              
            opacity: 1,                   // <--- ГОЛОВНИЙ ФІКС
            pointerEvents: 'auto',        // <--- ГОЛОВНИЙ ФІКС
            visibility: 'visible',
            
            position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 99999,
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div className="modal-content" style={{
                background: '#1e1e1e', 
                padding: '30px', 
                borderRadius: '10px', 
                width: '90%',
                maxWidth: '400px',
                position: 'relative',
                transform: 'none',        // Фікс, щоб не відлітало вверх
                opacity: 1
            }}>
                <button 
                    onClick={onClose} 
                    style={{
                        position: 'absolute', top: '15px', right: '15px', 
                        background: 'none', border: 'none', color: '#888', 
                        fontSize: '24px', cursor: 'pointer'
                    }}
                >×</button>
                
                <h2 style={{color: '#fff', marginBottom: '20px', textAlign: 'center', marginTop: 0}}>Вхід</h2>
                
                {error && <p style={{color:'red', textAlign:'center', marginBottom:'15px'}}>{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <div style={{marginBottom: '15px'}}>
                        <input 
                            placeholder="Логін" required 
                            value={formData.username}
                            onChange={e => setFormData({...formData, username: e.target.value})}
                            style={{width:'100%', padding:'12px', borderRadius:'5px', border:'1px solid #444', background:'#2a2a2a', color:'white', boxSizing: 'border-box'}}
                        />
                    </div>
                    <div style={{marginBottom: '20px'}}>
                        <input 
                            type="password" placeholder="Пароль" required 
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            style={{width:'100%', padding:'12px', borderRadius:'5px', border:'1px solid #444', background:'#2a2a2a', color:'white', boxSizing: 'border-box'}}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{width:'100%', padding:'12px', background:'#f36100', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold', fontSize:'16px'}}>
                        УВІЙТИ
                    </button>
                </form>
            </div>
        </div>
    );
}
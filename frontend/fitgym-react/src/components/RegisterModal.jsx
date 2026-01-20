import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../utils/api';

export default function RegisterModal({ onClose }) {
    const { login } = useAuth();
    const [formData, setFormData] = useState({ 
        name: '', username: '', email: '', password: '', confirm: '' 
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirm) {
            setError('Паролі не співпадають');
            return;
        }

        try {
            const res = await fetch(`${BASE_URL}/api/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.detail || 'Помилка реєстрації');

            login(data.token, formData.name);
            onClose();
            
        } catch (err) {
            setError(err.message);
        }
    };

    const inputStyle = {
        width:'100%', padding:'12px', borderRadius:'5px', 
        border:'1px solid #444', background:'#2a2a2a', color:'white', 
        boxSizing: 'border-box', marginBottom: '10px'
    };

    return (
        <div className="modal-overlay" style={{
            // --- ТІ САМІ ФІКСИ ---
            display: 'flex', opacity: 1, pointerEvents: 'auto', visibility: 'visible',
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 99999,
            alignItems: 'center', justifyContent: 'center'
        }}>
            <div className="modal-content" style={{
                background: '#1e1e1e', padding: '30px', borderRadius: '10px', 
                width: '90%', maxWidth: '400px', position: 'relative',
                transform: 'none', opacity: 1
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '15px', right: '15px', 
                    background: 'none', border: 'none', color: '#888', 
                    fontSize: '24px', cursor: 'pointer'
                }}>×</button>
                
                <h2 style={{color: '#fff', marginBottom: '20px', textAlign: 'center', marginTop: 0}}>Реєстрація</h2>
                {error && <p style={{color:'red', textAlign:'center', marginBottom:'15px'}}>{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <input style={inputStyle} required placeholder="Ім'я" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <input style={inputStyle} required placeholder="Логін" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                    <input style={inputStyle} type="email" required placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    <input style={inputStyle} type="password" required placeholder="Пароль" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    <input style={inputStyle} type="password" required placeholder="Підтвердіть пароль" value={formData.confirm} onChange={e => setFormData({...formData, confirm: e.target.value})} />
                    
                    <button type="submit" className="btn btn-primary" style={{
                        width:'100%', padding:'12px', background:'#f36100', color:'white', 
                        border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold', 
                        fontSize:'16px', marginTop: '10px'
                    }}>
                        Зареєструватися
                    </button>
                </form>
            </div>
        </div>
    );
}
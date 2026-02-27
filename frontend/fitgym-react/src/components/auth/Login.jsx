// src/components/Login.jsx
import { useState } from 'react';
import { BASE_URL } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${BASE_URL}/api/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (data.token) {
                localStorage.setItem('fp_token', JSON.stringify(data.token));
                navigate('/admin'); // Перекидаємо в адмінку
            } else {
                alert('Помилка входу');
            }
        } catch (err) {
            alert('Помилка: ' + err.message);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
            <form onSubmit={handleLogin} className="admin-form" style={{ width: '300px' }}>
                <h2>Вхід</h2>
                <input 
                    type="text" 
                    placeholder="Логін" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    style={{ display: 'block', width: '100%', marginBottom: '10px' }}
                />
                <input 
                    type="password" 
                    placeholder="Пароль" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    style={{ display: 'block', width: '100%', marginBottom: '10px' }}
                />
                <button type="submit" className="btn btn-primary">Увійти</button>
            </form>
        </div>
    );
}
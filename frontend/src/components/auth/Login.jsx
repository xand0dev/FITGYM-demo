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
        <div className="flex justify-center mt-[100px] min-h-[50vh] px-5">
            <form onSubmit={handleLogin} className="w-full max-w-[300px] bg-white p-[30px] rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-[#eee]">
                <h2 className="text-center font-black uppercase tracking-wide mb-6">Вхід в систему</h2>
                <input 
                    type="text" 
                    placeholder="Логін" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    className="block w-full p-3 mb-4 border border-[#ddd] rounded-md outline-none transition-colors focus:border-primary"
                />
                <input 
                    type="password" 
                    placeholder="Пароль" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    className="block w-full p-3 mb-6 border border-[#ddd] rounded-md outline-none transition-colors focus:border-primary"
                />
                <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-md uppercase tracking-wide transition-colors hover:bg-[#cc0000]">
                    Увійти
                </button>
            </form>
        </div>
    );
}
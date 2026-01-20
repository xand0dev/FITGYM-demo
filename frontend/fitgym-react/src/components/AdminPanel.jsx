// src/components/AdminPanel.jsx
import { useState, useEffect } from 'react';
import { authRequest } from '../utils/api';

export default function AdminPanel() {
    const [trainers, setTrainers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Стан для форми
    const [formData, setFormData] = useState({
        id: null,
        username: '', password: '', // Для створення
        name: '', specialization: '', phone: ''
    });

    // 1. Завантаження даних при старті
    useEffect(() => {
        loadTrainers();
    }, []);

    const loadTrainers = async () => {
        try {
            const data = await authRequest('/api/admin/instructors/');
            setTrainers(data);
        } catch (e) {
            console.error(e);
        }
    };

    // 2. Відкриття модалки
    const openModal = (trainer = null) => {
        if (trainer) {
            // Редагування
            setFormData({
                id: trainer.id,
                username: '', password: '', // Приховуємо/очищаємо
                name: trainer.full_name || trainer.name,
                specialization: trainer.specialties || trainer.specialization,
                phone: trainer.contact || trainer.phone
            });
        } else {
            // Створення
            setFormData({
                id: null,
                username: '', password: '',
                name: '', specialization: '', phone: ''
            });
        }
        setIsModalOpen(true);
    };

    // 3. Збереження (Твоя логіка split name тут!)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Розбиваємо ім'я
        const nameParts = formData.name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        const payload = {
            first_name: firstName,
            last_name: lastName,
            specialties: formData.specialization,
            contact: formData.phone
        };

        try {
            if (formData.id) {
                // UPDATE
                await authRequest(`/api/admin/instructors/${formData.id}/`, 'PUT', payload);
            } else {
                // CREATE
                payload.username = formData.username;
                payload.password = formData.password;
                await authRequest('/api/admin/instructors/', 'POST', payload);
            }
            setIsModalOpen(false);
            loadTrainers(); // Перезавантажити таблицю
        } catch (err) {
            alert('Помилка: ' + err.message);
        }
    };

    // 4. Видалення
    const handleDelete = async (id) => {
        if (!confirm('Видалити?')) return;
        try {
            await authRequest(`/api/admin/instructors/${id}/`, 'DELETE');
            loadTrainers();
        } catch (e) {
            alert('Помилка видалення');
        }
    };

    return (
        <div className="dashboard-container">
            {/* Меню зліва спрощене */}
            <aside className="dashboard-sidebar" style={{width: '250px', float:'left', height:'100vh', background:'#111', color:'#fff', padding:'20px'}}>
                <h2>FITGYM</h2>
                <p>Тренери (Active)</p>
                <button onClick={() => { localStorage.removeItem('fp_token'); window.location.reload(); }}>Вихід</button>
            </aside>

            <main className="dashboard-main" style={{marginLeft: '250px', padding: '20px'}}>
                <h1>Управління персоналом</h1>
                <button className="btn btn-primary" onClick={() => openModal(null)}>+ Додати Тренера</button>
                
                <table className="data-table" style={{width: '100%', marginTop: '20px', borderCollapse: 'collapse'}}>
                    <thead>
                        <tr style={{background: '#333', color: '#fff'}}>
                            <th>Ім'я</th>
                            <th>Спеціалізація</th>
                            <th>Телефон</th>
                            <th>Дії</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trainers.map(t => (
                            <tr key={t.id} style={{borderBottom: '1px solid #333'}}>
                                <td>{t.full_name || t.name}</td>
                                <td>{t.specialties || t.specialization}</td>
                                <td>{t.contact || t.phone}</td>
                                <td>
                                    <button onClick={() => openModal(t)}>Edit</button>
                                    <button onClick={() => handleDelete(t.id)} style={{color:'red', marginLeft:'10px'}}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>

            {/* МОДАЛКА */}
            {isModalOpen && (
                <div className="modal-overlay" style={{
                    position:'fixed', top:0, left:0, width:'100%', height:'100%', 
                    background:'rgba(0,0,0,0.8)', display:'flex', justifyContent:'center', alignItems:'center'
                }}>
                    <div className="modal-content" style={{background:'#1e1e1e', padding:'20px', borderRadius:'10px', width:'400px'}}>
                        <h2>{formData.id ? 'Редагувати' : 'Новий'} Тренер</h2>
                        <form onSubmit={handleSubmit}>
                            {/* Показуємо логін/пароль тільки якщо це Створення (немає ID) */}
                            {!formData.id && (
                                <>
                                    <input 
                                        placeholder="Логін" required 
                                        value={formData.username}
                                        onChange={e => setFormData({...formData, username: e.target.value})}
                                        style={{display:'block', width:'100%', margin:'10px 0'}}
                                    />
                                    <input 
                                        type="password" placeholder="Пароль" required 
                                        value={formData.password}
                                        onChange={e => setFormData({...formData, password: e.target.value})}
                                        style={{display:'block', width:'100%', margin:'10px 0'}}
                                    />
                                    <hr />
                                </>
                            )}
                            
                            <input 
                                placeholder="Повне ім'я" required 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                style={{display:'block', width:'100%', margin:'10px 0'}}
                            />
                            <input 
                                placeholder="Спеціалізація" required 
                                value={formData.specialization}
                                onChange={e => setFormData({...formData, specialization: e.target.value})}
                                style={{display:'block', width:'100%', margin:'10px 0'}}
                            />
                            <input 
                                placeholder="Телефон" 
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                style={{display:'block', width:'100%', margin:'10px 0'}}
                            />

                            <div style={{marginTop: '20px', display:'flex', justifyContent:'space-between'}}>
                                <button type="button" onClick={() => setIsModalOpen(false)}>Скасувати</button>
                                <button type="submit" className="btn btn-primary">Зберегти</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
import { useState } from 'react';
import AdminModal from './AdminModal';
import { useFitMutation } from '../../hooks/useFitQuery'; // Підключаємо наш бойовий арсенал

export default function DataTableTab({ data, tabType, onRefresh }) {
    // Стан модалки та форми
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' або 'edit'
    const [formData, setFormData] = useState({});

    // Визначаємо, в якій вкладці знаходимось
    const isTrainer = tabType === 'trainers';
    const title = isTrainer ? 'Тренери' : 'Клієнти';

    // --- ЗАРЯДЖАЄМО МУТАЦІЇ (REACT QUERY) ---
    const createMutation = useFitMutation('POST');
    const updateMutation = useFitMutation('PUT');
    const deleteMutation = useFitMutation('DELETE');

    // Перевірка активних запитів (блокує кнопки від подвійних кліків)
    const isSubmitting = createMutation.isPending || updateMutation.isPending;
    const isDeleting = deleteMutation.isPending;

    // --- ОБРОБНИКИ ДІЙ ---
    const handleAddNew = () => {
        setModalMode('create');
        // Ініціалізація пустих полів залежно від типу
        setFormData(
            isTrainer 
                ? { username: '', password: '', first_name: '', last_name: '', specialties: '', contact: '' } 
                : { username: '', email: '', first_name: '', last_name: '', password: '', contact: '' }
        );
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setModalMode('edit');
        setFormData(item);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (!window.confirm(`Ви впевнені, що хочете знищити цей запис?`)) return;
        
        const endpoint = isTrainer ? `/api/admin/instructors/${id}/` : `/api/admin/members/${id}/`;
        
        // Тактичний удар
        deleteMutation.mutate(
            { endpoint, data: null },
            {
                onSuccess: () => {
                    if (onRefresh) onRefresh(); // Синхронізація з батьківським компонентом
                },
                onError: (e) => alert('Не вдалося видалити: ' + e.message)
            }
        );
    };

    const handleSave = (e) => {
        e.preventDefault();
        
        const endpoint = isTrainer ? '/api/admin/instructors/' : '/api/admin/members/';
        const url = modalMode === 'create' ? endpoint : `${endpoint}${formData.id}/`;
        
        // Обираємо зброю залежно від режиму
        const mutation = modalMode === 'create' ? createMutation : updateMutation;

        mutation.mutate(
            { endpoint: url, data: formData },
            {
                onSuccess: () => {
                    setIsModalOpen(false);
                    if (onRefresh) onRefresh();
                },
                onError: (e) => alert('Помилка збереження: ' + e.message)
            }
        );
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Отримання гарного імені для відображення
    const getDisplayName = (item) => {
        if (item.full_name) return item.full_name;
        const firstLast = `${item.first_name || ''} ${item.last_name || ''}`.trim();
        return firstLast || item.username || 'Невідомий';
    };

    return (
        <div className="fade-in">
            {/* ШАПКА ТАБЛИЦІ З КНОПКОЮ "ДОДАТИ" */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', textTransform: 'uppercase', fontWeight: '800' }}>
                    Довідник: <span style={{ color: '#e60000' }}>{title}</span>
                </h3>
                <button onClick={handleAddNew} className="btn-save" style={{ padding: '10px 20px', borderRadius: '8px' }}>
                    <i className="fas fa-plus"></i> Додати запис
                </button>
            </div>

            {/* ТАБЛИЦЯ */}
            <div className="table-wrap">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Користувач</th>
                            <th>{isTrainer ? 'Спеціалізація' : 'Контакти (Email)'}</th>
                            <th>Роль</th>
                            <th style={{ textAlign: 'right' }}>Дії</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data && data.length > 0 ? data.map(item => (
                            <tr key={item.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '1rem', borderRadius: '8px' }}>
                                            {getDisplayName(item).charAt(0).toUpperCase()}
                                        </div>
                                        <strong>{getDisplayName(item)}</strong>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ color: '#aaa', fontSize: '0.9rem' }}>
                                        {isTrainer ? (item.specialties || '—') : (item.email || '—')}
                                    </span>
                                </td>
                                <td>
                                    <span className="badge-red" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #333' }}>
                                        {isTrainer ? 'Тренер' : 'Клієнт'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button 
                                            title="Редагувати" 
                                            onClick={() => handleEdit(item)}
                                            disabled={isDeleting}
                                        >
                                            <i className="fas fa-pen"></i>
                                        </button>
                                        <button 
                                            title="Видалити" 
                                            onClick={() => handleDelete(item.id)} 
                                            style={{ color: '#ff4d4d', borderColor: 'rgba(255,0,0,0.3)', opacity: isDeleting ? 0.5 : 1 }}
                                            disabled={isDeleting}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                                    Дані відсутні. Натисніть "Додати запис".
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* УНІВЕРСАЛЬНА МОДАЛКА (Створення / Редагування) */}
            <AdminModal 
                isOpen={isModalOpen} 
                onClose={() => !isSubmitting && setIsModalOpen(false)} 
                title={modalMode === 'create' ? `Новий ${isTrainer ? 'тренер' : 'клієнт'}` : `Редагування`}
            >
                <form className="admin-form" onSubmit={handleSave}>
                    
                    {/* ФОРМА ДЛЯ ТРЕНЕРА */}
                    {isTrainer ? (
                        <>
                            <div className="form-group">
                                <label>Username (Логін)</label>
                                <input 
                                    type="text" 
                                    name="username" 
                                    value={formData.username || ''} 
                                    onChange={handleChange} 
                                    required 
                                    disabled={modalMode === 'edit' || isSubmitting} 
                                />
                            </div>
                            
                            {modalMode === 'create' && (
                                <div className="form-group">
                                    <label>Пароль</label>
                                    <input type="password" name="password" value={formData.password || ''} onChange={handleChange} required minLength="6" disabled={isSubmitting} />
                                </div>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ім'я</label>
                                    <input type="text" name="first_name" value={formData.first_name || ''} onChange={handleChange} required disabled={isSubmitting} />
                                </div>
                                <div className="form-group">
                                    <label>Прізвище</label>
                                    <input type="text" name="last_name" value={formData.last_name || ''} onChange={handleChange} required disabled={isSubmitting} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Спеціалізація</label>
                                <input type="text" name="specialties" value={formData.specialties || ''} onChange={handleChange} placeholder="Crossfit, Yoga, Boxing..." required disabled={isSubmitting} />
                            </div>
                            <div className="form-group">
                                <label>Контакт (Телефон)</label>
                                <input type="text" name="contact" value={formData.contact || ''} onChange={handleChange} placeholder="+380..." disabled={isSubmitting} />
                            </div>
                        </>
                    ) : (
                        /* ФОРМА ДЛЯ КЛІЄНТА (Користувача) */
                        <>
                            <div className="form-group">
                                <label>Username (Логін)</label>
                                <input 
                                    type="text" 
                                    name="username" 
                                    value={formData.username || ''} 
                                    onChange={handleChange} 
                                    required 
                                    disabled={modalMode === 'edit' || isSubmitting} 
                                />
                            </div>
                            <div className="form-group">
                                <label>Email адрес</label>
                                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required disabled={isSubmitting} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ім'я</label>
                                    <input type="text" name="first_name" value={formData.first_name || ''} onChange={handleChange} required disabled={isSubmitting} />
                                </div>
                                <div className="form-group">
                                    <label>Прізвище</label>
                                    <input type="text" name="last_name" value={formData.last_name || ''} onChange={handleChange} required disabled={isSubmitting} />
                                </div>
                            </div>
                            {modalMode === 'create' && (
                                <div className="form-group">
                                    <label>Пароль</label>
                                    <input type="password" name="password" value={formData.password || ''} onChange={handleChange} required minLength="6" disabled={isSubmitting} />
                                </div>
                            )}
                        </>
                    )}
                    
                    <div className="modal-actions">
                        <div className="action-right" style={{ width: '100%' }}>
                            <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Скасувати</button>
                            <button type="submit" className="btn-save" disabled={isSubmitting}>
                                <i className={isSubmitting ? "fas fa-spinner fa-spin" : "fas fa-check"} style={{marginRight: '8px'}}></i> 
                                {isSubmitting ? 'ОБРОБКА...' : 'ЗБЕРЕГТИ'}
                            </button>
                        </div>
                    </div>
                </form>
            </AdminModal>
        </div>
    );
}
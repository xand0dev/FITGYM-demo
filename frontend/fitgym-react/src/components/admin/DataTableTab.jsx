import { authRequest } from '../../utils/api';

export default function DataTableTab({ data, tabType, onRefresh }) {
    
    // Функція для видалення запису через API
    const handleDelete = async (id) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цей запис?')) return;
        
        try {
            // Формуємо правильний ендпоінт залежно від того, де ми знаходимось
            const endpoint = tabType === 'trainers' 
                ? `/api/admin/instructors/${id}/` 
                : `/api/admin/members/${id}/`;
            
            await authRequest(endpoint, 'DELETE');
            
            // Якщо видалення успішне — смикаємо оновлення даних у батьківському компоненті
            if (onRefresh) onRefresh(); 
        } catch (e) {
            console.error('Помилка видалення:', e);
            alert('Не вдалося видалити: ' + e.message);
        }
    };

    if (!data || data.length === 0) {
        return <div className="table-wrap fade-in"><p style={{color: '#888', padding: '20px'}}>Немає даних.</p></div>;
    }

    return (
        <div className="table-wrap fade-in">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Ім'я</th>
                        <th>Контакт</th>
                        <th>Статус</th>
                        <th>Дії</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(item => (
                        <tr key={item.id}>
                            <td><strong>{item.full_name || item.name || item.username}</strong></td>
                            <td>{item.contact || item.email || '—'}</td>
                            <td>
                                <span className="badge active">
                                    {tabType === 'trainers' ? 'Тренер' : 'Клієнт'}
                                </span>
                            </td>
                            <td>
                                <div style={{display: 'flex', gap: '8px'}}>
                                    <button title="Редагувати"><i className="fas fa-pen"></i></button>
                                    <button 
                                        title="Видалити" 
                                        onClick={() => handleDelete(item.id)} 
                                        style={{color: '#ff4d4d', borderColor: 'rgba(255,0,0,0.3)'}}
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Наша тактична матриця кешу
import { useAuthData } from '../hooks/useFitQuery';

import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopbar from '../components/admin/AdminTopbar';
import DashboardTab from '../components/admin/DashboardTab';
import DataTableTab from '../components/admin/DataTableTab';
import ScheduleTab from '../components/admin/ScheduleTab';

export default function AdminPanel() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Вживляємо хуки замість ручного fetch та стейтів
    const { 
        data: trainers = [], 
        isLoading: isTrainersLoading,
        refetch: refetchTrainers
    } = useAuthData('admin-trainers', '/api/admin/instructors/');
    
    const { 
        data: clients = [], 
        isLoading: isClientsLoading,
        refetch: refetchClients
    } = useAuthData('admin-clients', '/api/admin/members/');

    useEffect(() => {
        // Темний стиль для боді
        document.body.classList.add('admin-body');
        return () => document.body.classList.remove('admin-body');
    }, []);

    // Функція-міст для сумісності зі старим DataTableTab (поки ми його не оновили)
    const forceRefetch = () => {
        refetchTrainers();
        refetchClients();
    };

    return (
        <div className={`admin-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
            
            <AdminSidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                sidebarOpen={sidebarOpen} 
                logout={logout} 
            />

            <main className="admin-content">
                <AdminTopbar 
                    user={user} 
                    sidebarOpen={sidebarOpen} 
                    setSidebarOpen={setSidebarOpen} 
                />

                <div className="admin-page-content">
                    {/* Передаємо довжину масивів для Дашборда, або "..." під час завантаження */}
                    {activeTab === 'dashboard' && (
                        <DashboardTab 
                            clientsCount={isClientsLoading ? '...' : clients.length} 
                            trainersCount={isTrainersLoading ? '...' : trainers.length} 
                        />
                    )}

                    {activeTab === 'schedule' && <ScheduleTab />}

                    {(activeTab === 'trainers' || activeTab === 'clients') && (
                        <DataTableTab 
                            data={activeTab === 'trainers' ? trainers : clients} 
                            tabType={activeTab}
                            onRefresh={forceRefetch}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAuthData } from '../hooks/useFitQuery';

import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopbar from '../components/admin/AdminTopbar';
import DashboardTab from '../components/admin/DashboardTab';
import DataTableTab from '../components/admin/DataTableTab';
import ScheduleTab from '../components/admin/ScheduleTab';
import ApplicationsTab from '../components/admin/ApplicationsTab'; 

export default function AdminPanel() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);

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

    // 👇 ДОДАЛИ ЗАПИТ НА ОТРИМАННЯ ЗАЯВОК
    const { 
        data: applications = [], 
        refetch: refetchApps
    } = useAuthData('admin-apps', '/api/admin/applications/');

    useEffect(() => {
        // Замість окремого CSS-класу стилізуємо body прямо через Tailwind
        document.body.classList.add('bg-[#080808]', 'text-white');
        return () => document.body.classList.remove('bg-[#080808]', 'text-white');
    }, []);

    const forceRefetch = () => {
        refetchTrainers();
        refetchClients();
        refetchApps(); // 👈 Не забули оновити і заявки
    };

    return (
        <div className="flex min-h-screen items-start bg-[#080808] text-white font-sans relative selection:bg-primary selection:text-white">
            
            {/* Оверлей для мобільного меню */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] lg:hidden animate-fadeIn"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            <AdminSidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                sidebarOpen={sidebarOpen} 
                setSidebarOpen={setSidebarOpen}
                logout={logout} 
            />

            <main className="flex-1 w-full lg:w-[calc(100%-260px)] p-5 lg:p-[30px] box-border min-h-screen flex flex-col overflow-x-hidden">
                <AdminTopbar 
                    user={user} 
                    sidebarOpen={sidebarOpen} 
                    setSidebarOpen={setSidebarOpen} 
                />

                <div className="mt-2 lg:mt-[10px] flex-1">
                    {activeTab === 'dashboard' && (
                        <DashboardTab 
                            clientsCount={isClientsLoading ? '...' : clients.length} 
                            trainersCount={isTrainersLoading ? '...' : trainers.length} 
                        />
                    )}

                    {activeTab === 'schedule' && <ScheduleTab />}

                    {/* 👇 ДОДАЛИ РЕНДЕР НОВОЇ ВКЛАДКИ */}
                    {activeTab === 'applications' && (
                        <ApplicationsTab 
                            data={applications} 
                            onRefresh={forceRefetch} 
                        />
                    )}

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
import { useState, useEffect } from 'react';
import { authRequest } from '../utils/api';
import { useAuth } from '../context/AuthContext';

import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopbar from '../components/admin/AdminTopbar';
import DashboardTab from '../components/admin/DashboardTab';
import DataTableTab from '../components/admin/DataTableTab';
import ScheduleTab from '../components/admin/ScheduleTab'; 


export default function AdminPanel() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [trainers, setTrainers] = useState([]);
    const [clients, setClients] = useState([]);

    useEffect(() => {
        document.body.classList.add('admin-body');
        loadData();
        return () => document.body.classList.remove('admin-body');
    }, []);

    const loadData = async () => {
        try {
            const [t, c] = await Promise.all([
                authRequest('/api/admin/instructors/').catch(()=>[]),
                authRequest('/api/admin/members/').catch(()=>[])
            ]);
            setTrainers(t || []);
            setClients(c || []);
        } catch (e) { console.error(e); }
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
                    {activeTab === 'dashboard' && (
                        <DashboardTab clientsCount={clients.length} trainersCount={trainers.length} />
                    )}

                    {activeTab === 'schedule' && <ScheduleTab />}

                    {(activeTab === 'trainers' || activeTab === 'clients') && (
                        <DataTableTab 
                            data={activeTab === 'trainers' ? trainers : clients} 
                            tabType={activeTab}
                            onRefresh={loadData}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
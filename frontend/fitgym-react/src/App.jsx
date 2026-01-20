import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Cabinet from './pages/Cabinet';
import AdminPanel from './pages/AdminPanel';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import { useAuth } from './context/AuthContext';
import { useUI } from './context/UIContext'; 

const PrivateRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/" />;
    if (adminOnly && !user.is_staff) return <Navigate to="/" />;
    return children;
};

function App() {
  // Дістаємо стани з контексту
  const { isLoginOpen, closeLogin, isRegisterOpen, closeRegister } = useUI();

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="cabinet" element={
                <PrivateRoute><Cabinet /></PrivateRoute>
            } />
        </Route>

        <Route path="/admin" element={
            <PrivateRoute adminOnly={true}><AdminPanel /></PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* ВАЖЛИВО: Модалки тут */}
      {isLoginOpen && <LoginModal onClose={closeLogin} />}
      {isRegisterOpen && <RegisterModal onClose={closeRegister} />}
    </>
  );
}

export default App;
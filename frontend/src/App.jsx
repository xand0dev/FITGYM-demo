// src/App.jsx
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Каркас та сторінки
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Cabinet from './pages/Cabinet';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';

// UI та Авторизація
import LoginModal from './components/auth/LoginModal';
import RegisterModal from './components/auth/RegisterModal';
import ToastContainer from './components/ui/ToastContainer';
import GlobalConfirmModal from './components/ui/GlobalConfirmModal';
import AnimatedPage from './components/ui/AnimatedPage';

// Контекст
import { useAuth } from './context/AuthContext';
import { useUI } from './context/UIContext';

const PrivateRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();
    
    if (loading) return null;
    if (!user) return <Navigate to="/404" replace />;
    if (adminOnly && !user.is_staff) return <Navigate to="/404" replace />;
    
    return children;
};

function App() {
  const { isLoginOpen, closeLogin, isRegisterOpen, closeRegister } = useUI();
  const location = useLocation(); // Радар для відслідковування зміни сторінок

  return (
    <>
      <ToastContainer />
      <GlobalConfirmModal />

      {/* Матриця анімацій */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          
          <Route path="/" element={<Layout />}>
              <Route index element={
                  <AnimatedPage><Home /></AnimatedPage>
              } />
              <Route path="cabinet" element={
                  <PrivateRoute>
                      <AnimatedPage><Cabinet /></AnimatedPage>
                  </PrivateRoute>
              } />
          </Route>

          <Route path="/admin" element={
              <PrivateRoute adminOnly={true}>
                  <AnimatedPage><AdminPanel /></AnimatedPage>
              </PrivateRoute>
          } />

          {/* Маршрут для помилки 404 */}
          <Route path="*" element={
              <AnimatedPage><NotFound /></AnimatedPage>
          } />
        </Routes>
      </AnimatePresence>

      {isLoginOpen && <LoginModal onClose={closeLogin} />}
      {isRegisterOpen && <RegisterModal onClose={closeRegister} />}
    </>
  );
}

export default App;
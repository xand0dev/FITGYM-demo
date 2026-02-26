// src/App.jsx
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Layout from './components/Layout';
import Home from './pages/Home';
import Cabinet from './pages/Cabinet';
import AdminPanel from './pages/AdminPanel';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import ToastContainer from './components/ToastContainer';
import GlobalConfirmModal from './components/GlobalConfirmModal';

import { useAuth } from './context/AuthContext';
import { useUI } from './context/UIContext';
import AnimatedPage from './components/AnimatedPage';

const PrivateRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/" />;
    if (adminOnly && !user.is_staff) return <Navigate to="/" />;
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

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AnimatePresence>

      {isLoginOpen && <LoginModal onClose={closeLogin} />}
      {isRegisterOpen && <RegisterModal onClose={closeRegister} />}
    </>
  );
}

export default App;
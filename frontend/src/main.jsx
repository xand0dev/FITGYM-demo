import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { UIProvider } from './context/UIContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css' 

// Створюємо головний когітатор для кешування запитів
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Дані вважаються свіжими 5 хвилин (не смикаємо бекенд зайвий раз)
      cacheTime: 1000 * 60 * 30, // Зберігаємо в пам'яті 30 хвилин
      refetchOnWindowFocus: false, // Не перезапитувати при зміні вкладок (економимо ресурси)
      retry: 2, // Якщо бек впав, робимо 2 спроби перед тим як викинути помилку
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <UIProvider>
              <App />
          </UIProvider>
        </AuthProvider>
      </BrowserRouter>
      {/* Тактичний візор - буде видно тільки під час розробки в кутку екрану */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  </React.StrictMode>,
)
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LanguageRoute, { LanguageRedirect } from '@/components/LanguageRoute'

function App() {
  return (
    <div className="min-h-screen bg-background-primary">
      {/* 处理不带语言前缀的 URL */}
      <Routes>
        <Route path="/*" element={<LanguageRedirect />} />
      </Routes>

      {/* 带语言前缀的路由 */}
      <Routes>
        <Route path="/:locale?" element={<LanguageRoute />} />
      </Routes>
      
      {/* Toast 通知 */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#34C759',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF3B30',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  )
}

export default App



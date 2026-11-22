// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { Landing } from './pages/Landing'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { Dashboard } from './pages/Dashboard'
import { RequestList } from './pages/RequestList'
import { RequestForm } from './pages/RequestForm'
import { AreaManager } from './pages/AreaManager'
import { PillNav } from './components/PillNav'
import { HelpFab } from './components/HelpFab'
import './App.css'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/requests" element={<RequestList />} />
            <Route
              path="/requests/new"
              element={
                <ProtectedRoute allowedRoles={['requester', 'admin']}>
                  <RequestForm />
                </ProtectedRoute>
              }
            />
            <Route path="/areas" element={<AreaManager />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Floating Pill Navigation & Help FAB */}
        <PillNav />
        <HelpFab />
      </BrowserRouter>
    </AuthProvider>
  )
}

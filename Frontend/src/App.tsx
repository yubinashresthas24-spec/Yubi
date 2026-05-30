import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './components/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { InventoriesPage } from './pages/InventoriesPage';
import { InventoryDetailPage } from './pages/InventoryDetailPage';
import { CategoryDetailPage } from './pages/CategoryDetailPage';
import { ItemsPage } from './pages/ItemsPage';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventories"
              element={
                <ProtectedRoute>
                  <InventoriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventories/:invId"
              element={
                <ProtectedRoute>
                  <InventoryDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventories/:invId/:catId"
              element={
                <ProtectedRoute>
                  <CategoryDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/items"
              element={
                <ProtectedRoute>
                  <ItemsPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

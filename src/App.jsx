import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import StudentLoginPage from './pages/StudentLoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import ModulePage from './pages/ModulePage';
import NotFoundModule from './pages/NotFoundModule';
import './App.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Student Routes */}
          <Route path="/" element={<StudentLoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/module/:id"
            element={
              <ProtectedRoute>
                <ModulePage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminPage />
              </ProtectedAdminRoute>
            }
          />

          {/* Catch-all Route */}
          <Route path="*" element={<NotFoundModule />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

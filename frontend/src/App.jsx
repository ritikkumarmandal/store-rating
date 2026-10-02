import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import UserStores from './pages/UserStores.jsx';
import OwnerDashboard from './pages/OwnerDashboard.jsx';

export default function App() {
  const all = ['ADMIN', 'USER', 'OWNER'];
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/stores" element={<ProtectedRoute roles={['USER']}><UserStores /></ProtectedRoute>} />
        <Route path="/owner" element={<ProtectedRoute roles={['OWNER']}><OwnerDashboard /></ProtectedRoute>} />
        <Route path="/password" element={<ProtectedRoute roles={all}><ChangePassword /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

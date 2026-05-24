import { Routes, Route } from 'react-router-dom';
import UserManagement from './UserManagement';
import ReservationManagement from './ReservationManagement';
import OrderManagement from './OrderManagement';

const AdminPanel = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      <Routes>
        <Route path="users" element={<UserManagement />} />
        <Route path="reservations" element={<ReservationManagement />} />
        <Route path="orders" element={<OrderManagement />} />
      </Routes>
    </div>
  );
};

export default AdminPanel;
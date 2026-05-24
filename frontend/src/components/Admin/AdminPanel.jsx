// Eliminado: import React from 'react'
// ✅ CORREGIDO: Solo imports necesarios
import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

// NOTA: useNavigate no se usa, ha sido eliminado
// DashboardStats SÍ se renderiza (está en la ruta "/")
// UserManagement SÍ se usa (ruta "users")
// ReservationManagement SÍ se usa (ruta "reservations")
// OrderManagement SÍ se usa (ruta "orders")

const AdminPanel = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/admin/users" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold">User Management</h3>
          <p className="text-gray-600 mt-2">Manage system users and roles</p>
        </Link>
        <Link to="/admin/reservations" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold">Reservations</h3>
          <p className="text-gray-600 mt-2">View and manage all reservations</p>
        </Link>
        <Link to="/admin/orders" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold">Orders</h3>
          <p className="text-gray-600 mt-2">Track and update order status</p>
        </Link>
      </div>
      
      <Routes>
        <Route path="users" element={<UserManagement />} />
        <Route path="reservations" element={<ReservationManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="/" element={<DashboardStats />} />
      </Routes>
    </div>
  );
};

// ✅ DashboardStats SÍ se renderiza en la ruta principal "/"
const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data.stats);
    } catch (error) {
      toast.error('Failed to load stats');
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-gray-500 text-sm">Total Users</h3>
        <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-gray-500 text-sm">Total Orders</h3>
        <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-gray-500 text-sm">Revenue</h3>
        <p className="text-2xl font-bold">${parseFloat(stats?.revenue || 0).toFixed(2)}</p>
      </div>
    </div>
  );
};

// ✅ UserManagement SÍ se usa en la ruta "users"
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users || []);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}`, { role: newRole });
      toast.success('User role updated');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
      console.error('Error updating role:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        toast.success('User deleted');
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
        console.error('Error deleting user:', error);
      }
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.firstName} {user.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="client">Client</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ✅ ReservationManagement SÍ se usa en la ruta "reservations"
const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      const response = await api.get('/admin/reservations');
      setReservations(response.data.reservations || []);
    } catch (error) {
      toast.error('Failed to load reservations');
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservations.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No reservations found
                </td>
              </tr>
            ) : (
              reservations.map(res => (
                <tr key={res.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{res.user?.firstName} {res.user?.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{res.reservationDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{res.reservationTime}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{res.partySize}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      res.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      res.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {res.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ✅ OrderManagement SÍ se usa en la ruta "orders"
const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      toast.error('Failed to load orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Error updating status:', error);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{order.id?.slice(0, 8)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.user?.firstName} {order.user?.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${parseFloat(order.totalAmount || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'ready' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
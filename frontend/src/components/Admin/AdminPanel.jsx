import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

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
    </div>
  );
};

/* ================= DASHBOARD ================= */

const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data.stats);
    } catch (_error) {
      toast.error('Failed to load stats');
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
        <p className="text-2xl font-bold">
          ${parseFloat(stats?.revenue || 0).toFixed(2)}
        </p>
      </div>
    </div>
  );
};

/* ================= USERS ================= */

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users || []);
    } catch (_error) {
      toast.error('Failed to load users');
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
    } catch (_error) {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (_error) {
      toast.error('Failed to delete user');
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>

                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="client">Client</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>

                <td>
                  <button onClick={() => handleDeleteUser(user.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ================= RESERVATIONS ================= */

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      const response = await api.get('/admin/reservations');
      setReservations(response.data.reservations || []);
    } catch (_error) {
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {reservations.map(res => (
        <div key={res.id}>
          {res.reservationDate} - {res.status}
        </div>
      ))}
    </div>
  );
};

/* ================= ORDERS ================= */

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data.orders || []);
    } catch (_error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success('Updated');
      fetchOrders();
    } catch (_error) {
      toast.error('Failed update');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {orders.map(order => (
        <div key={order.id}>
          {order.id} - {order.status}

          <select
            value={order.status}
            onChange={(e) => updateStatus(order.id, e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      ))}
    </div>
  );
};

export default AdminPanel;
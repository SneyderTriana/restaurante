import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { format } from 'date-fns';
import { Calendar, ShoppingBag, CheckCircle } from 'lucide-react';

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className={`p-4 rounded ${color}`}>
      <Icon />
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
}

const Dashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    upcomingReservations: 0,
    activeOrders: 0,
    completedOrders: 0
  });

  const [recentReservations, setRecentReservations] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [reservationsRes, ordersRes] = await Promise.all([
        api.get('/reservations/my'),
        api.get('/orders/my')
      ]);

      const reservations = reservationsRes.data.reservations || [];
      const orders = ordersRes.data.orders || [];

      const now = new Date();

      const upcoming = reservations.filter(
        r => new Date(r.reservationDate) >= now && r.status !== 'cancelled'
      );

      const activeOrders = orders.filter(o =>
        ['pending', 'preparing'].includes(o.status)
      );

      const completedOrders = orders.filter(
        o => o.status === 'delivered'
      );

      setStats({
        upcomingReservations: upcoming.length,
        activeOrders: activeOrders.length,
        completedOrders: completedOrders.length
      });

      setRecentReservations(upcoming.slice(0, 5));
      setRecentOrders(activeOrders.slice(0, 5));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome {user?.firstName}</h1>
    </div>
  );
};

export default Dashboard;
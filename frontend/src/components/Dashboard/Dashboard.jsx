import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { format } from 'date-fns';
import { Calendar, ShoppingBag, Clock, CheckCircle } from 'lucide-react';

/**
 * Dashboard component showing user statistics and recent activity
 * Fetches and displays reservations, orders, and metrics
 */
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [reservationsRes, ordersRes] = await Promise.all([
        api.get('/reservations/my'),
        api.get('/orders/my')
      ]);

      const reservations = reservationsRes.data.reservations;
      const orders = ordersRes.data.orders;

      const now = new Date();
      const upcoming = reservations.filter(r => 
        new Date(r.reservationDate) >= now && r.status !== 'cancelled'
      );
      
      const activeOrders = orders.filter(o => 
        ['pending', 'preparing'].includes(o.status)
      );
      
      const completedOrders = orders.filter(o => 
        o.status === 'delivered'
      );

      setStats({
        upcomingReservations: upcoming.length,
        activeOrders: activeOrders.length,
        completedOrders: completedOrders.length
      });

      setRecentReservations(upcoming.slice(0, 5));
      setRecentOrders(activeOrders.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your account</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Upcoming Reservations"
          value={stats.upcomingReservations}
          icon={Calendar}
          color="bg-blue-600"
        />
        <StatCard
          title="Active Orders"
          value={stats.activeOrders}
          icon={ShoppingBag}
          color="bg-green-600"
        />
        <StatCard
          title="Completed Orders"
          value={stats.completedOrders}
          icon={CheckCircle}
          color="bg-purple-600"
        />
      </div>

      {/* Recent Reservations */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Reservations</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentReservations.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No upcoming reservations
            </div>
          ) : (
            recentReservations.map(reservation => (
              <div key={reservation.id} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {format(new Date(reservation.reservationDate), 'MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {reservation.reservationTime} • {reservation.partySize} guests
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {reservation.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Active Orders</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentOrders.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No active orders
            </div>
          ) : (
            recentOrders.map(order => (
              <div key={order.id} className="px-6 py-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                  <span className="text-sm text-gray-600">
                    ${parseFloat(order.totalAmount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    {order.items.length} item(s) • {order.orderType}
                  </p>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'ready' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
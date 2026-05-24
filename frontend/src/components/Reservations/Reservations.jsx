// Eliminado: import React from 'react'
// Solo mantenemos los imports específicos que necesitamos
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    reservationDate: '',
    reservationTime: '',
    partySize: 2,
    specialRequests: ''
  });
  const [loading, setLoading] = useState(true);

  // ✅ fetchReservations definida ANTES de useEffect
  const fetchReservations = async () => {
    try {
      const response = await api.get('/reservations/my');
      setReservations(response.data.reservations || []);
    } catch (error) {
      toast.error('Failed to load reservations');
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ useEffect después de la función
  useEffect(() => {
    fetchReservations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones adicionales
    if (!formData.reservationDate) {
      toast.error('Please select a date');
      return;
    }
    
    if (!formData.reservationTime) {
      toast.error('Please select a time');
      return;
    }
    
    try {
      await api.post('/reservations', formData);
      toast.success('Reservation created successfully');
      setShowForm(false);
      await fetchReservations(); // ✅ await para asegurar que se actualice
      setFormData({
        reservationDate: '',
        reservationTime: '',
        partySize: 2,
        specialRequests: ''
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create reservation';
      toast.error(errorMessage);
      console.error('Error creating reservation:', error);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      try {
        await api.put(`/reservations/${id}/cancel`);
        toast.success('Reservation cancelled successfully');
        await fetchReservations(); // ✅ await para asegurar que se actualice
      } catch (error) {
        toast.error('Failed to cancel reservation');
        console.error('Error cancelling reservation:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      confirmed: 'Confirmed',
      pending: 'Pending',
      cancelled: 'Cancelled'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Reservations</h1>
          <p className="text-gray-600 mt-1">Manage your table bookings</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            showForm 
              ? 'bg-gray-500 text-white hover:bg-gray-600' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {showForm ? 'Cancel' : '+ New Reservation'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Create New Reservation</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.reservationDate}
                  onChange={(e) => setFormData({ ...formData, reservationDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.reservationTime}
                  onChange={(e) => setFormData({ ...formData, reservationTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Party Size *
              </label>
              <input
                type="number"
                required
                min="1"
                max="20"
                value={formData.partySize}
                onChange={(e) => setFormData({ ...formData, partySize: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum 20 guests per reservation</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requests
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Any dietary restrictions, special occasions, or preferences?"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Reservation
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {reservations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500">No reservations found</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first reservation
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-2">
                      <p className="font-semibold text-lg text-gray-900">
                        {format(new Date(reservation.reservationDate), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.status)}`}>
                        {getStatusText(reservation.status)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-600">
                        <span className="font-medium">Time:</span> {reservation.reservationTime}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Guests:</span> {reservation.partySize} {reservation.partySize === 1 ? 'person' : 'people'}
                      </p>
                      {reservation.specialRequests && (
                        <p className="text-sm text-gray-500 mt-2">
                          <span className="font-medium">Special requests:</span> {reservation.specialRequests}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Created: {format(new Date(reservation.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  {reservation.status !== 'cancelled' && (
                    <button
                      onClick={() => handleCancel(reservation.id)}
                      className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations;
import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { id: 1, name: 'Margherita Pizza', price: 12.99, category: 'Main' },
    { id: 2, name: 'Caesar Salad', price: 8.99, category: 'Appetizer' },
    { id: 3, name: 'Grilled Salmon', price: 18.99, category: 'Main' },
    { id: 4, name: 'Chocolate Cake', price: 6.99, category: 'Dessert' },
    { id: 5, name: 'Coca Cola', price: 2.99, category: 'Beverage' },
    { id: 6, name: 'Garlic Bread', price: 4.99, category: 'Appetizer' }
  ];

  // ✅ CORREGIDO: Eliminado _error, usando error normalmente
  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const addToCart = (item) => {
    const existing = cart.find(i => i.id === item.id);

    if (existing) {
      setCart(cart.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(i =>
        i.id === itemId ? { ...i, quantity } : i
      ));
    }
  };

  const getTotal = () => {
    return cart
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2);
  };

  // ✅ CORREGIDO: Eliminado _error
  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    const orderData = {
      items: cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: parseFloat(getTotal()),
      orderType: 'dine-in'
    };

    try {
      await api.post('/orders', orderData);
      toast.success('Order placed successfully');
      setCart([]);
      setShowForm(false);
      fetchOrders();
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      preparing: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-1">View and manage your orders</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            showForm 
              ? 'bg-gray-500 text-white hover:bg-gray-600' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {showForm ? 'Cancel' : '+ New Order'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Place New Order</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {menuItems.map(item => (
              <div
                key={item.id}
                className="border rounded-lg p-3 flex justify-between items-center hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{item.category}</p>
                </div>

                <button
                  onClick={() => addToCart(item)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                >
                  Add
                </button>
              </div>
            ))}
          </div>

          {cart.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 text-gray-900">Shopping Cart</h3>

              <div className="space-y-2">
                {cart.map(item => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors flex items-center justify-center"
                      >
                        -
                      </button>

                      <span className="font-medium w-8 text-center">{item.quantity}</span>

                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors flex items-center justify-center"
                      >
                        +
                      </button>

                      <span className="font-semibold w-20 text-right">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-lg">Total:</p>
                  <p className="font-bold text-xl text-blue-600">${getTotal()}</p>
                </div>

                <button
                  onClick={handleSubmitOrder}
                  className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Place Order
                </button>
              </div>
            </div>
          )}

          {cart.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Your cart is empty</p>
              <p className="text-sm mt-1">Add items from the menu above</p>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-gray-500">No orders found</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Place your first order
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {orders.map(order => (
              <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Order #{order.id?.slice(0, 8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>

                    <p className="font-bold mt-1 text-gray-900">
                      ${parseFloat(order.totalAmount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="text-sm text-gray-600">
                      {item.quantity}x {item.name}
                    </div>
                  ))}
                </div>

                {order.estimatedTime && order.status === 'preparing' && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700 flex items-center">
                      <span className="mr-2">⏱️</span>
                      Estimated ready in {order.estimatedTime} minutes
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
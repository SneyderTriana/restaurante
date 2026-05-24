// ✅ CORRECTO: Importaciones necesarias
import { useState } from 'react';           // Solo useState, no React
import { Link } from 'react-router-dom';    // Para navegación al login
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  // ✅ Estado separado correctamente
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''           // ✅ Sin confirmPassword
  });
  const [confirmPassword, setConfirmPassword] = useState(''); // ✅ Separado
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Validación correcta
    if (formData.password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    await register(formData);  // ✅ Solo envía formData
    setLoading(false);
  };

 
};

export default Register;
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''
  });

  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (formData.password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    await register(formData);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="firstName" onChange={handleChange} />
      <input name="lastName" onChange={handleChange} />
      <input name="email" onChange={handleChange} />
      <input name="password" onChange={handleChange} />

      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button disabled={loading}>Register</button>
    </form>
  );
};

export default Register;
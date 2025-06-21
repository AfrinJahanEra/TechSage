// src/components/auth/SignupForm.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    university: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    secretKey: ''
  });
  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.university) newErrors.university = 'University is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.endsWith('.edu')) {
      newErrors.email = 'Must be a valid university email (.edu)';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (formData.role === 'admin' || formData.role === 'moderator') {
      if (!formData.secretKey) {
        newErrors.secretKey = 'Secret key is required for this role';
      } else if (formData.secretKey !== 'academic123') {
        newErrors.secretKey = 'Invalid secret key';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (validate()) {
      // In a real app, you would send OTP to the user's email
      setLoading(true);
      setTimeout(() => {
        setOtpSent(true);
        setLoading(false);
      }, 1000);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    // In a real app, you would verify OTP from backend
    if (otp === '123456') { // Mock OTP
      setOtpVerified(true);
    } else {
      setErrors({ ...errors, otp: 'Invalid OTP' });
    }
  };

const handleSubmit = (e) => {
  e.preventDefault();
  if (validate() && otpVerified) {
    setLoading(true);
    // In a real app, you would send data to your backend
    setTimeout(() => {
      const userData = {
        id: Math.random().toString(36).substring(7),
        name: formData.name,
        email: formData.email,
        university: formData.university,
        role: formData.role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=1abc9c&color=fff`
      };
      login(userData);
      
      // Redirect based on role
      if (formData.role === 'admin') {
        navigate('/admin');
      } else if (formData.role === 'moderator') {
        navigate('/moderator');
      } else {
        navigate('/home');
      }
      
      setLoading(false);
    }, 1500);
  }
};

  const handleGoogleSignup = () => {
    // In a real app, implement Google OAuth
    alert('Google signup would be implemented here');
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-teal-700 mb-6">Create Account</h2>
      
      {!otpSent ? (
        <form onSubmit={handleSendOtp}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="university">University Name</label>
            <input
              type="text"
              id="university"
              name="university"
              value={formData.university}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${errors.university ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.university && <p className="text-red-500 text-sm mt-1">{errors.university}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">University Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="example@university.edu"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="user">Regular User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {(formData.role === 'admin' || formData.role === 'moderator') && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="secretKey">Secret Key</label>
              <input
                type="password"
                id="secretKey"
                name="secretKey"
                value={formData.secretKey}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded ${errors.secretKey ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter secret key for this role"
              />
              {errors.secretKey && <p className="text-red-500 text-sm mt-1">{errors.secretKey}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {loading ? 'Sending OTP...' : 'Send Verification OTP'}
          </button>

          <div className="mt-4 text-center">
            <p className="text-gray-600">Already have an account? <Link to="/login" className="text-teal-600 hover:underline">Login</Link></p>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={handleGoogleSignup}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <i className="fab fa-google text-red-500 mr-2"></i>
                Sign up with Google
              </button>
            </div>
          </div>
        </form>
      ) : !otpVerified ? (
        <form onSubmit={handleVerifyOtp}>
          <div className="mb-4">
            <p className="text-gray-700 mb-4">We've sent a 6-digit verification code to <span className="font-semibold">{formData.email}</span>. Please enter it below:</p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
              className="w-full px-3 py-2 border border-gray-300 rounded text-center text-xl tracking-widest"
              placeholder="123456"
            />
            {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="text-teal-600 hover:underline"
            >
              Back to form
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <i className="fas fa-check text-green-500 text-2xl"></i>
              </div>
            </div>
            <p className="text-gray-700 text-center mb-6">Your email has been verified! Click below to complete your registration.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Complete Registration'}
          </button>
        </form>
      )}
    </div>
  );
};

export default SignupForm;
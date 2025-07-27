import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { auth, provider, signInWithPopup } from '../../firebase.js';
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
  const { register, api } = useAuth();
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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        const response = await api.post('/api/auth/send-otp/', { email: formData.email });
        setOtpSent(true);
        setErrors({});
      } catch (error) {
        setErrors({
          api: error.response?.data?.error || error.response?.data?.details || 'Failed to send OTP. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/api/auth/verify-otp/', {
        email: formData.email,
        otp_code: otp
      });
      if (response.data.email_verified) {
        setOtpVerified(true);
        setErrors({});
      }
    } catch (error) {
      setErrors({
        otp: error.response?.data?.error || 'Invalid OTP. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate() && otpVerified) {
      setLoading(true);
      try {
        const username = formData.name.replace(/\s+/g, '').toLowerCase();
        const userData = {
          username,
          email: formData.email,
          password: formData.password,
          university: formData.university,
          role: formData.role,
          source: 'email'
        };
        await register(userData);
        if (formData.role === 'admin') {
          navigate('/admin');
        } else if (formData.role === 'moderator') {
          navigate('/moderator');
        } else {
          navigate('/home');
        }
      } catch (error) {
        setErrors({
          api: error.error || error.response?.data?.error || 'Registration failed. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    } else if (!otpVerified) {
      setErrors({ api: 'Please verify your email with OTP before registering.' });
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const username = user.displayName?.replace(/\s+/g, '').toLowerCase() || 'googleuser';
      const userData = {
        username,
        email: user.email,
        password: user.uid + '_google',
        university: 'unknown',
        role: 'user',
        source: 'google'
      };
      await register(userData);
      navigate('/home');
    } catch (error) {
      console.error('Google Sign-in Error:', error);
      setErrors({
        api: error.response?.data?.error || error.message || 'Google sign-in failed'
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row-reverse bg-gray-100 font-sans">
      {/* Animated Right Panel */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="lg:w-1/2 bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center p-8 lg:p-12"
      >
        <div className="relative w-full h-full flex flex-col justify-center text-white">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Join Us!
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg md:text-xl"
          >
            Create an account to start your journey.
          </motion.p>
          {/* Floating Shapes */}
          <motion.div
            className="absolute top-10 right-10 w-20 h-20 bg-white bg-opacity-20 rounded-full"
            animate={{ y: [0, -30, 0], scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 4 }}
          />
          <motion.div
            className="absolute bottom-10 left-10 w-16 h-16 bg-white bg-opacity-20 rounded-full"
            animate={{ y: [0, 30, 0], scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 5 }}
          />
        </div>
      </motion.div>

      {/* Left Panel: Signup Form (No Card) */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="lg:w-1/2 flex items-center justify-center p-6 sm:p-10"
      >
        <div className="w-full max-w-md bg-white p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
            <p className="mt-3 text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-teal-600 hover:text-teal-700 transition-colors duration-200">
                Sign in here
              </Link>
            </p>
          </div>

          {errors.api && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 text-sm text-red-400 text-center font-medium"
            >
              {errors.api}
            </motion.p>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-7">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <motion.input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  whileFocus={{ scale: 1.01 }}
                  className={`mt-2 block w-full px-4 py-3.5 border ${errors.name ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-sm`}
                  aria-invalid={errors.name ? 'true' : 'false'}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && <p id="name-error" className="mt-1 text-sm text-red-400">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="university" className="block text-sm font-medium text-gray-700">University Name</label>
                <motion.input
                  type="text"
                  id="university"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  whileFocus={{ scale: 1.01 }}
                  className={`mt-2 block w-full px-4 py-3.5 border ${errors.university ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-sm`}
                  aria-invalid={errors.university ? 'true' : 'false'}
                  aria-describedby={errors.university ? 'university-error' : undefined}
                />
                {errors.university && <p id="university-error" className="mt-1 text-sm text-red-400">{errors.university}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">University Email</label>
                <motion.input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  whileFocus={{ scale: 1.01 }}
                  className={`mt-2 block w-full px-4 py-3.5 border ${errors.email ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-sm`}
                  placeholder="example@university.edu"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && <p id="email-error" className="mt-1 text-sm text-red-400">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <motion.input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  whileFocus={{ scale: 1.01 }}
                  className={`mt-2 block w-full px-4 py-3.5 border ${errors.password ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-sm`}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                {errors.password && <p id="password-error" className="mt-1 text-sm text-red-400">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <motion.input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  whileFocus={{ scale: 1.01 }}
                  className={`mt-2 block w-full px-4 py-3.5 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-sm`}
                  aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                  aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                />
                {errors.confirmPassword && <p id="confirmPassword-error" className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                <motion.select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  whileFocus={{ scale: 1.01 }}
                  className="mt-2 block w-full px-4 py-3.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-sm"
                >
                  <option value="user">Regular User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </motion.select>
              </div>

              {(formData.role === 'admin' || formData.role === 'moderator') && (
                <div>
                  <label htmlFor="secretKey" className="block text-sm font-medium text-gray-700">Secret Key</label>
                  <motion.input
                    type="password"
                    id="secretKey"
                    name="secretKey"
                    value={formData.secretKey}
                    onChange={handleChange}
                    whileFocus={{ scale: 1.01 }}
                    className={`mt-2 block w-full px-4 py-3.5 border ${errors.secretKey ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-sm`}
                    placeholder="Enter secret key for this role"
                    aria-invalid={errors.secretKey ? 'true' : 'false'}
                    aria-describedby={errors.secretKey ? 'secretKey-error' : undefined}
                  />
                  {errors.secretKey && <p id="secretKey-error" className="mt-1 text-sm text-red-400">{errors.secretKey}</p>}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 px-4 bg-teal-600 text-white rounded-lg font-medium text-sm hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </>
                ) : 'Send Verification OTP'}
              </motion.button>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="font-medium text-teal-600 hover:text-teal-700 transition-colors duration-200">
                    Sign in
                  </Link>
                </p>
              </div>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500">Or sign up with</span>
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={handleGoogleSignup}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4 w-full py-3.5 px-4 border border-teal-200 rounded-lg bg-teal-50 text-sm font-medium text-teal-700 hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2 text-teal-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                  Sign up with Google
                </motion.button>
              </div>
            </form>
          ) : !otpVerified ? (
            <form onSubmit={handleVerifyOtp} className="space-y-7">
              <div>
                <p className="text-gray-700 mb-4 text-sm">
                  We've sent a 6-digit verification code to{' '}
                  <span className="font-semibold">{formData.email}</span>. Please enter it below:
                </p>
                <motion.input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                  whileFocus={{ scale: 1.01 }}
                  className={`block w-full px-4 py-3.5 border ${errors.otp ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-xl text-center tracking-widest`}
                  placeholder="123456"
                  aria-invalid={errors.otp ? 'true' : 'false'}
                  aria-describedby={errors.otp ? 'otp-error' : undefined}
                />
                {errors.otp && <p id="otp-error" className="mt-1 text-sm text-red-400">{errors.otp}</p>}
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 px-4 bg-teal-600 text-white rounded-lg font-medium text-sm hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : 'Verify OTP'}
              </motion.button>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-sm text-teal-600 hover:text-teal-700 transition-colors duration-200"
                >
                  Back to form
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-7">
              <div>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                <p className="text-gray-700 text-center mb-6 text-sm">Your email has been verified! Click below to complete your registration.</p>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 px-4 bg-teal-600 text-white rounded-lg font-medium text-sm hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </>
                ) : 'Complete Registration'}
              </motion.button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SignupForm;
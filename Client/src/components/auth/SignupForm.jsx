import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.university) newErrors.university = 'University is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.endsWith('.edu')) {
      newErrors.email = 'Must be a .edu email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'At least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (formData.role === 'admin' || formData.role === 'moderator') {
      if (!formData.secretKey) {
        newErrors.secretKey = 'Key is required';
      } else if (formData.secretKey !== 'academic123') {
        newErrors.secretKey = 'Invalid key';
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
          api: error.response?.data?.error || error.response?.data?.details || 'Failed to send OTP.'
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
        otp: error.response?.data?.error || 'Invalid OTP.'
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
          api: error.error || error.response?.data?.error || 'Registration failed.'
        });
      } finally {
        setLoading(false);
      }
    } else if (!otpVerified) {
      setErrors({ api: 'Please verify your email with OTP.' });
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  };

  const floatingShapeVariants = {
    float: {
      y: [0, -20, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    floatReverse: {
      y: [0, 20, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row-reverse bg-teal-50 font-sans overflow-hidden">
      {/* Animated Right Panel */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="lg:w-1/2 bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center p-6 lg:p-8"
      >
        <div className="relative w-full h-full flex flex-col justify-center text-white">
          <motion.h1
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold mb-2"
          >
            Join Us!
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-base md:text-lg"
          >
            Start your journey.
          </motion.p>
          {/* Animated Bubbles */}
          <motion.div
            className="absolute top-8 right-8 w-24 h-24 bg-teal-200 bg-opacity-30 rounded-full"
            variants={floatingShapeVariants}
            animate="float"
          />
          <motion.div
            className="absolute bottom-8 left-8 w-20 h-20 bg-teal-200 bg-opacity-30 rounded-full"
            variants={floatingShapeVariants}
            animate="floatReverse"
          />
        </div>
      </motion.div>

      {/* Left Panel: Signup Form */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-sm"
        >
          <motion.div variants={itemVariants} className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1 bg-gradient-to-r from-teal-500 to-teal-700 bg-clip-text text-transparent">
              Get Started
            </h2>
            <p className="text-xs text-gray-500">
              Create your account
            </p>
          </motion.div>

          <AnimatePresence>
            {errors.api && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4 overflow-hidden"
              >
                <div className="p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-xs font-medium">
                  {errors.api}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!otpSent ? (
            <motion.form
              onSubmit={handleSendOtp}
              className="space-y-4"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <motion.input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    whileFocus={{ boxShadow: '0 0 0 2px rgba(13, 148, 136, 0.2)', borderColor: 'rgb(20, 184, 166)' }}
                    className={`w-full px-3 py-2.5 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-sm bg-white`}
                    aria-invalid={errors.name ? 'true' : 'false'}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-3 top-2.5"
                    >
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1 text-xs text-red-400"
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="university" className="block text-xs font-medium text-gray-700 mb-1">University</label>
                <div className="relative">
                  <motion.input
                    type="text"
                    id="university"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    autoComplete="organization"
                    whileFocus={{ boxShadow: '0 0 0 2px rgba(13, 148, 136, 0.2)', borderColor: 'rgb(20, 184, 166)' }}
                    className={`w-full px-3 py-2.5 border ${errors.university ? 'border-red-300' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-sm bg-white`}
                    aria-invalid={errors.university ? 'true' : 'false'}
                    aria-describedby={errors.university ? 'university-error' : undefined}
                  />
                  {errors.university && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-3 top-2.5"
                    >
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {errors.university && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1 text-xs text-red-400"
                    >
                      {errors.university}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">University Email</label>
                <div className="relative">
                  <motion.input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    whileFocus={{ boxShadow: '0 0 0 2px rgba(13, 148, 136, 0.2)', borderColor: 'rgb(20, 184, 166)' }}
                    className={`w-full px-3 py-2.5 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-sm bg-white`}
                    placeholder="e.g., name@university.edu"
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-3 top-2.5"
                    >
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1 text-xs text-red-400"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <motion.input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    whileFocus={{ boxShadow: '0 0 0 2px rgba(13, 148, 136, 0.2)', borderColor: 'rgb(20, 184, 166)' }}
                    className={`w-full px-3 py-2.5 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-sm bg-white`}
                    aria-invalid={errors.password ? 'true' : 'false'}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  {errors.password && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-3 top-2.5"
                    >
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1 text-xs text-red-400"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <motion.input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    whileFocus={{ boxShadow: '0 0 0 2px rgba(13, 148, 136, 0.2)', borderColor: 'rgb(20, 184, 166)' }}
                    className={`w-full px-3 py-2.5 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-sm bg-white`}
                    aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                    aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                  />
                  {errors.confirmPassword && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-3 top-2.5"
                    >
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1 text-xs text-red-400"
                    >
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="role" className="block text-xs font-medium text-gray-700 mb-1">Account Type</label>
                <motion.select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  whileFocus={{ boxShadow: '0 0 0 2px rgba(13, 148, 136, 0.2)', borderColor: 'rgb(20, 184, 166)' }}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </motion.select>
              </motion.div>

              {(formData.role === 'admin' || formData.role === 'moderator') && (
                <motion.div variants={itemVariants}>
                  <label htmlFor="secretKey" className="block text-xs font-medium text-gray-700 mb-1">Verification Key</label>
                  <div className="relative">
                    <motion.input
                      type="password"
                      id="secretKey"
                      name="secretKey"
                      value={formData.secretKey}
                      onChange={handleChange}
                      whileFocus={{ boxShadow: '0 0 0 2px rgba(13, 148, 136, 0.2)', borderColor: 'rgb(20, 184, 166)' }}
                      className={`w-full px-3 py-2.5 border ${errors.secretKey ? 'border-red-300' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-sm bg-white`}
                      placeholder="Enter verification key"
                      aria-invalid={errors.secretKey ? 'true' : 'false'}
                      aria-describedby={errors.secretKey ? 'secretKey-error' : undefined}
                    />
                    {errors.secretKey && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-3 top-2.5"
                      >
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                  <AnimatePresence>
                    {errors.secretKey && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-1 text-xs text-red-400"
                      >
                        {errors.secretKey}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-md font-medium text-sm hover:from-teal-500 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  aria-label="Send OTP"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending OTP...
                    </>
                  ) : 'Send OTP Code'}
                </motion.button>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-teal-50 text-gray-500">Or sign up with</span>
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={handleGoogleSignup}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-3 w-full py-3 px-4 border border-teal-200 rounded-md bg-teal-50 text-xs font-medium text-teal-700 hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
                  aria-label="Sign up with Google"
                >
                  <svg className="w-4 h-4 mr-2 text-teal-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                  Google Signup
                </motion.button>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-3 text-center text-xs text-gray-500">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-teal-600 hover:text-teal-700 transition-colors duration-200 underline underline-offset-2"
                >
                  Sign in
                </Link>
              </motion.div>
            </motion.form>
          ) : !otpVerified ? (
            <motion.form
              onSubmit={handleVerifyOtp}
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <p className="text-gray-700 mb-3 text-xs">
                  Verification code sent to <span className="font-semibold">{formData.email}</span>:
                </p>
                <div className="relative">
                  <motion.input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength="6"
                    whileFocus={{ boxShadow: '0 0 0 2px rgba(13, 148, 136, 0.2)', borderColor: 'rgb(20, 184, 166)' }}
                    className={`block w-full px-3 py-3 border ${errors.otp ? 'border-red-300' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-lg text-center tracking-widest`}
                    placeholder="123456"
                    aria-invalid={errors.otp ? 'true' : 'false'}
                    aria-describedby={errors.otp ? 'otp-error' : undefined}
                  />
                  {errors.otp && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-3 top-3"
                    >
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {errors.otp && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1 text-xs text-red-400"
                    >
                      {errors.otp}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div variants={itemVariants}>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-teal-500 text-sm font-medium text-white rounded-md hover:from-teal-500 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Verify OTP"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : 'Verify Code'}
                </motion.button>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-xs text-teal-600 hover:text-teal-700 transition-colors duration-200"
                  aria-label="Back to form"
                >
                  Back to form
                </button>
              </motion.div>
            </motion.form>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                <p className="text-gray-700 text-center mb-3 text-xs">
                  Email verified! Complete your registration.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-teal-500 text-sm font-medium text-white rounded-md hover:from-teal-500 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Complete Registration"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </>
                  ) : 'Complete Registration'}
                </motion.button>
              </motion.div>
            </motion.form>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignupForm;
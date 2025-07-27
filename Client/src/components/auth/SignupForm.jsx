import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, provider, signInWithPopup } from '../../firebase.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, api } = useAuth();
  const navigate = useNavigate();

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    let label = '';
    if (score <= 2) label = 'Weak';
    else if (score <= 4) label = 'Medium';
    else label = 'Strong';

    return { score, label };
  };

  // Username format validator
  const validateUsernameFormat = (username) => {
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
    if (!usernameRegex.test(username)) {
      return 'Username must start with a letter and contain only letters, numbers, or underscores';
    }
    return null;
  };

  // Update password strength on password change
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(checkPasswordStrength(formData.password));
    } else {
      setPasswordStrength({ score: 0, label: '' });
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = async () => {
    let isValid = true;

    // Validate username format and uniqueness
    if (!formData.name) {
      toast.error('Name is required', { position: 'top-right', autoClose: 3000, theme: 'light', toastId: 'name-error' });
      isValid = false;
    } else {
      const username = formData.name.replace(/\s+/g, '').toLowerCase();
      const usernameFormatError = validateUsernameFormat(username);
      if (usernameFormatError) {
        toast.error(usernameFormatError, { position: 'top-right', autoClose: 3000, theme: 'light', toastId: 'username-format-error' });
        isValid = false;
      } else {
        try {
          const response = await api.post('/api/auth/check-username/', { username });
          if (!response.data.available) {
            toast.error('Username is already taken', { position: 'top-right', autoClose: 3000, theme: 'light', toastId: 'username-taken-error' });
            isValid = false;
          }
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Failed to verify username. Please try again.';
          toast.error(errorMessage, {
            position: 'top-right',
            autoClose: 3000,
            theme: 'light',
            toastId: 'username-check-error'
          });
          isValid = false;
        }
      }
    }

    if (!formData.university) {
      toast.error('University is required', { position: 'top-right', autoClose: 3000, theme: 'light', toastId: 'university-error' });
      isValid = false;
    }

    if (!formData.email) {
      toast.error('Email is required', { position: 'top-right', autoClose: 3000, theme: 'light', toastId: 'email-error' });
      isValid = false;
    } else if (!formData.email.endsWith('.edu')) {
      toast.error('Must be a .edu email', { position: 'top-right', autoClose: 3000, theme: 'light', toastId: 'email-format-error' });
      isValid = false;
    }

    if (!formData.password) {
      toast.error('Password is required', { position: 'top-right', autoClose: 3000, theme: 'light', toastId: 'password-error' });
      isValid = false;
    } else {
      const { score } = checkPasswordStrength(formData.password);
      if (score < 4) {
        toast.error('Password must be at least 8 characters, include uppercase, lowercase, number, and special character', {
          position: 'top-right',
          autoClose: 3000,
          theme: 'light',
          toastId: 'password-strength-error'
        });
        isValid = false;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match', { position: 'top-right', autoClose: 3000, theme: 'light', toastId: 'confirm-password-error' });
      isValid = false;
    }

    if (formData.role === 'admin' || formData.role === 'moderator') {
      if (!formData.secretKey) {
        toast.error('Verification key is required', { position: 'top-right', autoClose: 3000, theme: 'light', toastId: 'secret-key-error' });
        isValid = false;
      } else if (formData.secretKey !== 'academic123') {
        toast.error('Invalid verification key', { position: 'top-right', autoClose: 3000, theme: 'light', toastId: 'secret-key-invalid-error' });
        isValid = false;
      }
    }

    return isValid;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (await validate()) {
      setLoading(true);
      try {
        const response = await api.post('/api/auth/send-otp/', { email: formData.email });
        setOtpSent(true);
        toast.success('OTP sent to your email', { position: 'top-right', autoClose: 3000, theme: 'light', toastId: 'otp-sent' });
      } catch (error) {
        toast.error(error.response?.data?.error || error.response?.data?.details || 'Failed to send OTP', {
          position: 'top-right',
          autoClose: 3000,
          theme: 'light',
          toastId: 'otp-error'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length === 6) {
      setLoading(true);
      try {
        const response = await api.post('/api/auth/verify-otp/', {
          email: formData.email,
          otp_code: otpString
        });
        if (response.data.email_verified) {
          setOtpVerified(true);
          toast.success('Email verified successfully', { position: 'top-right', autoClose: 3000, theme: 'light', toastId: 'otp-verified' });
        }
      } catch (error) {
        toast.error(error.response?.data?.error || 'Invalid OTP', {
          position: 'top-right',
          autoClose: 3000,
          theme: 'light',
          toastId: 'otp-invalid'
        });
      } finally {
        setLoading(false);
      }
    } else {
      toast.error('Please enter all 6 digits', { position: 'top-right', autoClose: 3000, theme: 'light', toastId: 'otp-digits' });
    }
  };

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Limit to 1 character
    setOtp(newOtp);

    // Move focus to next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }

    // Move focus to previous input on backspace
    if (!value && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const username = user.displayName?.replace(/\s+/g, '').toLowerCase() || 'googleuser';
      // Check username format
      const usernameFormatError = validateUsernameFormat(username);
      if (usernameFormatError) {
        toast.error(usernameFormatError, { position: 'top-right', autoClose: 3000, theme: 'light', toastId: 'google-username-format-error' });
        return;
      }
      // Check username uniqueness
      const response = await api.post('/api/auth/check-username/', { username });
      if (!response.data.available) {
        toast.error('Username is already taken. Please try a different name.', {
          position: 'top-right',
          autoClose: 3000,
          theme: 'light',
          toastId: 'google-username-taken'
        });
        return;
      }
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
      toast.success('Signed up successfully with Google', { position: 'top-right', autoClose: 3000, theme: 'light', toastId: 'google-signup-success' });
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || 'Google sign-in failed', {
        position: 'top-right',
        autoClose: 3000,
        theme: 'light',
        toastId: 'google-signup-error'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await validate() && otpVerified) {
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
        toast.success('Registration completed successfully', { position: 'top-right', autoClose: 3000, theme: 'light', toastId: 'registration-success' });
        if (formData.role === 'admin') {
          navigate('/admin');
        } else if (formData.role === 'moderator') {
          navigate('/moderator');
        } else {
          navigate('/home');
        }
      } catch (error) {
        toast.error(error.error || error.response?.data?.error || 'Registration failed', {
          position: 'top-right',
          autoClose: 3000,
          theme: 'light',
          toastId: 'registration-error'
        });
      } finally {
        setLoading(false);
      }
    } else if (!otpVerified) {
      toast.error('Please verify your email with OTP', { position: 'top-right', autoClose: 3000, theme: 'light', toastId: 'otp-not-verified' });
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
      {/* Right Panel: Text Only */}
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
            Welcome To TechSage
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg md:text-xl"
          >
            Sign Up & Start Your Journey
          </motion.p>
          {/* Floating Shapes */}
          <motion.div
            className="absolute top-10 right-10 w-20 h-20 bg-white bg-opacity-20 rounded-full"
            animate={{
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ repeat: Infinity, duration: 4 }}
          />
          <motion.div
            className="absolute bottom-10 left-10 w-16 h-16 bg-white bg-opacity-20 rounded-full"
            animate={{
              y: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ repeat: Infinity, duration: 5 }}
          />
        </div>
      </motion.div>

      {/* Left Panel: Signup Form with Animated Bubbles */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8"
      >
        <div className="relative w-full max-w-sm">
          {/* Animated Bubbles */}
          <motion.div
            className="absolute top-8 left-8 w-24 h-24 bg-teal-200 bg-opacity-30 rounded-full z-0"
            variants={floatingShapeVariants}
            animate="float"
          />
          <motion.div
            className="absolute bottom-8 right-8 w-20 h-20 bg-teal-200 bg-opacity-30 rounded-full z-0"
            variants={floatingShapeVariants}
            animate="floatReverse"
          />
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10"
          >
            <motion.div variants={itemVariants} className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1 bg-gradient-to-r from-teal-500 to-teal-700 bg-clip-text text-transparent">
                Get Started
              </h2>
              <p className="text-xs text-gray-500">
                Create your account
              </p>
            </motion.div>

            {!otpSent ? (
              <motion.form
                onSubmit={handleSendOtp}
                className="space-y-4"
                variants={containerVariants}
              >
                <motion.div variants={itemVariants}>
                  <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                  <motion.input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    whileFocus={{ boxShadow: '0 0 0 2px #0D948820', borderColor: '#14B8A6' }}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
                    aria-label="Full Name"
                    placeholder="e.g., JohnDoe_123"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label htmlFor="university" className="block text-xs font-medium text-gray-700 mb-1">University</label>
                  <motion.input
                    type="text"
                    id="university"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    autoComplete="organization"
                    whileFocus={{ boxShadow: '0 0 0 2px #0D948820', borderColor: '#14B8A6' }}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
                    aria-label="University"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">University Email</label>
                  <motion.input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    whileFocus={{ boxShadow: '0 0 0 2px #0D948820', borderColor: '#14B8A6' }}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
                    placeholder="e.g., name@university.edu"
                    aria-label="University Email"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                  <motion.input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    whileFocus={{ boxShadow: '0 0 0 2px #0D948820', borderColor: '#14B8A6' }}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
                    aria-label="Password"
                  />
                  {formData.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2"
                    >
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              passwordStrength.score <= 2 ? 'bg-red-500' :
                              passwordStrength.score <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs text-gray-600">{passwordStrength.label}</span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label>
                  <motion.input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    whileFocus={{ boxShadow: '0 0 0 2px #0D948820', borderColor: '#14B8A6' }}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
                    aria-label="Confirm Password"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label htmlFor="role" className="block text-xs font-medium text-gray-700 mb-1">Account Type</label>
                  <motion.select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    whileFocus={{ boxShadow: '0 0 0 2px #0D948820', borderColor: '#14B8A6' }}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
                    aria-label="Account Type"
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </motion.select>
                </motion.div>

                {(formData.role === 'admin' || formData.role === 'moderator') && (
                  <motion.div variants={itemVariants}>
                    <label htmlFor="secretKey" className="block text-xs font-medium text-gray-700 mb-1">Verification Key</label>
                    <motion.input
                      type="password"
                      id="secretKey"
                      name="secretKey"
                      value={formData.secretKey}
                      onChange={handleChange}
                      whileFocus={{ boxShadow: '0 0 0 2px #0D948820', borderColor: '#14B8A6' }}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
                      placeholder="Enter verification key"
                      aria-label="Verification Key"
                    />
                  </motion.div>
                )}

                <motion.div variants={itemVariants}>
                  <motion.button
                    type="submit"
                    disabled={loading}
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
                  <div className="relative flex justify-center">
                    <motion.div
                      variants={containerVariants}
                      className="flex space-x-2"
                    >
                      {otp.map((digit, index) => (
                        <motion.input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          whileFocus={{ boxShadow: '0 0 0 2px #0D948820', borderColor: '#14B8A6' }}
                          className="w-12 h-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-center text-xl font-mono bg-white"
                          variants={itemVariants}
                          aria-label={`Digit ${index + 1}`}
                        />
                      ))}
                    </motion.div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <motion.button
                    type="submit"
                    disabled={loading}
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
        </div>
      </motion.div>
    </div>
  );
};

export default SignupForm;
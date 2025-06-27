// src/pages/auth/SignupPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Loader2, UserPlus, GraduationCap, Users, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { useFormValidation } from '../../hooks/useFormValidation';
import { SignupData } from '../../types/auth';
import ErrorAlert from '../../components/common/ErrorAlert';
import ConnectionStatus from './ConnectionStatus';

const SignupForm: React.FC = () => {
  const navigate = useNavigate();
  const { signup, isReqLoading } = useAuth();
  const { error, errorType, isError, clearError } = useErrorHandler();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const validationRules = {
    firstName: {
      required: true,
      minLength: 2,
    },
    lastName: {
      required: true,
      minLength: 2,
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      required: true,
      minLength: 6,
    },
    confirmPassword: {
      required: true,
      custom: (value: string) => {
        return value !== values.password ? 'Passwords do not match' : null;
      },
    },
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
  } = useFormValidation<SignupData>(
    { 
      firstName: '', 
      lastName: '', 
      email: '', 
      password: '', 
      confirmPassword: '', 
      role: 'student' 
    },
    validationRules
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    clearError();

    if (!validateForm()) {
      setSubmitError('Please fix the errors below');
      return;
    }

    try {
      const result = await signup(values);
      
      if (result.success) {
        navigate('/login', { replace: true });
      } else if (result.error) {
        setSubmitError(result.error);
      }
    } catch (error: any) {
      setSubmitError('An unexpected error occurred. Please try again.');
    }
  };

  const handleInputChange = (field: keyof SignupData, value: string) => {
    handleChange(field, value);
    if (submitError) setSubmitError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
      <ErrorAlert
        error={error}
        errorType={errorType}
        isVisible={isError}
        onClose={clearError}
      />

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 p-6 xl:p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute bottom-32 left-32 w-40 h-40 bg-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-white rounded-full"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="flex items-center mb-6 lg:mb-8">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-xl flex items-center justify-center mr-3 lg:mr-4">
              <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Join M3S Req Eng</h1>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 lg:mb-6 leading-tight">
            Start Your Requirements Engineering Journey
          </h2>

          <p className="text-lg lg:text-xl text-green-100 mb-8 lg:mb-12 leading-relaxed">
            Create your account and begin learning with our comprehensive, interactive platform.
          </p>

          <div className="space-y-3 lg:space-y-4">
            <div className="flex items-center text-green-100 text-sm lg:text-base">
              <div className="w-2 h-2 bg-green-300 rounded-full mr-3"></div>
              Personalized learning paths
            </div>
            <div className="flex items-center text-green-100 text-sm lg:text-base">
              <div className="w-2 h-2 bg-green-300 rounded-full mr-3"></div>
              Expert AI mentors and team collaboration
            </div>
            <div className="flex items-center text-green-100 text-sm lg:text-base">
              <div className="w-2 h-2 bg-green-300 rounded-full mr-3"></div>
              Real-world project experience
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
            <div className="text-center mb-6 sm:mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"
              >
                <UserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </motion.div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1 sm:mb-2">Create Account</h2>
              <p className="text-sm sm:text-base text-slate-600">Join our learning platform today</p>
            </div>

            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm"
              >
                {submitError}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      id="firstName"
                      type="text"
                      value={values.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      onBlur={() => handleBlur('firstName')}
                      className={`w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm sm:text-base ${
                        touched.firstName && errors.firstName
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-slate-300 focus:ring-green-500'
                      }`}
                      placeholder="First name"
                      disabled={isReqLoading}
                    />
                  </div>
                  {touched.firstName && errors.firstName && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      id="lastName"
                      type="text"
                      value={values.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      onBlur={() => handleBlur('lastName')}
                      className={`w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm sm:text-base ${
                        touched.lastName && errors.lastName
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-slate-300 focus:ring-green-500'
                      }`}
                      placeholder="Last name"
                      disabled={isReqLoading}
                    />
                  </div>
                  {touched.lastName && errors.lastName && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    id="email"
                    type="email"
                    value={values.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className={`w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm sm:text-base ${
                      touched.email && errors.email
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-slate-300 focus:ring-green-500'
                    }`}
                    placeholder="Enter your email"
                    disabled={isReqLoading}
                  />
                </div>
                {touched.email && errors.email && (
                  <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 sm:mb-3">
                  I am a...
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <motion.label
                    className={`relative flex items-center p-2.5 sm:p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      values.role === 'student'
                        ? 'border-green-500 bg-green-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input
                      type="radio"
                      value="student"
                      checked={values.role === 'student'}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="sr-only"
                    />
                    <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
                    <span className="text-sm font-medium">Student</span>
                  </motion.label>

                  <motion.label
                    className={`relative flex items-center p-2.5 sm:p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      values.role === 'lecturer'
                        ? 'border-green-500 bg-green-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input
                      type="radio"
                      value="lecturer"
                      checked={values.role === 'lecturer'}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="sr-only"
                    />
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
                    <span className="text-sm font-medium">Lecturer</span>
                  </motion.label>
                </div>
              </div>

              {/* Password Fields */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    className={`w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm sm:text-base ${
                      touched.password && errors.password
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-slate-300 focus:ring-green-500'
                    }`}
                    placeholder="Create a password"
                    disabled={isReqLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    disabled={isReqLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={values.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    className={`w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm sm:text-base ${
                      touched.confirmPassword && errors.confirmPassword
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-slate-300 focus:ring-green-500'
                    }`}
                    placeholder="Confirm your password"
                    disabled={isReqLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    disabled={isReqLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isReqLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base"
                whileHover={{ scale: isReqLoading ? 1 : 1.02 }}
                whileTap={{ scale: isReqLoading ? 1 : 0.98 }}
              >
                {isReqLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" />
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </motion.button>
            </form>

            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-slate-600 text-sm sm:text-base">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-green-600 hover:text-green-700 font-semibold transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Connection Status */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-200 text-center">
              <ConnectionStatus />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupForm;
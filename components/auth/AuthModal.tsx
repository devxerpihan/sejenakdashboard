'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useSignIn, useSignUp, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  fullPage?: boolean; // If true, renders as full page instead of modal
  defaultMode?: 'signIn' | 'signUp'; // Default mode when opened
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, fullPage = false, defaultMode = 'signIn' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignIn, setIsSignIn] = useState(defaultMode === 'signIn');
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState('');

  const router = useRouter();
  const { signIn, isLoaded: signInLoaded, setActive: setSignInActive } = useSignIn();
  const { signUp, isLoaded: signUpLoaded, setActive: setSignUpActive } = useSignUp();
  const { user, isLoaded: userLoaded } = useUser();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setCode('');
      setError('');
      setSuccess('');
      setVerifying(false);
      setIsSignIn(defaultMode === 'signIn');
      setShowPassword(false);
    }
  }, [isOpen, defaultMode]);

  // Redirect if user is already signed in
  useEffect(() => {
    if (userLoaded && user && isOpen) {
      // Get redirect URL from search params if available
      const redirectUrl = typeof window !== 'undefined' 
        ? (new URLSearchParams(window.location.search).get('redirect') || 
           new URLSearchParams(window.location.search).get('redirect_url') || 
           '/dashboard')
        : '/dashboard';
      
      if (!fullPage) {
        onClose();
      }
      // Use window.location for a hard redirect to ensure it works
      window.location.href = redirectUrl;
    }
  }, [user, userLoaded, isOpen, onClose, fullPage]);

  const handleEmailAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignIn) {
        // Sign in flow
        const signInAttempt = await signIn?.create({
          identifier: email,
          password: password,
        });

        if (signInAttempt?.status === 'complete') {
          await setSignInActive?.({ session: signInAttempt.createdSessionId });
          setSuccess('Successfully signed in!');
          // Get redirect URL from search params if available
          const redirectUrl = typeof window !== 'undefined' 
            ? (new URLSearchParams(window.location.search).get('redirect') || 
               new URLSearchParams(window.location.search).get('redirect_url') || 
               '/dashboard')
            : '/dashboard';
          
          setTimeout(() => {
            if (!fullPage) {
              onClose();
            }
            // Use window.location for a hard redirect to ensure it works
            window.location.href = redirectUrl;
          }, 1000);
        } else {
          setError('Sign in failed. Please try again.');
        }
      } else {
        // Sign up flow
        await signUp?.create({
          emailAddress: email,
          password: password,
        });

        // Send verification email
        await signUp?.prepareEmailAddressVerification({
          strategy: 'email_code',
        });

        setVerifying(true);
        setSuccess('Verification code sent to your email!');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(getErrorMessage(error.errors?.[0]?.code || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const signUpAttempt = await signUp?.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt?.status === 'complete') {
        await setSignUpActive?.({ session: signUpAttempt.createdSessionId });
        setSuccess('Account created successfully!');
        // Get redirect URL from search params if available
        const redirectUrl = typeof window !== 'undefined' 
          ? (new URLSearchParams(window.location.search).get('redirect') || 
             new URLSearchParams(window.location.search).get('redirect_url') || 
             '/dashboard')
          : '/dashboard';
        
        setTimeout(() => {
          if (!fullPage) {
            onClose();
          }
          // Use window.location for a hard redirect to ensure it works
          window.location.href = redirectUrl;
        }, 1000);
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setError(getErrorMessage(error.errors?.[0]?.code || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      if (isSignIn) {
        await signIn?.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: '/sign-in/sso-callback',
          redirectUrlComplete: '/dashboard',
        });
      } else {
        await signUp?.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: '/sign-in/sso-callback',
          redirectUrlComplete: '/dashboard',
        });
      }
    } catch (error: any) {
      console.error('Google Sign-in error:', error);
      setError(getErrorMessage(error.errors?.[0]?.code || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'form_identifier_not_found':
        return 'No account found with this email address.';
      case 'form_password_incorrect':
        return 'Incorrect password. Please try again.';
      case 'form_identifier_exists':
        return 'An account with this email already exists.';
      case 'form_password_pwned':
        return 'This password has been compromised. Please choose a different password.';
      case 'form_password_too_short':
        return 'Password should be at least 8 characters long.';
      case 'form_identifier_invalid':
        return 'Please enter a valid email address.';
      case 'form_rate_limit_exceeded':
        return 'Too many failed attempts. Please try again later.';
      case 'form_code_incorrect':
        return 'Invalid verification code. Please try again.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  if (!isOpen) return null;

  // Show loading state while Clerk is initializing
  if (!signInLoaded || !signUpLoaded || !userLoaded) {
    if (fullPage) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          </div>
        </div>
      );
    }
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <div className="relative w-full max-w-sm mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Full page mode
  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-sm">
          {/* Modal Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 space-y-6">
              
              {/* Header */}
              <div className="text-center">
                <h3 className="text-xl font-medium text-gray-900 mb-1">
                  {verifying ? 'Verify your email' : (isSignIn ? 'Welcome back' : 'Create account')}
                </h3>
                <p className="text-sm text-gray-500">
                  {verifying 
                    ? 'Enter the code sent to your email' 
                    : (isSignIn ? 'Sign in to continue' : 'Get started with Antinium AI Canvas Editor')
                  }
                </p>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 p-3 bg-red-50 border border-red-100 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 p-3 bg-green-50 border border-green-100 rounded-lg"
                >
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <p className="text-sm text-green-600">{success}</p>
                </motion.div>
              )}

              {/* Verification Form */}
              {verifying ? (
                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="space-y-1">
                    <input
                      id="code"
                      name="code"
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                      placeholder="Enter verification code"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Email'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVerifying(false);
                      setError('');
                      setSuccess('');
                    }}
                    className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors"
                  >
                    Back to sign up
                  </button>
                </form>
              ) : (
                /* Auth Form */
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                      placeholder="Email address"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1">
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete={isSignIn ? 'current-password' : 'new-password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors pr-10"
                        placeholder="Password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                        {isSignIn ? 'Signing in...' : 'Creating account...'}
                      </>
                    ) : (
                      isSignIn ? 'Sign in' : 'Create account'
                    )}
                  </button>
                </form>
              )}

              {/* Divider */}
              {!verifying && (
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-400">or</span>
                  </div>
                </div>
              )}

              {/* Google Sign In */}
              {!verifying && (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-gray-700 font-medium">
                    Continue with Google
                  </span>
                </button>
              )}

              {/* Toggle Sign In/Up */}
              {!verifying && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignIn(!isSignIn);
                      setError('');
                      setSuccess('');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {isSignIn ? "Don't have an account? " : "Already have an account? "}
                    <span className="font-medium text-black">
                      {isSignIn ? 'Sign up' : 'Sign in'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modal mode
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-sm mx-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-150 border border-gray-100"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
          
          {/* Modal Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 space-y-6">
              
              {/* Header */}
              <div className="text-center">
                <h3 className="text-xl font-medium text-gray-900 mb-1">
                  {verifying ? 'Verify your email' : (isSignIn ? 'Welcome back' : 'Create account')}
                </h3>
                <p className="text-sm text-gray-500">
                  {verifying 
                    ? 'Enter the code sent to your email' 
                    : (isSignIn ? 'Sign in to continue' : 'Get started with Antinium AI Canvas Editor')
                  }
                </p>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 p-3 bg-red-50 border border-red-100 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 p-3 bg-green-50 border border-green-100 rounded-lg"
                >
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <p className="text-sm text-green-600">{success}</p>
                </motion.div>
              )}

              {/* Verification Form */}
              {verifying ? (
                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="space-y-1">
                    <input
                      id="code"
                      name="code"
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                      placeholder="Enter verification code"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Email'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVerifying(false);
                      setError('');
                      setSuccess('');
                    }}
                    className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors"
                  >
                    Back to sign up
                  </button>
                </form>
              ) : (
                /* Auth Form */
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                      placeholder="Email address"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1">
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete={isSignIn ? 'current-password' : 'new-password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors pr-10"
                        placeholder="Password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                        {isSignIn ? 'Signing in...' : 'Creating account...'}
                      </>
                    ) : (
                      isSignIn ? 'Sign in' : 'Create account'
                    )}
                  </button>
                </form>
              )}

              {/* Divider */}
              {!verifying && (
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-400">or</span>
                  </div>
                </div>
              )}

              {/* Google Sign In */}
              {!verifying && (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-gray-700 font-medium">
                    Continue with Google
                  </span>
                </button>
              )}

              {/* Toggle Sign In/Up */}
              {!verifying && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignIn(!isSignIn);
                      setError('');
                      setSuccess('');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {isSignIn ? "Don't have an account? " : "Already have an account? "}
                    <span className="font-medium text-black">
                      {isSignIn ? 'Sign up' : 'Sign in'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Eye,
  EyeOff,
  Shield,
  Smartphone,
  Loader2,
  Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LoginCard = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showResetBox, setShowResetBox] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        if (password !== confirmPassword) {
          toast({
            title: "Passwords don't match",
            description: 'Please make sure your passwords are the same.',
            variant: 'destructive',
          });
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Signup successful!',
          description: 'Welcome to SplitEase 🎉',
        });
      } else {
        await setPersistence(
          auth,
          rememberMe ? browserLocalPersistence : browserSessionPersistence
        );
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Login successful!',
          description: 'Welcome back to SplitEase.',
        });
      }
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: isSignup ? 'Signup failed' : 'Login failed',
        description: error.message || 'Something went wrong. Try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({
        title: 'Login successful!',
        description: 'Welcome via Google.',
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Google login failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 px-8 py-10 md:px-10 md:py-12 flex flex-col items-center">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
            <Smartphone className="w-7 h-7 text-white" />
          </div>
        </div>
        {/* Title/Description */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">{isSignup ? 'Create an account' : 'Welcome back'}</h2>
          <div className="text-slate-600 text-base font-medium">
            {isSignup ? 'Register to use SplitEase' : 'Sign in to your SplitEase account'}
          </div>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 font-semibold">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="h-11 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200/60 bg-white/80 text-base text-black transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="h-11 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200/60 bg-white/80 text-base text-black pr-10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 disabled:opacity-50"
                tabIndex={-1}
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {isSignup && (
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-slate-700 font-semibold">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="h-11 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200/60 bg-white/80 text-base text-black transition-all"
              />
            </div>
          )}
          {!isSignup && (
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  disabled={loading}
                  className="accent-blue-600 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-200/60"
                />
                <Label htmlFor="remember" className="text-sm text-slate-600 font-medium select-none cursor-pointer">
                  Remember me
                </Label>
              </div>
              <button
                type="button"
                onClick={() => setShowResetBox(true)}
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-base mt-2 scale-100 hover:scale-[1.03]"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isSignup ? 'Signing up...' : 'Signing in...'}
              </>
            ) : (
              isSignup ? 'Sign Up' : 'Sign In'
            )}
          </Button>
          {/* Divider with OR */}
          {!isSignup && (
            <div className="flex items-center my-2">
              <div className="flex-1 h-px bg-slate-300/60" />
              <span className="mx-4 text-slate-500 font-semibold text-sm">or</span>
              <div className="flex-1 h-px bg-slate-300/60" />
            </div>
          )}
          {/* Google Button */}
          {!isSignup && (
            <Button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full h-11 bg-white border border-gray-300 hover:shadow-md flex items-center justify-center gap-3 text-base font-semibold text-gray-700 rounded-xl transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  <span>Continue with Google</span>
                </>
              )}
            </Button>
          )}
          {/* Reset Password Box */}
          {showResetBox && (
            <div className="mt-6 p-4 border rounded-xl bg-blue-50/80 text-sm text-slate-800">
              <p className="mb-3 font-semibold">Reset your password</p>
              <Input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="mb-3 h-10 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200/60 bg-white/80 text-base text-black"
              />
              <div className="flex space-x-2">
                <Button
                  onClick={async () => {
                    try {
                      await sendPasswordResetEmail(auth, resetEmail);
                      toast({
                        title: "Reset link sent",
                        description: "Check your email to reset your password.",
                      });
                      setShowResetBox(false);
                      setResetEmail('');
                    } catch (error: any) {
                      toast({
                        title: "Failed to send reset link",
                        description: error.message,
                        variant: "destructive",
                      });
                    }
                  }}
                  className="bg-blue-600 text-white rounded-lg"
                >
                  Send Link
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowResetBox(false)}
                  className="rounded-lg"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </form>
        {/* Footer - Secure login badge */}
        <div className="flex flex-col items-center mt-8 space-y-2 w-full">
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm font-semibold">
            <Lock className="w-4 h-4" />
            <span>Secure login</span>
          </div>
          <div className="text-center text-sm text-slate-600">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginCard;

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Shield, Smartphone, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AuthForm = () => {
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signUp(email, password);
      setShowSignUp(false);
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await resetPassword(resetEmail);
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    }
    setLoading(false);
  };

  const handleRememberMeChange = (checked: boolean | 'indeterminate') => {
    setRememberMe(checked === true);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-white/95 backdrop-blur-md rounded-2xl">
      <CardHeader className="space-y-1 text-center pb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 via-violet-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-gray-800">Welcome back</CardTitle>
        <div className="text-gray-500">Sign in to your SplitEase account</div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        {!showSignUp && !showReset && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-gray-300 focus:border-purple-500 focus:ring-violet-400/40"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 border-gray-300 focus:border-purple-500 focus:ring-violet-400/40 pr-10"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={handleRememberMeChange}
                  disabled={loading}
                />
                <Label htmlFor="remember" className="text-sm text-gray-500">Remember me</Label>
              </div>
              <button type="button" className="text-sm text-purple-600 hover:text-blue-500 font-medium" onClick={() => setShowReset(true)} disabled={loading}>Forgot password?</button>
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-purple-600 via-violet-500 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg rounded-lg"
              disabled={loading}
            >
              {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</>) : ('Sign In')}
            </Button>
            <Button type="button" variant="outline" className="w-full flex items-center justify-center gap-2 border-violet-200" onClick={handleGoogleSignIn} disabled={loading}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </Button>
          </form>
        )}
        {showSignUp && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email" className="text-gray-700 font-medium">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-gray-300 focus:border-purple-500 focus:ring-violet-400/40"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password" className="text-gray-700 font-medium">Password</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 border-gray-300 focus:border-purple-500 focus:ring-violet-400/40"
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full h-11 bg-gradient-to-r from-purple-600 via-violet-500 to-blue-500 text-white font-medium rounded-lg" disabled={loading}>
              {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing up...</>) : ('Sign Up')}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => setShowSignUp(false)} disabled={loading}>Back to Sign In</Button>
          </form>
        )}
        {showReset && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-gray-700 font-medium">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="h-11 border-gray-300 focus:border-purple-500 focus:ring-violet-400/40"
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full h-11 bg-gradient-to-r from-purple-600 via-violet-500 to-blue-500 text-white font-medium rounded-lg" disabled={loading}>
              {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>) : ('Send Reset Email')}
            </Button>
            {resetSent && <div className="text-green-600 text-sm text-center">Reset email sent! Check your inbox.</div>}
            <Button type="button" variant="ghost" className="w-full" onClick={() => setShowReset(false)} disabled={loading}>Back to Sign In</Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 pt-2">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
          <Shield className="w-4 h-4" />
          <span>256-bit SSL encryption</span>
        </div>
        <div className="text-center text-sm text-gray-500">
          {!showSignUp && !showReset && (
            <>
              Don't have an account?{' '}
              <button className="text-purple-600 hover:text-blue-500 font-medium" onClick={() => setShowSignUp(true)} disabled={loading}>Sign up</button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default AuthForm; 
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Shield, Smartphone, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Login successful!', description: 'Welcome back to SplitEase.' });
      navigate('/dashboard');
    } catch (error) {
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", description: 'Please check again.', variant: 'destructive' });
      setLoading(false);
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({ title: 'Signup successful!', description: 'Welcome to SplitEase 🎉' });
      navigate('/dashboard');
    } catch (error) {
      toast({ title: 'Signup failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
      toast({ title: 'Reset link sent', description: 'Check your email.' });
    } catch (error) {
      toast({ title: 'Reset failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({ title: 'Login successful!', description: 'Welcome via Google.' });
      navigate('/dashboard');
    } catch (error) {
      toast({ title: 'Google login failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-white/95 backdrop-blur-md rounded-2xl">
      <CardHeader className="space-y-1 text-center pb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 via-violet-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-gray-800">{showSignUp ? 'Create an account' : 'Welcome back'}</CardTitle>
        <div className="text-gray-500">{showSignUp ? 'Register to use SplitEase' : 'Sign in to your SplitEase account'}</div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showReset ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
              disabled={loading}
            />
            <Button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Email'}</Button>
            {resetSent && <p className="text-green-600 text-center text-sm">Reset link sent! Check your inbox.</p>}
            <Button variant="ghost" type="button" onClick={() => setShowReset(false)}>Back</Button>
          </form>
        ) : showSignUp ? (
          <form onSubmit={handleSignUp} className="space-y-4">
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
            <Input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={loading} />
            <Button type="submit" disabled={loading}>{loading ? 'Signing up...' : 'Sign Up'}</Button>
            <Button variant="ghost" type="button" onClick={() => setShowSignUp(false)}>Back</Button>
          </form>
        ) : (
          <form onSubmit={handleSignIn} className="space-y-4">
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2/4 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked === true)} />
                <Label htmlFor="remember" className="text-sm text-gray-600">Remember me</Label>
              </div>
              <button type="button" onClick={() => setShowReset(true)} className="text-sm text-purple-600 hover:text-blue-500 font-medium">Forgot password?</button>
            </div>
            <Button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
            <Button type="button" variant="outline" onClick={handleGoogleSignIn}>Continue with Google</Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 pt-2">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
          <Shield className="w-4 h-4" />
          <span>256-bit SSL encryption</span>
        </div>
        <div className="text-center text-sm text-gray-500">
          {showSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button type="button" className="text-purple-600 hover:text-blue-500 font-medium" onClick={() => { setShowSignUp(!showSignUp); setShowReset(false); }}> {showSignUp ? 'Sign In' : 'Sign Up'}</button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
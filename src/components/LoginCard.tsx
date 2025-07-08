import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import LogoSquare from './LogoSquare';

const LoginCard = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-lg px-8 py-10 w-full max-w-md font-sans">
      <div className="flex flex-col items-center mb-8">
        <LogoSquare />
      </div>
      <form className="space-y-6">
        <div>
          <Label htmlFor="email" className="text-gray-700 font-medium text-base">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-400/40 rounded-lg bg-white text-base"
            required
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="password" className="text-gray-700 font-medium text-base">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-400/40 pr-10 rounded-lg bg-white text-base"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 disabled:opacity-50"
              tabIndex={-1}
              disabled={loading}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={checked => setRememberMe(checked === true)}
              disabled={loading}
            />
            <Label htmlFor="remember" className="text-sm text-gray-500 font-medium">Remember me</Label>
          </div>
          <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Forgot password?</a>
        </div>
        <Button
          type="submit"
          className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-base"
          disabled={loading}
        >
          {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</>) : ('Sign In')}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2 border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 text-base"
          disabled={loading}
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </Button>
      </form>
      <div className="flex items-center justify-center gap-2 text-gray-400 text-base mt-8">
        <Shield className="w-4 h-4" />
        <span>256-bit SSL encryption</span>
      </div>
      <div className="text-center text-base text-gray-500 mt-6">
        Don&apos;t have an account?{' '}
        <a href="#" className="text-blue-600 hover:text-blue-800 font-semibold">Sign Up</a>
      </div>
    </div>
  );
};

export default LoginCard; 
import React from 'react';
import { Shield, Lock, Zap } from 'lucide-react';

const AuthFooter = () => {
  return (
    <div className="mt-12 text-center">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-white font-medium">Bank-level Security</h3>
          <p className="text-blue-100 text-sm">Your data is encrypted and protected</p>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-white font-medium">Instant Settlements</h3>
          <p className="text-blue-100 text-sm">Split and settle expenses in seconds</p>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-white font-medium">Privacy First</h3>
          <p className="text-blue-100 text-sm">Your financial data stays private</p>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-white/10">
        <p className="text-blue-100 text-sm">
          © 2024 SplitEase. All rights reserved. 
          <span className="mx-2">•</span>
          <a href="#" className="hover:text-white">Privacy Policy</a>
          <span className="mx-2">•</span>
          <a href="#" className="hover:text-white">Terms of Service</a>
        </p>
      </div>
    </div>
  );
};

export default AuthFooter; 
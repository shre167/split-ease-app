import React from 'react';
import { Shield, Lock, Zap } from 'lucide-react';

const AuthFooter = () => {
  return (
    <div className="mt-20 text-center">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-white text-xl font-semibold">Bank-level Security</h3>
          <p className="text-blue-100 text-base max-w-xs">
            Your data is encrypted and protected
          </p>
        </div>
        <div className="flex flex-col items-center space-y-3">
          <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-white text-xl font-semibold">Instant Settlements</h3>
          <p className="text-blue-100 text-base max-w-xs">
            Split and settle expenses in seconds
          </p>
        </div>
        <div className="flex flex-col items-center space-y-3">
          <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-white text-xl font-semibold">Privacy First</h3>
          <p className="text-blue-100 text-base max-w-xs">
            Your financial data stays private
          </p>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-white/10">
        
      </div>
    </div>
  );
};

export default AuthFooter;

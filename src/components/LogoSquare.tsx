import React from 'react';
import { Smartphone } from 'lucide-react';

const LogoSquare = () => (
  <div className="text-center mb-8">
    <div className="flex items-center justify-center mb-6">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
        <Smartphone className="w-8 h-8 text-white" />
      </div>
    </div>
    <h1 className="text-4xl font-bold text-white mb-2">SplitEase</h1>
    <p className="text-blue-100 text-lg">Smart expense splitting for modern life</p>
  </div>
);

export default LogoSquare; 
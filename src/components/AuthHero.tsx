import React from 'react';
import { Smartphone } from 'lucide-react';

const AuthHero = () => {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 via-violet-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Smartphone className="w-8 h-8 text-white" />
        </div>
      </div>
      
    </div>
  );
};

export default AuthHero; 
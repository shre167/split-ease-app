import React from 'react';
import { Zap, Users, Bell, Smartphone } from 'lucide-react';
import LoginCard from '@/components/LoginCard';
import AuthFooter from '@/components/AuthFooter';

const Index = () => {
  return (
    <div className="min-h-screen bg-[#2563eb] text-white font-sans p-8 flex flex-col justify-between">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 pt-16 w-full">
        {/* Left Column - Logo, Heading, Features */}
        <div className="flex-1 flex flex-col items-start text-left mt-32 lg:mt-48">
          {/* Logo - Smartphone logo and SplitEase title */}
          <div className="flex flex-col items-start gap-2 mb-4 w-full">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-5xl font-bold">SplitEase</h1>
            </div>
            <p className="text-white/90 text-lg">Smart expense splitting for modern life</p>
          </div>

          {/* Features List */}
          <div className="space-y-6 w-full">
            <div className="flex items-start gap-5 bg-white/10 border border-white/20 backdrop-blur rounded-2xl p-6 shadow">
              <Zap className="w-7 h-7 text-white flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-bold text-2xl mb-2 leading-tight tracking-tight font-sans">
                  Split Bills Effortlessly
                </h3>
                <p className="text-white/90 text-lg font-medium leading-snug">
                  Automatically calculate who owes what and settle up with integrated payments.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-5 bg-white/10 border border-white/20 backdrop-blur rounded-2xl p-6 shadow">
              <Users className="w-7 h-7 text-white flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-bold text-2xl mb-2 leading-tight tracking-tight font-sans">
                  Track Group Expenses
                </h3>
                <p className="text-white/90 text-lg font-medium leading-snug">
                  Keep track of shared expenses with friends, roommates, and colleagues.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-5 bg-white/10 border border-white/20 backdrop-blur rounded-2xl p-6 shadow">
              <Bell className="w-7 h-7 text-white flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-bold text-2xl mb-2 leading-tight tracking-tight font-sans">
                  Smart Notifications
                </h3>
                <p className="text-white/90 text-lg font-medium leading-snug">
                  Get reminded when it's time to settle up or when expenses are added.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Login Form */}
        <div className="flex-1 flex justify-center lg:justify-end mt-6">
          <LoginCard />
        </div>
      </div>

      {/* Footer */}
      <AuthFooter />
    </div>
  );
};

export default Index;

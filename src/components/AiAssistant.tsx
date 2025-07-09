// AIAssistant.tsx with Categorization (On-Demand) + Auto-Categorization at Payment Time

import React, { useState } from 'react';
import { Send, Bot, MessageCircle, BarChart2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPayments, type Payment } from '@/lib/firebase';

const ESSENTIAL_CATEGORIES = [
  'Groceries', 'Medical', 'Utilities', 'Transport', 'Rent', 'School', 'Tuition', 'Electricity', 'Water', 'Gas', 'Insurance'
];
const OPTIONAL_CATEGORIES = [
  'Food Delivery', 'Entertainment', 'Shopping', 'Bubble tea', 'Online shopping', 'Netflix', 'Game', 'Snack', 'Delivery', 'Coffee'
];

const CATEGORY_KEYWORDS = [
  { category: 'Groceries', keywords: ['big bazaar', 'grocer', 'supermarket', 'more', 'd-mart'] },
  { category: 'Food Delivery', keywords: ['swiggy', 'zomato', 'ubereats', 'foodpanda', 'dominos', 'pizza', 'burger', 'kfc', 'mcdonald'] },
  { category: 'Entertainment', keywords: ['netflix', 'hotstar', 'prime', 'spotify', 'movie', 'cinema', 'game'] },
  { category: 'Medical', keywords: ['pharmacy', 'apollo', 'medplus', 'hospital', 'clinic', 'doctor', 'medicine'] },
  { category: 'Transport', keywords: ['uber', 'ola', 'rapido', 'taxi', 'auto', 'bus', 'train', 'metro', 'cab'] },
  { category: 'Shopping', keywords: ['amazon', 'flipkart', 'myntra', 'ajio', 'shop', 'mall', 'lifestyle', 'pantaloons'] },
  { category: 'Utilities', keywords: ['electricity', 'water', 'gas', 'recharge', 'bill', 'broadband', 'wifi', 'internet'] },
  { category: 'Rent', keywords: ['rent', 'landlord'] },
  { category: 'Other', keywords: [] },
];

function autoCategorize(payee = '', description = '') {
  const text = (payee + ' ' + description).toLowerCase();
  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }
  return 'Other';
}

const AIAssistant = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{ sender: 'user' | 'ai', text: string }[]>([]);
  const { user } = useAuth();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<null | { essentials: Payment[]; optional: Payment[]; tips: string[] }>(null);
  const [loading, setLoading] = useState(false);

  // Analyze payments and categorize
  const analyzePayments = async () => {
    if (!user) return;
    setAnalyzing(true);
    setAnalysisResult(null);
    setLoading(true);
    try {
      const userId = user.uid || user.email || '';
      const payments = await getUserPayments(userId);
      const essentials: Payment[] = [];
      const optional: Payment[] = [];
      payments.forEach(payment => {
        let cat = payment.category;
        if (!cat || cat === 'Other') {
          cat = autoCategorize(payment.recipient, payment.description);
        }
        if (ESSENTIAL_CATEGORIES.includes(cat)) {
          essentials.push(payment);
        } else if (OPTIONAL_CATEGORIES.includes(cat)) {
          optional.push(payment);
        }
      });
      // Tips
      const tips: string[] = [];
      const foodDeliveryTotal = optional.filter(p => p.category === 'Food Delivery').reduce((sum, p) => sum + p.amount, 0);
      if (foodDeliveryTotal > 0) tips.push(`This month you spent ₹${foodDeliveryTotal.toFixed(0)} on food delivery 🍔. Maybe try cooking once or twice to save?`);
      if (optional.length > 0 && optional.reduce((sum, p) => sum + p.amount, 0) > 2000) tips.push('Consider cutting down on optional expenses to save more!');
      setAnalysisResult({ essentials, optional, tips });
    } catch (e) {
      setAnalysisResult(null);
    }
    setLoading(false);
    setAnalyzing(false);
  };

  // Gemini API chat with context
  const sendToGemini = async (userMessage: string) => {
    setChat(prev => [...prev, { sender: 'user', text: userMessage }]);
    setLoading(true);
    try {
      // Build context summary from last analysis or fetch payments if needed
      let summary = '';
      if (analysisResult) {
        const essentialsTotal = analysisResult.essentials.reduce((sum, p) => sum + p.amount, 0);
        const nonEssentialsTotal = analysisResult.optional.reduce((sum, p) => sum + p.amount, 0);
        // Find biggest category
        const all = [...analysisResult.essentials, ...analysisResult.optional];
        const catTotals: Record<string, number> = {};
        all.forEach(p => { catTotals[p.category] = (catTotals[p.category] || 0) + p.amount; });
        const biggestCategory = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
        summary = `My recent expenses:\n- Essentials: ₹${essentialsTotal}\n- Non-essentials: ₹${nonEssentialsTotal}\n- Biggest category: ${biggestCategory}\n`;
      }
      const prompt = summary + userMessage;
      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=AIzaSyCFUDQGML2vp_AWvs5sABHyUfrg71wbbhY',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );
      const data = await res.json();
      const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text
        || "Here's a tip: Track your non-essential spending and set a monthly savings goal. Try to reduce food delivery and impulse shopping. Even small changes add up!";
      setChat(prev => [...prev, { sender: 'ai', text: aiReply }]);
    } catch (e) {
      setChat(prev => [...prev, { sender: 'ai', text: 'Sorry, there was an error contacting Gemini.' }]);
    }
    setLoading(false);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      sendToGemini(message);
      setMessage('');
    }
  };

  return (
    <div className="my-6 mx-2 lg:mx-0 lg:my-8">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1 rounded-2xl shadow-xl">
        <div className="bg-white rounded-2xl p-6">
          {/* Assistant Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">SplitEase Assistant</h3>
              <p className="text-sm text-gray-500">AI-powered expense helper</p>
            </div>
          </div>
          
          {/* Need vs Want Analyzer Button */}
          <button
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold mb-4 hover:from-blue-600 hover:to-purple-600"
            onClick={analyzePayments}
            disabled={analyzing || loading}
          >
            <BarChart2 className="w-5 h-5" />
            Analyze Needs vs Wants
          </button>

          {/* Monthly Summary & Visuals */}
          {analysisResult && (() => {
            // Filter for current month
            const now = new Date();
            const isThisMonth = (date) => {
              const d = new Date(date);
              return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
            };
            const essentialsMonth = analysisResult.essentials.filter(p => isThisMonth(p.date));
            const optionalMonth = analysisResult.optional.filter(p => isThisMonth(p.date));
            const totalEssentials = essentialsMonth.reduce((sum, p) => sum + p.amount, 0);
            const totalOptional = optionalMonth.reduce((sum, p) => sum + p.amount, 0);
            const totalSpent = totalEssentials + totalOptional;
            const savingsIfCut = Math.round(totalOptional * 0.2);
            const barTotal = Math.max(totalEssentials, totalOptional, 1);
            return (
              <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
                  <div className="flex-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 shadow border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">📊</span>
                      <span className="font-bold text-lg text-gray-800">This Month's Spending</span>
                    </div>
                    <div className="flex gap-6 mb-2">
                      <div>
                        <div className="text-xs text-gray-500">Essentials</div>
                        <div className="font-bold text-green-700">₹{totalEssentials}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Non-Essentials</div>
                        <div className="font-bold text-red-600">₹{totalOptional}</div>
                </div>
                <div>
                        <div className="text-xs text-gray-500">Total</div>
                        <div className="font-bold text-gray-800">₹{totalSpent}</div>
                      </div>
                    </div>
                    {/* Simple CSS Bar Chart */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-4 rounded bg-green-400" style={{ width: `${(totalEssentials/barTotal)*70+10}%`, minWidth: 20 }} title="Essentials" />
                      <div className="h-4 rounded bg-red-400" style={{ width: `${(totalOptional/barTotal)*70+10}%`, minWidth: 20 }} title="Non-Essentials" />
                    </div>
                    <div className="flex justify-between text-xs mt-1 px-1">
                      <span className="text-green-700">Essentials</span>
                      <span className="text-red-600">Non-Essentials</span>
                    </div>
                  </div>
                  <div className="flex-1 bg-yellow-50 border-l-4 border-yellow-400 rounded-xl p-4 shadow flex flex-col justify-center">
                    <div className="text-yellow-900 font-semibold mb-1">💡 Savings Tip</div>
                    <div className="text-yellow-800 text-sm">If you cut your non-essential spending by 20%, you could save <span className="font-bold">₹{savingsIfCut}</span> this month!</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Analysis Result */}
          {loading && <div className="text-center py-4">Analyzing...</div>}
          {analysisResult && (
            <div className="mb-6">
              <div className="mb-2 font-semibold text-gray-700">Essentials:</div>
              <ul className="mb-2 text-green-700">
                {analysisResult.essentials.map(p => (
                  <li key={p.id}>{p.description} - ₹{p.amount} ({p.category})</li>
                ))}
                {analysisResult.essentials.length === 0 && <li>No essential payments found.</li>}
              </ul>
              <div className="mb-2 font-semibold text-gray-700">Non-Essentials:</div>
              <ul className="mb-2 text-red-700">
                {analysisResult.optional.map(p => (
                  <li key={p.id}>{p.description} - ₹{p.amount} ({p.category})</li>
                ))}
                {analysisResult.optional.length === 0 && <li>No optional/useless payments found.</li>}
              </ul>
              {analysisResult.tips.length > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded mb-2 text-yellow-900">
                  {analysisResult.tips.map((tip, i) => <div key={i}>💡 {tip}</div>)}
                </div>
              )}
            </div>
          )}

          {/* Chat Section */}
          <div className="mb-4">
            <div className="h-48 overflow-y-auto bg-gray-50 rounded-lg p-3 mb-2 border border-gray-100">
              {chat.length === 0 && (
                <div className="text-gray-400 text-center">Hi! I'm your SplitEase Assistant. Ask me anything about your expenses, settlements, or groups.</div>
              )}
              {chat.map((msg, i) => (
                <div key={i} className={`mb-2 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-3 py-2 rounded-lg max-w-xs ${msg.sender === 'user' ? 'bg-blue-100 text-right' : 'bg-purple-100 text-left'}`}>{msg.text}</div>
                </div>
              ))}
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about your expenses..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                disabled={loading}
            >
              <Send className="w-5 h-5 text-white" />
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;

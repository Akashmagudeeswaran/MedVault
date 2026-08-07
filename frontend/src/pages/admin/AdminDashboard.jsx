import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  FileText, 
  Brain, 
  Sparkles, 
  TrendingUp, 
  MessageSquare, 
  Send, 
  Trash2, 
  Clock, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Activity,
  SendHorizontal
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ActivityTimeline from '../../components/ActivityTimeline';

export default function AdminDashboard() {
  const toast = useToast();

  // --- States ---
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalMedicalRecords: 0,
    todaysActivity: [],
    aiSummary: '',
    recommendations: [],
    appointmentsTrend: []
  });
  const [loading, setLoading] = useState(true);

  // Chatbot states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'ai', text: 'Hello! I am your MedVault AI Assistant. Ask me anything about patients, doctors, schedules, or today\'s operations.' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Suggested chatbot questions
  const suggestedQuestions = [
    "How many patients registered today?",
    "Which doctor has the most appointments?",
    "Show today's appointments.",
    "How many appointments were cancelled?",
    "Which department is busiest?",
    "Give me today's hospital summary."
  ];

  // --- Effects ---
  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [chatHistory, isChatOpen]);

  // --- Fetch API Handlers ---
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching admin dashboard metrics:', err);
      toast.error('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e, customMsg = null) => {
    if (e) e.preventDefault();
    const queryText = customMsg || chatMessage;
    if (!queryText.trim()) return;

    setChatMessage('');
    setChatHistory(prev => [...prev, { sender: 'user', text: queryText }]);
    setChatLoading(true);

    try {
      const res = await api.post('/admin/chat', { message: queryText });
      setChatHistory(prev => [...prev, { sender: 'ai', text: res.data.response }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { sender: 'ai', text: 'AI service is temporarily unavailable. Please try again later.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const clearChat = () => {
    setChatHistory([
      { sender: 'ai', text: 'Hello! I am your MedVault AI Assistant. Ask me anything about patients, doctors, schedules, or today\'s operations.' }
    ]);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-[85vh] flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="text-center space-y-4">
          <Activity className="w-12 h-12 text-teal-600 dark:text-teal-400 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Loading AI Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  // Map Lucide icons dynamically to recommendation indices
  const getRecommendationIcon = (index) => {
    switch (index % 4) {
      case 0:
        return <TrendingUp className="text-blue-500 w-5 h-5" />;
      case 1:
        return <Users className="text-teal-500 w-5 h-5" />;
      case 2:
        return <Clock className="text-amber-500 w-5 h-5" />;
      case 3:
        return <AlertCircle className="text-indigo-500 w-5 h-5" />;
      default:
        return <CheckCircle2 className="text-emerald-500 w-5 h-5" />;
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto font-sans text-xs transition-all duration-200">
      
      {/* 1. Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center space-x-2">
            <Brain className="text-teal-600 dark:text-teal-400 w-8 h-8" />
            <span>AI Admin Dashboard</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Real-time hospital operations metrics, optimization alerts, and AI insights</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="mt-4 md:mt-0 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] font-bold text-xs"
        >
          Refresh Data
        </button>
      </div>

      {/* 2. Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Patients Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4 hover:shadow-md transition-all">
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Total Patients</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{stats.totalPatients}</h3>
            <p className="text-[9px] text-emerald-500 font-bold flex items-center mt-0.5">
              <span>+12 new today</span>
            </p>
          </div>
        </div>

        {/* Total Doctors Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4 hover:shadow-md transition-all">
          <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
            <Stethoscope size={24} />
          </div>
          <div>
            <p className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Total Doctors</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{stats.totalDoctors}</h3>
            <p className="text-[9px] text-slate-400 font-bold flex items-center mt-0.5">
              <span>Active staff</span>
            </p>
          </div>
        </div>

        {/* Total Appointments Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4 hover:shadow-md transition-all">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Total Appointments</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{stats.totalAppointments}</h3>
            <p className="text-[9px] text-amber-500 font-bold flex items-center mt-0.5">
              <span>Updated live</span>
            </p>
          </div>
        </div>

        {/* Total Medical Records Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4 hover:shadow-md transition-all">
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Medical Records</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{stats.totalMedicalRecords}</h3>
            <p className="text-[9px] text-emerald-500 font-bold flex items-center mt-0.5">
              <span>Encrypted vaults</span>
            </p>
          </div>
        </div>

      </div>

      {/* 3. AI Overview Summary Box */}
      <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-500/25 dark:border-teal-400/20 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 bg-teal-600/10 border border-teal-600/20 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
            <Sparkles size={18} className="animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-black text-slate-800 dark:text-white">AI Overview</h3>
            <p className="text-[11px] leading-relaxed font-semibold text-slate-600 dark:text-slate-300">
              {stats.aiSummary}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Chart: Appointment Trend */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white">Clinical Service Volume</h3>
            <p className="text-slate-400 text-[10px] font-bold">Historical consultation trend and schedule load predictions</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.appointmentsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAppts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(203, 213, 225, 0.2)" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                  border: 'none', 
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '10px'
                }} 
              />
              <Area type="monotone" dataKey="appointments" name="Appointments" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorAppts)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. AI Recommendations Grid */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-black text-slate-800 dark:text-white">AI Recommendations</h3>
          <p className="text-slate-400 text-[10px] font-bold">Optimization actions generated based on clinical schedule trends</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.recommendations.map((rec, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-start space-x-3.5 hover:shadow-md transition-all"
            >
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shrink-0">
                {getRecommendationIcon(index)}
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rule {index + 1}</h4>
                <p className="text-[11px] leading-relaxed font-semibold text-slate-700 dark:text-slate-350">{rec}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Recent Activity Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-black text-slate-800 dark:text-white">Recent System Activities</h3>
          <p className="text-slate-400 text-[10px] font-bold">Logged actions recorded across clinic administration portals</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-6">User Name</th>
                <th className="py-3 px-6">Activity Description</th>
                <th className="py-3 px-6 text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {stats.todaysActivity.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-slate-400 italic">No recent system activities found.</td>
                </tr>
              ) : (
                stats.todaysActivity.map((act, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors"
                  >
                    <td className="py-3.5 px-6 font-bold text-slate-800 dark:text-white">{act.userName}</td>
                    <td className="py-3.5 px-6 text-slate-500 font-semibold">{act.activity}</td>
                    <td className="py-3.5 px-6 text-right font-mono text-[10px] text-slate-400">
                      {new Date(act.dateTime).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Timeline Component */}
      <ActivityTimeline />

      {/* 7. Floating AI Chatbot Panel */}
      <div className="fixed bottom-6 right-6 z-50">
        
        {/* Chat Toggle Button */}
        {!isChatOpen ? (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="w-12 h-12 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all border border-teal-500/20 cursor-pointer"
          >
            <MessageSquare size={20} />
          </button>
        ) : (
          <div className="w-80 h-[420px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
            
            {/* Chat Dialog Header */}
            <div className="bg-teal-600 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain size={18} className="animate-pulse" />
                <div>
                  <h4 className="font-extrabold text-[11px] leading-tight">MedVault AI Assistant</h4>
                  <span className="text-[8px] text-teal-200 font-bold uppercase tracking-wider">Online Context</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={clearChat}
                  title="Clear Chat History"
                  className="p-1 hover:bg-teal-700 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="font-black text-xs hover:text-teal-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Conversation Window */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-[10px] bg-slate-50/50 dark:bg-slate-950/20">
              {chatHistory.map((chat, idx) => (
                <div key={idx} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-2.5 max-w-[85%] rounded-2xl shadow-sm leading-relaxed ${
                    chat.sender === 'user' 
                      ? 'bg-teal-600 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-800'
                  }`}>
                    {chat.text}
                  </div>
                </div>
              ))}
              
              {/* Typing loader state */}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="p-2.5 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-800 flex items-center space-x-2 font-bold animate-pulse">
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggested Questions Carousel */}
            <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-1.5">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={(e) => handleChatSubmit(e, q)}
                  className="inline-block px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 rounded-full text-[9px] font-bold text-slate-500 dark:text-slate-450 cursor-pointer shrink-0 transition-colors shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleChatSubmit} className="p-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
              <input 
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask hospital status details..."
                className="flex-1 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 text-[10px] transition-colors"
              />
              <button 
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-3 flex items-center justify-center cursor-pointer shadow-md transition-colors"
              >
                <SendHorizontal size={14} />
              </button>
            </form>

          </div>
        )}
      </div>

    </div>
  );
}

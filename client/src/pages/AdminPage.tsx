import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, apiFetch } from "../lib/queryClient";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";
import { 
  LayoutDashboard, Key, BarChart3, Settings, ShieldCheck, 
  Users, Calendar, Activity, ChevronRight, Plus, RefreshCcw, Trash2
} from "lucide-react";
import ScButton from "../components/ScButton";
import CosmicLoader from "../components/CosmicLoader";

const COLORS = ["#D4A85F", "#22d3ee", "#f472b6", "#a78bfa", "#f59e0b", "#38bdf8", "#ec4899", "#8b5cf6"];

interface AnalyticsData {
  totalProfiles: number;
  totalUsers: number;
  humanDesignTypes: Record<string, number>;
  sunSigns: Record<string, number>;
}

interface AccessCode {
  id: string;
  code: string;
  maxUses: number;
  currentUses: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"analytics" | "codes">("analytics");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCode, setNewCode] = useState({ code: "", maxUses: 1 });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch("/api/admin/access-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newCode, adminPassword: password }),
      });
      if (!res.ok) throw new Error("Failed to create code");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access-codes", password] });
      setShowCreateModal(false);
      setNewCode({ code: "", maxUses: 1 });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/admin/access-codes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPassword: password, isActive: false }),
      });
      if (!res.ok) throw new Error("Failed to deactivate code");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access-codes", password] });
    }
  });

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length > 0) {
      setIsAuthenticated(true);
      localStorage.setItem("soulAdminToken", password);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("soulAdminToken");
    if (savedToken) {
      setPassword(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics", password],
    queryFn: async () => {
      const res = await apiFetch("/api/admin/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPassword: password }),
      });
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    },
    enabled: isAuthenticated && password.length > 0,
  });

  const { data: codes, isLoading: codesLoading } = useQuery<AccessCode[]>({
    queryKey: ["/api/admin/access-codes", password],
    queryFn: async () => {
      const res = await apiFetch("/api/admin/access-codes", {
        headers: { "Authorization": `Bearer ${password}` },
      });
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    },
    enabled: isAuthenticated && password.length > 0,
  });

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} password={password} setPassword={setPassword} />;
  }

  return (
    <div className="min-h-screen bg-[#080412] text-[#F2EDE3] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="text-[#D4A85F] w-5 h-5" />
              <span className="text-xs uppercase tracking-widest text-[#D4A85F] font-bold">Admin Command Center</span>
            </div>
            <h1 className="text-4xl font-serif text-glow">The Soul Oracle</h1>
          </div>
          
          <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-xl">
            <TabButton 
              active={activeTab === "analytics"} 
              onClick={() => setActiveTab("analytics")}
              icon={<BarChart3 className="w-4 h-4" />}
              label="Analytics"
            />
            <TabButton 
              active={activeTab === "codes"} 
              onClick={() => setActiveTab("codes")}
              icon={<Key className="w-4 h-4" />}
              label="Access Codes"
            />
            <button 
              onClick={() => {
                localStorage.removeItem("soulAdminToken");
                setIsAuthenticated(false);
              }}
              className="px-4 py-2 text-xs text-white/50 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === "analytics" ? (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  label="Total Souls" 
                  value={analytics?.totalProfiles || 0} 
                  icon={<Users className="w-5 h-5" />} 
                  sub="Active profiles"
                />
                <StatCard 
                  label="Authenticated" 
                  value={analytics?.totalUsers || 0} 
                  icon={<Calendar className="w-5 h-5" />} 
                  sub="Registered users"
                />
                <StatCard 
                  label="Conversion" 
                  value={`${((analytics?.totalUsers || 0) / (analytics?.totalProfiles || 1) * 100).toFixed(1)}%`} 
                  icon={<Activity className="w-5 h-5" />} 
                  sub="Profile to Login"
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartSection title="Human Design distribution">
                  <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(analytics?.humanDesignTypes || {}).map(([name, value]) => ({ name, value }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={60}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {Object.entries(analytics?.humanDesignTypes || {}).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: "#0d2030", border: "1px solid #1e3d4a", color: "#F2EDE3" }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </ChartSection>

                <ChartSection title="Celestial Blueprints (Zodiac)">
                  <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={Object.entries(analytics?.sunSigns || {}).map(([name, value]) => ({ name, value }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: "#0d2030", border: "1px solid #1e3d4a", color: "#F2EDE3" }} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {Object.entries(analytics?.sunSigns || {}).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartSection>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="codes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-serif">Management portal</h2>
            <ScButton 
              variant="secondary" 
              size="sm" 
              className="gap-2"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4" /> Generate Code
            </ScButton>
          </div>

          <AnimatePresence>
            {showCreateModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="max-w-md w-full glass-premium p-8 rounded-3xl border border-white/10"
                >
                  <h2 className="text-xl font-serif mb-6">Forge Access Token</h2>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    createMutation.mutate();
                  }} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-[#D4A85F] opacity-70">Custom Code (Optional)</label>
                      <input 
                        type="text" 
                        value={newCode.code}
                        onChange={(e) => setNewCode({...newCode, code: e.target.value.toUpperCase()})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4A85F]/50 transition-colors"
                        placeholder="AUTO-GENERATE"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-[#D4A85F] opacity-70">Max Uses</label>
                      <input 
                        type="number" 
                        value={newCode.maxUses}
                        onChange={(e) => setNewCode({...newCode, maxUses: parseInt(e.target.value)})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4A85F]/50 transition-colors"
                      />
                    </div>
                    <div className="flex gap-2 mt-8">
                      <ScButton variant="ghost" className="flex-1" onClick={() => setShowCreateModal(false)} type="button">Cancel</ScButton>
                      <ScButton 
                        className="flex-1" 
                        loading={createMutation.isPending}
                      >
                        Create Token
                      </ScButton>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <div className="glass-premium rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-[#D4A85F]">Code</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-[#D4A85F]">Usage</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-[#D4A85F]">Expires</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-[#D4A85F]">Status</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-[#D4A85F]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {codesLoading ? (
                      <tr><td colSpan={5} className="py-20"><CosmicLoader /></td></tr>
                    ) : codes?.map(code => (
                      <tr key={code.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <code className="bg-[#D4A85F]/20 text-[#D4A85F] px-2 py-1 rounded-md text-sm border border-[#D4A85F]/30">{code.code}</code>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{code.currentUses} / {code.maxUses}</span>
                            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#D4A85F]" 
                                style={{ width: `${Math.min(100, (code.currentUses / code.maxUses) * 100)}%` }} 
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm opacity-60">
                          {code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : "Never"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                            code.isActive && (code.currentUses < code.maxUses)
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-red-500/10 text-red-400 border border-red-500/30"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${code.isActive ? "bg-emerald-400 pulse" : "bg-red-400"}`} />
                            {code.isActive ? "Active" : "Depleted"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors"><RefreshCcw className="w-4 h-4 text-white/40" /></button>
                            <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"><Trash2 className="w-4 h-4 text-white/40 group-hover:text-red-400" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AdminLogin({ onLogin, password, setPassword }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#080412]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass-premium p-8 rounded-3xl border border-white/10 text-center"
      >
        <div className="w-16 h-16 bg-[#D4A85F]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#D4A85F]/30">
          <ShieldCheck className="text-[#D4A85F] w-8 h-8" />
        </div>
        <h1 className="text-2xl font-serif mb-2">Identify yourself</h1>
        <p className="text-white/50 text-sm mb-8">Accessing the Soul Oracle requires the Master Credential.</p>
        
        <form onSubmit={onLogin} className="space-y-4 text-left">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-[#D4A85F] opacity-70">Master Token</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4A85F]/50 transition-colors"
              placeholder="••••••••"
            />
          </div>
          <ScButton className="w-full">Unlock Oracle</ScButton>
        </form>
      </motion.div>
    </div>
  );
}

function StatCard({ label, value, icon, sub }: any) {
  return (
    <div className="glass-premium p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        {icon}
      </div>
      <p className="text-[10px] uppercase tracking-widest font-bold text-[#D4A85F] mb-1">{label}</p>
      <p className="text-3xl font-serif mb-1">{value}</p>
      <p className="text-xs text-white/40">{sub}</p>
    </div>
  );
}

function ChartSection({ title, children }: any) {
  return (
    <div className="glass-premium p-8 rounded-3xl border border-white/10 h-full">
      <h3 className="text-sm font-serif text-[#D4A85F]/80 mb-6">{title}</h3>
      {children}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all ${
        active 
          ? "bg-[#D4A85F] text-[#080412] shadow-lg shadow-[#D4A85F]/20" 
          : "text-white/40 hover:text-white"
      }`}
    >
      {icon} {label}
    </button>
  );
}

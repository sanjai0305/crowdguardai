import { useState, useEffect } from "react";
import {
  Shield, Camera, AlertTriangle, Users, Activity, 
  Lock, Eye, Wifi, MapPin, Bell, ChevronRight,
  Baby, Accessibility, HeartPulse, Zap, Radio,
  User, LogOut, Settings, Menu, X, Video,
  TrendingUp, Clock, CheckCircle, XCircle, Upload,
  Monitor, AlertCircle, BarChart3, Navigation
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";
import cameraFeed from "@/assets/camera-feed.jpg";
import heroCrowd from "@/assets/hero-crowd.jpg";

// ---- Simulated live data ----
const generateCrowdData = () =>
  Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    gate1: Math.floor(Math.random() * 500 + 200),
    gate2: Math.floor(Math.random() * 400 + 150),
    gate3: Math.floor(Math.random() * 300 + 100),
    total: Math.floor(Math.random() * 1200 + 800),
    risk: Math.floor(Math.random() * 100),
  }));

const GATES = [
  { id: "gate1", name: "Gate 1 – Main Entry", count: 847, cap: 1000, status: "warning", cam: "CAM-01" },
  { id: "gate2", name: "Gate 2 – North", count: 423, cap: 800, status: "safe", cam: "CAM-02" },
  { id: "gate3", name: "Gate 3 – South", count: 1102, cap: 900, status: "danger", cam: "CAM-03" },
  { id: "gate4", name: "Gate 4 – Emergency", count: 56, cap: 200, status: "safe", cam: "CAM-04" },
];

const PRIORITY_GROUPS = [
  { icon: Baby, label: "Children (< 12)", count: 234, color: "cyber", pct: 23 },
  { icon: Accessibility, label: "Disabled Persons", count: 87, color: "warning", pct: 9 },
  { icon: HeartPulse, label: "Senior Citizens", count: 156, color: "safe", pct: 15 },
  { icon: User, label: "General Public", count: 3804, color: "muted-foreground", pct: 53 },
];

const ALERTS = [
  { time: "14:32:07", msg: "CRITICAL: Gate 3 density exceeded 90%", level: "danger" },
  { time: "14:28:51", msg: "WARNING: Rapid flow increase at Gate 1", level: "warning" },
  { time: "14:25:03", msg: "ALERT: 3 disabled persons detected near Gate 3 – assign escort", level: "warning" },
  { time: "14:21:44", msg: "INFO: Emergency lane cleared at Gate 4", level: "safe" },
  { time: "14:18:12", msg: "ALERT: Panic movement detected – Zone B", level: "danger" },
  { time: "14:15:00", msg: "INFO: Child detected unaccompanied – Gate 2", level: "warning" },
  { time: "14:10:33", msg: "System: AI model re-calibrated for night mode", level: "cyber" },
];

const SECURITY_LAYERS = [
  { name: "Facial Recognition", status: "ACTIVE", icon: Eye },
  { name: "Intrusion Detection", status: "ACTIVE", icon: Shield },
  { name: "OS Firewall (Level 3)", status: "ACTIVE", icon: Lock },
  { name: "Network Encryption", status: "ACTIVE", icon: Wifi },
  { name: "Panic Detection AI", status: "SCANNING", icon: Activity },
  { name: "Perimeter Sensors", status: "ACTIVE", icon: Radio },
];

const GUARDS = [
  { name: "Sanjai R", id: "G-001", gate: "Gate 3", status: "On Duty", phone: "+91 98XXX XXXXX" },
  { name: "Selva Harish", id: "G-002", gate: "Gate 1", status: "On Duty", phone: "+91 97XXX XXXXX" },
  { name: "Rithick K", id: "G-003", gate: "Gate 2", status: "On Patrol", phone: "+91 96XXX XXXXX" },
  { name: "Arun M", id: "G-004", gate: "Gate 4", status: "Standby", phone: "+91 95XXX XXXXX" },
];

type RadarEntry = { subject: string; A: number };
const radarData: RadarEntry[] = [
  { subject: "Density", A: 85 },
  { subject: "Flow Rate", A: 62 },
  { subject: "Risk Level", A: 78 },
  { subject: "Response", A: 90 },
  { subject: "Security", A: 95 },
  { subject: "Priority Care", A: 70 },
];

type NavView = "dashboard" | "cameras" | "priority" | "security" | "guards" | "alerts" | "emergency" | "demo";

const statusColor = (status: string) => {
  if (status === "danger") return "danger";
  if (status === "warning") return "warning";
  return "safe";
};

const densityPct = (count: number, cap: number) => Math.round((count / cap) * 100);

// Ticker
const TICKER_MSGS = [
  "⚠ GATE 3: DENSITY CRITICAL – IMMEDIATE ACTION REQUIRED",
  "🟡 GATE 1: FLOW RATE ELEVATED – MONITOR CLOSELY",
  "✅ GATE 2: NORMAL OPERATION",
  "🔴 PANIC MOVEMENT DETECTED – ZONE B – DEPLOYING GUARDS",
  "🟢 EMERGENCY LANE: CLEAR",
  "⚠ UNACCOMPANIED CHILD ALERT – GATE 2 – SECURITY NOTIFIED",
  "📹 ALL 4 CAMERAS: LIVE FEED ACTIVE",
  "🔐 OS SECURITY LEVEL 3: ACTIVE – ALL SYSTEMS SECURE",
];

export default function CrowdGuardDashboard() {
  const [activeView, setActiveView] = useState<NavView>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [crowdData] = useState(generateCrowdData());
  const [liveCount, setLiveCount] = useState(4281);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [selectedGate, setSelectedGate] = useState(GATES[0]);
  const [tickerIdx] = useState(0);
  const [time, setTime] = useState(new Date());
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysing, setAnalysing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<null | { count: number; risk: string; priority: string[] }>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount(prev => prev + Math.floor(Math.random() * 20 - 8));
      setTime(new Date());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploadProgress(0);
    setAnalysing(false);
    setAnalysisResult(null);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 15;
      if (p >= 100) {
        p = 100;
        clearInterval(iv);
        setAnalysing(true);
        setTimeout(() => {
          setAnalysing(false);
          setAnalysisResult({
            count: Math.floor(Math.random() * 800 + 200),
            risk: ["LOW", "MODERATE", "HIGH", "CRITICAL"][Math.floor(Math.random() * 4)],
            priority: ["2 children detected", "1 wheelchair user detected", "Stampede risk: Zone C"],
          });
        }, 5000);
      }
      setUploadProgress(Math.min(p, 100));
    }, 200);
  };

  const navItems: { id: NavView; icon: React.ElementType; label: string }[] = [
    { id: "dashboard", icon: BarChart3, label: "Dashboard" },
    { id: "cameras", icon: Camera, label: "Live Cameras" },
    { id: "priority", icon: Baby, label: "Priority Groups" },
    { id: "security", icon: Shield, label: "OS Security" },
    { id: "guards", icon: User, label: "Guard Assign" },
    { id: "alerts", icon: Bell, label: "Alert Center" },
    { id: "emergency", icon: Zap, label: "Emergency Mode" },
    { id: "demo", icon: Video, label: "Video Analysis" },
  ];

  return (
    <div className="flex h-screen bg-background cyber-grid overflow-hidden">
      {/* SIDEBAR */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-16"} transition-all duration-300 flex flex-col border-r border-panel-border/40 bg-panel shrink-0`}
        style={{ background: "hsl(220 30% 5%)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-panel-border/30">
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-cyber/10 border border-cyber/40 flex items-center justify-center pulse-cyber">
              <Shield className="w-5 h-5 text-cyber" />
            </div>
            <span className="status-dot status-live absolute -top-1 -right-1" />
          </div>
          {sidebarOpen && (
            <div>
              <p className="font-orbitron text-sm font-bold neon-cyber tracking-wider">CrowdGuardAI</p>
              <p className="text-xs text-muted-foreground mono">v2.4.1 · LIVE</p>
            </div>
          )}
          <button
            className="ml-auto text-muted-foreground hover:text-cyber transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 group ${
                activeView === item.id
                  ? "bg-cyber/10 text-cyber border border-cyber/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${activeView === item.id ? "text-cyber" : ""}`} />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
              {sidebarOpen && activeView === item.id && (
                <ChevronRight className="w-3 h-3 ml-auto text-cyber" />
              )}
            </button>
          ))}
        </nav>

        {/* Emergency Toggle */}
        {sidebarOpen && (
          <div className="p-3 border-t border-panel-border/30">
            <button
              onClick={() => setEmergencyMode(!emergencyMode)}
              className={`w-full py-2.5 rounded-md text-sm font-orbitron font-bold tracking-wider transition-all duration-300 ${
                emergencyMode
                  ? "bg-danger/20 text-danger border border-danger/60 pulse-danger"
                  : "bg-secondary text-muted-foreground hover:bg-danger/10 hover:text-danger border border-transparent hover:border-danger/40"
              }`}
            >
              {emergencyMode ? "🚨 EMERGENCY ON" : "⚡ Emergency Mode"}
            </button>
          </div>
        )}
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* TOP BAR */}
        <header className="flex items-center justify-between px-5 py-3 border-b border-panel-border/30 bg-panel/60 shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="font-orbitron text-sm font-bold text-foreground tracking-widest uppercase">
                {navItems.find(n => n.id === activeView)?.label}
              </h1>
              <p className="text-xs text-muted-foreground mono">{time.toLocaleTimeString()} · PSG Yuktha 2026</p>
            </div>
          </div>

          {/* Ticker */}
          <div className="hidden lg:flex flex-1 mx-6 overflow-hidden">
            <div className="w-full bg-secondary/50 rounded px-3 py-1 overflow-hidden relative">
              <div
                className="mono text-xs text-warning whitespace-nowrap"
                style={{ animation: "ticker 30s linear infinite" }}
              >
                {TICKER_MSGS.join("   ·   ")}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="mono text-xs text-muted-foreground hidden sm:block">
              TOTAL: <span className="neon-cyber font-bold">{liveCount.toLocaleString()}</span>
            </span>
            {emergencyMode && (
              <span className="px-2 py-1 rounded bg-danger/20 border border-danger/60 text-danger text-xs font-bold font-orbitron pulse-danger">
                🚨 EMERGENCY
              </span>
            )}
            <div className="w-8 h-8 rounded-full bg-cyber/20 border border-cyber/40 flex items-center justify-center">
              <User className="w-4 h-4 text-cyber" />
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeView === "dashboard" && <DashboardView crowdData={crowdData} liveCount={liveCount} radarData={radarData} emergencyMode={emergencyMode} />}
          {activeView === "cameras" && <CamerasView selectedGate={selectedGate} setSelectedGate={setSelectedGate} />}
          {activeView === "priority" && <PriorityView />}
          {activeView === "security" && <SecurityView />}
          {activeView === "guards" && <GuardsView />}
          {activeView === "alerts" && <AlertsView />}
          {activeView === "emergency" && <EmergencyView emergencyMode={emergencyMode} setEmergencyMode={setEmergencyMode} />}
          {activeView === "demo" && (
            <VideoAnalysisView
              uploadProgress={uploadProgress}
              analysing={analysing}
              analysisResult={analysisResult}
              handleUpload={handleUpload}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// ============================================================
// DASHBOARD VIEW
// ============================================================
function DashboardView({ crowdData, liveCount, radarData, emergencyMode }: {
  crowdData: ReturnType<typeof generateCrowdData>;
  liveCount: number;
  radarData: RadarEntry[];
  emergencyMode: boolean;
}) {
  return (
    <div className="space-y-4 animate-[fade-in_0.4s_ease]">
      {emergencyMode && (
        <div className="alert-bar rounded-md px-4 py-3 flex items-center gap-3 pulse-danger">
          <AlertTriangle className="w-5 h-5 text-danger" />
          <span className="text-danger font-bold font-orbitron text-sm tracking-wide">EMERGENCY MODE ACTIVE — ALL UNITS DEPLOYED — EVACUATION IN PROGRESS</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Crowd", value: liveCount.toLocaleString(), icon: Users, color: "cyber", sub: "Live count" },
          { label: "Active Cameras", value: "4 / 4", icon: Camera, color: "safe", sub: "All operational" },
          { label: "High Risk Zones", value: "2", icon: AlertTriangle, color: "danger", sub: "Gate 3, Zone B" },
          { label: "Guards On Duty", value: "3", icon: Shield, color: "warning", sub: "1 on standby" },
        ].map((kpi) => (
          <div key={kpi.label} className="panel p-4 relative overflow-hidden">
            <div className="corner-bracket corner-bracket-tl" style={{ borderColor: `hsl(var(--${kpi.color}))` }} />
            <div className="corner-bracket corner-bracket-br" style={{ borderColor: `hsl(var(--${kpi.color}))` }} />
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
              <kpi.icon className="w-4 h-4" style={{ color: `hsl(var(--${kpi.color}))` }} />
            </div>
            <p className="font-orbitron text-2xl font-bold" style={{ color: `hsl(var(--${kpi.color}))`, textShadow: `var(--glow-${kpi.color})` }}>
              {kpi.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Gate Status Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {GATES.map(gate => {
          const pct = densityPct(gate.count, gate.cap);
          const fillClass = gate.status === "danger" ? "density-fill-danger" : gate.status === "warning" ? "density-fill-warning" : "density-fill-safe";
          return (
            <div key={gate.id} className={`panel panel-${gate.status} p-3`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-foreground">{gate.name}</span>
                <span className={`status-dot status-${gate.status === "danger" ? "live" : gate.status === "warning" ? "warning" : "safe"}`} />
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="font-orbitron text-xl font-bold" style={{ color: `hsl(var(--${gate.status === "safe" ? "safe" : gate.status === "warning" ? "warning" : "danger"}))` }}>
                  {gate.count}
                </span>
                <span className="text-xs text-muted-foreground">/ {gate.cap}</span>
              </div>
              <div className="density-bar">
                <div className={fillClass} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="mono text-xs text-muted-foreground">{pct}%</span>
                <span className="mono text-xs" style={{ color: `hsl(var(--${gate.status === "safe" ? "safe" : gate.status === "warning" ? "warning" : "danger"}))` }}>
                  {gate.status.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Crowd Trend */}
        <div className="panel p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-orbitron text-xs text-foreground tracking-widest uppercase">Crowd Density Trend (24h)</h3>
            <span className="status-dot status-live" />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={crowdData.slice(0, 16)}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(185 100% 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(185 100% 50%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0 90% 55%)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(0 90% 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 25% 14%)" />
              <XAxis dataKey="hour" tick={{ fill: "hsl(220 15% 50%)", fontSize: 10 }} />
              <YAxis tick={{ fill: "hsl(220 15% 50%)", fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: "hsl(220 28% 9%)", border: "1px solid hsl(185 60% 20%)", borderRadius: 6 }}
                labelStyle={{ color: "hsl(185 100% 50%)" }}
              />
              <Area type="monotone" dataKey="total" stroke="hsl(185 100% 50%)" fill="url(#grad1)" strokeWidth={2} name="Total" />
              <Area type="monotone" dataKey="risk" stroke="hsl(0 90% 55%)" fill="url(#grad2)" strokeWidth={1.5} name="Risk Score" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="panel p-4">
          <h3 className="font-orbitron text-xs text-foreground tracking-widest uppercase mb-3">AI Risk Radar</h3>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(185 100% 50% / 0.15)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(220 15% 50%)", fontSize: 9 }} />
              <Radar name="Score" dataKey="A" stroke="hsl(185 100% 50%)" fill="hsl(185 100% 50%)" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Priority + Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Priority Groups Mini */}
        <div className="panel p-4">
          <h3 className="font-orbitron text-xs text-foreground tracking-widest uppercase mb-3">Priority Group Detection</h3>
          <div className="space-y-3">
            {PRIORITY_GROUPS.map(g => (
              <div key={g.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
                  <g.icon className="w-4 h-4" style={{ color: `hsl(var(--${g.color}))` }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground truncate">{g.label}</span>
                    <span className="mono ml-2" style={{ color: `hsl(var(--${g.color}))` }}>{g.count}</span>
                  </div>
                  <div className="density-bar">
                    <div
                      className={g.color === "danger" ? "density-fill-danger" : g.color === "warning" ? "density-fill-warning" : g.color === "safe" ? "density-fill-safe" : "density-fill-safe"}
                      style={{ width: `${g.pct}%`, background: `hsl(var(--${g.color}))`, height: "100%" }}
                    />
                  </div>
                </div>
                <span className="mono text-xs text-muted-foreground w-8 text-right">{g.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-orbitron text-xs text-foreground tracking-widest uppercase">Recent Alerts</h3>
            <span className="mono text-xs text-muted-foreground">{ALERTS.length} active</span>
          </div>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {ALERTS.slice(0, 5).map((alert, i) => (
              <div
                key={i}
                className={`px-3 py-2 rounded text-xs flex items-start gap-2 ${
                  alert.level === "danger" ? "alert-bar" :
                  alert.level === "warning" ? "alert-bar-warning" :
                  "bg-safe/10 border-l-2 border-safe"
                }`}
              >
                <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{
                  color: alert.level === "danger" ? "hsl(var(--danger))" : alert.level === "warning" ? "hsl(var(--warning))" : "hsl(var(--safe))"
                }} />
                <div>
                  <p className="mono text-muted-foreground text-[10px]">{alert.time}</p>
                  <p className="text-foreground leading-tight">{alert.msg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CAMERAS VIEW
// ============================================================
function CamerasView({ selectedGate, setSelectedGate }: { selectedGate: typeof GATES[0]; setSelectedGate: (g: typeof GATES[0]) => void }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="space-y-4 animate-[fade-in_0.4s_ease]">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {GATES.map(gate => (
          <button
            key={gate.id}
            onClick={() => setSelectedGate(gate)}
            className={`panel cam-overlay relative rounded-lg overflow-hidden aspect-video group transition-all ${
              selectedGate.id === gate.id ? "ring-2 ring-cyber" : "hover:ring-1 hover:ring-cyber/50"
            }`}
          >
            <img src={cameraFeed} alt="cam" className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <div className="absolute top-2 left-2 flex items-center gap-1">
              <span className="status-dot status-live" />
              <span className="mono text-[10px] text-danger">REC</span>
            </div>
            <div className="absolute top-2 right-2 mono text-[10px] text-cyber">
              {String(Math.floor(tick / 3600)).padStart(2, "0")}:{String(Math.floor((tick % 3600) / 60)).padStart(2, "0")}:{String(tick % 60).padStart(2, "0")}
            </div>
            <div className="absolute bottom-2 left-2">
              <p className="text-xs font-semibold text-foreground">{gate.cam}</p>
              <p className="text-[10px] text-muted-foreground">{gate.name}</p>
            </div>
            <div className="absolute bottom-2 right-2">
              <span className={`mono text-[10px] font-bold`} style={{ color: `hsl(var(--${statusColor(gate.status)}))` }}>
                {gate.count} ppl
              </span>
            </div>
            <div className="corner-bracket corner-bracket-tl" />
            <div className="corner-bracket corner-bracket-tr" />
            <div className="corner-bracket corner-bracket-bl" />
            <div className="corner-bracket corner-bracket-br" />
          </button>
        ))}
      </div>

      {/* Selected Feed Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="panel cam-overlay lg:col-span-2 scanline relative rounded-lg overflow-hidden" style={{ aspectRatio: "16/7" }}>
          <img src={cameraFeed} alt="main cam" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

          {/* Detection Boxes overlay simulation */}
          <div className="absolute inset-0 pointer-events-none">
            {[
              { x: "15%", y: "30%", w: "8%", h: "25%", type: "child", color: "cyber" },
              { x: "35%", y: "25%", w: "6%", h: "20%", type: "adult", color: "safe" },
              { x: "55%", y: "35%", w: "7%", h: "22%", type: "disabled", color: "warning" },
              { x: "70%", y: "20%", w: "9%", h: "28%", type: "adult", color: "safe" },
              { x: "28%", y: "45%", w: "5%", h: "18%", type: "child", color: "cyber" },
              { x: "82%", y: "40%", w: "7%", h: "22%", type: "adult", color: "safe" },
            ].map((box, i) => (
              <div
                key={i}
                className="absolute border"
                style={{
                  left: box.x, top: box.y, width: box.w, height: box.h,
                  borderColor: `hsl(var(--${box.color}) / 0.8)`,
                  boxShadow: `0 0 8px hsl(var(--${box.color}) / 0.4)`,
                  animation: `fade-in ${0.5 + i * 0.1}s ease`,
                }}
              >
                <span className="absolute -top-4 left-0 mono text-[8px]" style={{ color: `hsl(var(--${box.color}))` }}>
                  {box.type.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          {/* UI Overlays */}
          <div className="absolute top-3 left-3 space-y-1">
            <div className="flex items-center gap-2 bg-background/70 rounded px-2 py-1">
              <span className="status-dot status-live" />
              <span className="mono text-xs text-danger">LIVE · {selectedGate.cam}</span>
            </div>
            <div className="bg-background/70 rounded px-2 py-1">
              <span className="mono text-xs text-cyber">AI DETECTION: ON</span>
            </div>
          </div>

          <div className="absolute top-3 right-3 bg-background/70 rounded px-2 py-1 text-right">
            <p className="mono text-xs text-muted-foreground">CROWD COUNT</p>
            <p className="font-orbitron text-lg font-bold neon-cyber">{selectedGate.count}</p>
          </div>

          <div className="absolute bottom-3 left-3">
            <p className="font-orbitron text-sm font-bold text-foreground">{selectedGate.name}</p>
            <p className="mono text-xs text-muted-foreground">Capacity: {selectedGate.cap} · {densityPct(selectedGate.count, selectedGate.cap)}% full</p>
          </div>

          <div className="corner-bracket corner-bracket-tl" />
          <div className="corner-bracket corner-bracket-tr" />
          <div className="corner-bracket corner-bracket-bl" />
          <div className="corner-bracket corner-bracket-br" />
        </div>

        {/* Camera Stats */}
        <div className="space-y-3">
          <div className="panel p-4">
            <h3 className="font-orbitron text-xs text-foreground tracking-widest uppercase mb-3">Detection Stats</h3>
            <div className="space-y-2">
              {[
                { label: "Adults", count: 387, color: "safe" },
                { label: "Children", count: 42, color: "cyber" },
                { label: "Disabled", count: 12, color: "warning" },
                { label: "Seniors", count: 28, color: "safe" },
                { label: "Unidentified", count: 378, color: "muted-foreground" },
              ].map(s => (
                <div key={s.label} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="mono font-bold" style={{ color: `hsl(var(--${s.color}))` }}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="panel p-4">
            <h3 className="font-orbitron text-xs text-foreground tracking-widest uppercase mb-3">Zone Risk Map</h3>
            <div className="grid grid-cols-3 gap-1 text-center">
              {[
                { zone: "A", risk: 34 }, { zone: "B", risk: 78 }, { zone: "C", risk: 91 },
                { zone: "D", risk: 22 }, { zone: "E", risk: 55 }, { zone: "F", risk: 43 },
              ].map(z => (
                <div
                  key={z.zone}
                  className="rounded py-2 text-xs font-bold font-orbitron"
                  style={{
                    background: z.risk > 70 ? "hsl(0 90% 55% / 0.2)" : z.risk > 50 ? "hsl(38 95% 55% / 0.2)" : "hsl(142 72% 45% / 0.15)",
                    color: z.risk > 70 ? "hsl(var(--danger))" : z.risk > 50 ? "hsl(var(--warning))" : "hsl(var(--safe))",
                    border: `1px solid ${z.risk > 70 ? "hsl(0 90% 55% / 0.4)" : z.risk > 50 ? "hsl(38 95% 55% / 0.4)" : "hsl(142 72% 45% / 0.3)"}`,
                  }}
                >
                  <div>Zone {z.zone}</div>
                  <div className="text-[10px] font-normal">{z.risk}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PRIORITY GROUPS VIEW
// ============================================================
function PriorityView() {
  const stages = [
    { stage: 1, name: "Entry Screening", desc: "Priority identification at gate entry via AI detection" },
    { stage: 2, name: "Lane Assignment", desc: "Dedicated lanes assigned for children, disabled & seniors" },
    { stage: 3, name: "Escort Protocol", desc: "Guard escort activated for vulnerable individuals" },
    { stage: 4, name: "Safe Zone Placement", desc: "Priority groups directed to designated safe zones" },
    { stage: 5, name: "Continuous Monitoring", desc: "Real-time tracking of priority individuals throughout venue" },
  ];

  return (
    <div className="space-y-4 animate-[fade-in_0.4s_ease]">
      {/* Priority Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Baby, label: "Children (< 12)", count: 234, color: "cyber", rules: ["Dedicated entry lane", "Accompanied escort required", "Low-density zone placement", "Lost child alert system", "Real-time head count"] },
          { icon: Accessibility, label: "Disabled Persons", count: 87, color: "warning", rules: ["Wheelchair accessible paths", "Priority boarding zones", "Guard assistance protocol", "Emergency evacuation first", "Medical alert monitoring"] },
          { icon: HeartPulse, label: "Senior Citizens (60+)", count: 156, color: "safe", rules: ["Slow flow lanes", "Rest zone proximity", "Medical alert system", "Priority exit access", "Companion verification"] },
          { icon: AlertCircle, label: "Medical Priority", count: 23, color: "danger", rules: ["Immediate medical response", "Ambulance standby alert", "Zone isolation capability", "Direct contact with paramedics", "Real-time vitals monitoring"] },
        ].map(g => (
          <div key={g.label} className="panel p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `hsl(var(--${g.color}) / 0.15)`, border: `1px solid hsl(var(--${g.color}) / 0.3)` }}>
                <g.icon className="w-5 h-5" style={{ color: `hsl(var(--${g.color}))` }} />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground leading-tight">{g.label}</p>
                <p className="font-orbitron text-lg font-bold" style={{ color: `hsl(var(--${g.color}))` }}>{g.count}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {g.rules.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: `hsl(var(--${g.color}))` }} />
                  <span className="text-muted-foreground">{r}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Stage-wise Flow */}
      <div className="panel p-5">
        <h3 className="font-orbitron text-xs text-foreground tracking-widest uppercase mb-4">Stage-Wise Priority Flow Protocol</h3>
        <div className="flex flex-col lg:flex-row gap-3">
          {stages.map((s, i) => (
            <div key={s.stage} className="flex lg:flex-col items-center gap-3 lg:gap-2 flex-1">
              <div className="flex flex-col lg:flex-row items-center lg:w-full">
                <div className="w-10 h-10 rounded-full bg-cyber/10 border-2 border-cyber flex items-center justify-center font-orbitron font-bold text-cyber text-sm flex-shrink-0">
                  {s.stage}
                </div>
                {i < stages.length - 1 && (
                  <div className="hidden lg:block flex-1 h-0.5 bg-gradient-to-r from-cyber/60 to-cyber/20 mx-2" />
                )}
              </div>
              <div className="text-center lg:mt-2">
                <p className="text-xs font-semibold text-foreground">{s.name}</p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Bar Chart */}
      <div className="panel p-4">
        <h3 className="font-orbitron text-xs text-foreground tracking-widest uppercase mb-3">Priority Group Distribution Over Time</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={[
            { gate: "Gate 1", children: 65, disabled: 12, senior: 34, medical: 5 },
            { gate: "Gate 2", children: 42, disabled: 28, senior: 67, medical: 8 },
            { gate: "Gate 3", children: 89, disabled: 35, senior: 44, medical: 9 },
            { gate: "Gate 4", children: 38, disabled: 12, senior: 11, medical: 1 },
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 25% 14%)" />
            <XAxis dataKey="gate" tick={{ fill: "hsl(220 15% 50%)", fontSize: 11 }} />
            <YAxis tick={{ fill: "hsl(220 15% 50%)", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "hsl(220 28% 9%)", border: "1px solid hsl(185 60% 20%)", borderRadius: 6 }} />
            <Bar dataKey="children" fill="hsl(185 100% 50%)" name="Children" radius={[2, 2, 0, 0]} />
            <Bar dataKey="disabled" fill="hsl(38 95% 55%)" name="Disabled" radius={[2, 2, 0, 0]} />
            <Bar dataKey="senior" fill="hsl(142 72% 45%)" name="Senior" radius={[2, 2, 0, 0]} />
            <Bar dataKey="medical" fill="hsl(0 90% 55%)" name="Medical" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ============================================================
// SECURITY VIEW
// ============================================================
function SecurityView() {
  const [scanPct, setScanPct] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setScanPct(p => (p + 1) % 101), 80);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="space-y-4 animate-[fade-in_0.4s_ease]">
      {/* OS Security Layers */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {SECURITY_LAYERS.map((layer, i) => (
          <div key={layer.name} className={`panel p-4 ${layer.status === "SCANNING" ? "panel-warning" : "panel-safe"}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${layer.status === "SCANNING" ? "bg-warning/10" : "bg-safe/10"}`}>
                <layer.icon className={`w-5 h-5 ${layer.status === "SCANNING" ? "text-warning" : "text-safe"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{layer.name}</p>
                <p className={`mono text-[10px] font-bold ${layer.status === "SCANNING" ? "text-warning pulse-warning" : "text-safe"}`}>
                  {layer.status}
                </p>
              </div>
            </div>
            {layer.status === "SCANNING" && (
              <div className="density-bar mt-2">
                <div className="density-fill-warning" style={{ width: `${scanPct}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Security Threat Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="panel p-4">
          <h3 className="font-orbitron text-xs text-foreground tracking-widest uppercase mb-3">Threat Detection Matrix</h3>
          <div className="space-y-2">
            {[
              { threat: "Stampede Risk", level: 78, status: "HIGH" },
              { threat: "Unauthorized Access", level: 12, status: "LOW" },
              { threat: "Panic Movement", level: 55, status: "MODERATE" },
              { threat: "Perimeter Breach", level: 8, status: "LOW" },
              { threat: "Crowd Surge", level: 82, status: "CRITICAL" },
              { threat: "Lane Obstruction", level: 34, status: "LOW" },
            ].map(t => {
              const color = t.level > 70 ? "danger" : t.level > 45 ? "warning" : "safe";
              return (
                <div key={t.threat} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-40 flex-shrink-0">{t.threat}</span>
                  <div className="flex-1 density-bar">
                    <div style={{ width: `${t.level}%`, background: `hsl(var(--${color}))`, height: "100%", borderRadius: 3 }} />
                  </div>
                  <span className="mono text-[10px] w-16 text-right" style={{ color: `hsl(var(--${color}))` }}>{t.status}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel p-4">
          <h3 className="font-orbitron text-xs text-foreground tracking-widest uppercase mb-3">OS Security Stack</h3>
          <div className="space-y-2">
            {[
              { layer: "Layer 1 – Physical Sensors", icon: "🔒", status: "SECURE" },
              { layer: "Layer 2 – Network Firewall", icon: "🛡", status: "SECURE" },
              { layer: "Layer 3 – AI Auth Engine", icon: "🤖", status: "ACTIVE" },
              { layer: "Layer 4 – Data Encryption", icon: "🔐", status: "AES-256" },
              { layer: "Layer 5 – Alert Gateway", icon: "📡", status: "LIVE" },
              { layer: "Layer 6 – Backup Systems", icon: "💾", status: "SYNCED" },
            ].map(l => (
              <div key={l.layer} className="flex items-center justify-between py-1.5 border-b border-panel-border/20 last:border-0">
                <div className="flex items-center gap-2 text-xs">
                  <span>{l.icon}</span>
                  <span className="text-foreground">{l.layer}</span>
                </div>
                <span className="mono text-[10px] text-safe font-bold">{l.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Camera Security Status */}
      <div className="panel p-4">
        <h3 className="font-orbitron text-xs text-foreground tracking-widest uppercase mb-3">Camera Security Audit</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {GATES.map(gate => (
            <div key={gate.id} className="bg-secondary/50 rounded-lg p-3 border border-panel-border/20">
              <div className="flex items-center justify-between mb-2">
                <span className="mono text-xs text-cyber">{gate.cam}</span>
                <span className="status-dot status-safe" />
              </div>
              <p className="text-xs text-foreground font-semibold">{gate.name}</p>
              <div className="mt-2 space-y-1 text-[10px] text-muted-foreground">
                <div className="flex justify-between"><span>Stream</span><span className="text-safe">ENCRYPTED</span></div>
                <div className="flex justify-between"><span>Auth</span><span className="text-safe">VERIFIED</span></div>
                <div className="flex justify-between"><span>Storage</span><span className="text-safe">SECURE</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// GUARDS VIEW
// ============================================================
function GuardsView() {
  const [guardName, setGuardName] = useState("");
  const [guardPhone, setGuardPhone] = useState("");
  const [guardGate, setGuardGate] = useState("Gate 1");
  const [guards, setGuards] = useState(GUARDS);

  const assign = () => {
    if (!guardName.trim()) return;
    setGuards(g => [...g, { name: guardName, id: `G-00${g.length + 1}`, gate: guardGate, status: "On Duty", phone: guardPhone }]);
    setGuardName(""); setGuardPhone("");
  };

  return (
    <div className="space-y-4 animate-[fade-in_0.4s_ease]">
      {/* Register form */}
      <div className="panel p-5">
        <h3 className="font-orbitron text-xs text-foreground tracking-widest uppercase mb-4">Register New Guard</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            value={guardName} onChange={e => setGuardName(e.target.value)}
            placeholder="Full Name"
            className="bg-secondary border border-panel-border/40 rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyber/60"
          />
          <input
            value={guardPhone} onChange={e => setGuardPhone(e.target.value)}
            placeholder="Mobile Number"
            className="bg-secondary border border-panel-border/40 rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyber/60"
          />
          <select
            value={guardGate} onChange={e => setGuardGate(e.target.value)}
            className="bg-secondary border border-panel-border/40 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-cyber/60"
          >
            {GATES.map(g => <option key={g.id}>{g.name.split("–")[0].trim()}</option>)}
          </select>
          <button
            onClick={assign}
            className="bg-cyber/10 border border-cyber/40 text-cyber rounded px-4 py-2 text-sm font-orbitron font-bold hover:bg-cyber/20 transition-colors"
          >
            + Assign Gate
          </button>
        </div>
      </div>

      {/* Guards Table */}
      <div className="panel p-4">
        <h3 className="font-orbitron text-xs text-foreground tracking-widest uppercase mb-3">Registered Guards & Assignments</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-panel-border/30">
                {["Guard ID", "Full Name", "Mobile", "Assigned Gate", "Status", "Action"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-medium tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {guards.map((g, i) => (
                <tr key={i} className="border-b border-panel-border/20 hover:bg-secondary/30 transition-colors">
                  <td className="py-2.5 px-3 mono text-xs text-cyber">{g.id}</td>
                  <td className="py-2.5 px-3 text-foreground font-medium">{g.name}</td>
                  <td className="py-2.5 px-3 mono text-xs text-muted-foreground">{g.phone}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-cyber/10 border border-cyber/30 text-cyber text-xs">{g.gate}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      g.status === "On Duty" ? "bg-safe/10 text-safe" :
                      g.status === "On Patrol" ? "bg-warning/10 text-warning" :
                      "bg-muted text-muted-foreground"
                    }`}>{g.status}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <button className="text-xs text-danger hover:text-danger/70 transition-colors">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ALERTS VIEW
// ============================================================
function AlertsView() {
  return (
    <div className="space-y-4 animate-[fade-in_0.4s_ease]">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Critical", count: 2, color: "danger" },
          { label: "Warnings", count: 3, color: "warning" },
          { label: "Info", count: 2, color: "safe" },
        ].map(s => (
          <div key={s.label} className="panel p-4 text-center">
            <p className="font-orbitron text-3xl font-bold" style={{ color: `hsl(var(--${s.color}))`, textShadow: `var(--glow-${s.color})` }}>{s.count}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label} Alerts</p>
          </div>
        ))}
      </div>

      <div className="panel p-4">
        <h3 className="font-orbitron text-xs text-foreground tracking-widest uppercase mb-3">All Incidents (View History)</h3>
        <div className="space-y-2">
          {ALERTS.map((alert, i) => (
            <div
              key={i}
              className={`px-4 py-3 rounded flex items-start gap-3 ${
                alert.level === "danger" ? "alert-bar" :
                alert.level === "warning" ? "alert-bar-warning" :
                alert.level === "safe" ? "bg-safe/10 border-l-3 border-l-safe" :
                "bg-cyber/10 border-l-2 border-cyber"
              }`}
              style={{ animation: `float-up ${0.2 + i * 0.05}s ease` }}
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{
                color: alert.level === "danger" ? "hsl(var(--danger))" :
                       alert.level === "warning" ? "hsl(var(--warning))" :
                       alert.level === "safe" ? "hsl(var(--safe))" : "hsl(var(--cyber))"
              }} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="mono text-[10px] text-muted-foreground">{alert.time}</span>
                  <span className={`mono text-[10px] font-bold uppercase ${
                    alert.level === "danger" ? "text-danger" :
                    alert.level === "warning" ? "text-warning" :
                    alert.level === "safe" ? "text-safe" : "text-cyber"
                  }`}>{alert.level}</span>
                </div>
                <p className="text-sm text-foreground">{alert.msg}</p>
              </div>
              <button className="text-muted-foreground hover:text-safe transition-colors flex-shrink-0">
                <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// EMERGENCY VIEW
// ============================================================
function EmergencyView({ emergencyMode, setEmergencyMode }: { emergencyMode: boolean; setEmergencyMode: (v: boolean) => void }) {
  const evacuationRoutes = [
    { route: "Route A", from: "Gate 3 → Main Hall", to: "Emergency Exit 1", priority: "PRIORITY", color: "danger" },
    { route: "Route B", from: "Gate 1 → Corridor B", to: "Emergency Exit 2", priority: "GENERAL", color: "warning" },
    { route: "Route C", from: "Gate 2 → Side Path", to: "Assembly Point", priority: "GENERAL", color: "safe" },
    { route: "Route D", from: "Zone B → Ramp", to: "Disabled Exit", priority: "DISABLED", color: "cyber" },
  ];

  return (
    <div className="space-y-4 animate-[fade-in_0.4s_ease]">
      {/* Hero Image */}
      <div className="relative rounded-xl overflow-hidden h-48 lg:h-64">
        <img src={heroCrowd} alt="crowd" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h2 className="font-orbitron text-2xl lg:text-4xl font-black tracking-widest" style={{
              color: emergencyMode ? "hsl(var(--danger))" : "hsl(var(--cyber))",
              textShadow: emergencyMode ? "var(--glow-danger)" : "var(--glow-cyber)",
            }}>
              {emergencyMode ? "🚨 EMERGENCY ACTIVE" : "EMERGENCY CONTROL"}
            </h2>
            <p className="text-muted-foreground text-sm mt-2 font-orbitron">
              {emergencyMode ? "Evacuation protocols deployed — all units mobilized" : "CrowdGuardAI Emergency Response Module"}
            </p>
          </div>
        </div>
      </div>

      {/* Toggle */}
      <div className="panel panel-danger p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-orbitron text-sm font-bold text-foreground">Emergency Demo Mode</h3>
          <p className="text-xs text-muted-foreground mt-1">Activates all alert systems, deploys all guards, and initiates evacuation routing</p>
        </div>
        <button
          onClick={() => setEmergencyMode(!emergencyMode)}
          className={`px-8 py-3 rounded-lg font-orbitron font-black text-sm tracking-widest transition-all duration-300 ${
            emergencyMode
              ? "bg-danger/20 border-2 border-danger text-danger pulse-danger"
              : "bg-secondary border-2 border-panel-border/40 text-muted-foreground hover:border-danger/60 hover:text-danger"
          }`}
        >
          {emergencyMode ? "🛑 DEACTIVATE" : "🚨 ACTIVATE EMERGENCY"}
        </button>
      </div>

      {/* Evacuation Routes */}
      <div className="panel p-4">
        <h3 className="font-orbitron text-xs text-foreground tracking-widest uppercase mb-3">Evacuation Route Matrix</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {evacuationRoutes.map(r => (
            <div key={r.route} className={`p-3 rounded-lg border ${
              r.color === "danger" ? "bg-danger/10 border-danger/40" :
              r.color === "warning" ? "bg-warning/10 border-warning/40" :
              r.color === "cyber" ? "bg-cyber/10 border-cyber/40" :
              "bg-safe/10 border-safe/40"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-orbitron text-xs font-bold" style={{ color: `hsl(var(--${r.color}))` }}>{r.route}</span>
                <span className="mono text-[10px] px-1.5 py-0.5 rounded" style={{
                  background: `hsl(var(--${r.color}) / 0.2)`,
                  color: `hsl(var(--${r.color}))`
                }}>{r.priority}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">{r.from}</span>
                <Navigation className="w-3 h-3 flex-shrink-0" style={{ color: `hsl(var(--${r.color}))` }} />
                <span className="text-foreground font-medium">{r.to}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency contacts */}
      <div className="panel p-4">
        <h3 className="font-orbitron text-xs text-foreground tracking-widest uppercase mb-3">Emergency Response Contacts</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { role: "Police Control", num: "100", icon: Shield, color: "cyber" },
            { role: "Ambulance", num: "108", icon: HeartPulse, color: "danger" },
            { role: "Fire Brigade", num: "101", icon: Zap, color: "warning" },
            { role: "Event Security", num: "Security HQ", icon: Radio, color: "safe" },
          ].map(c => (
            <div key={c.role} className="panel p-3 text-center">
              <c.icon className="w-6 h-6 mx-auto mb-2" style={{ color: `hsl(var(--${c.color}))` }} />
              <p className="text-xs text-muted-foreground">{c.role}</p>
              <p className="font-orbitron text-lg font-bold mt-1" style={{ color: `hsl(var(--${c.color}))` }}>{c.num}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// VIDEO ANALYSIS VIEW
// ============================================================
function VideoAnalysisView({ uploadProgress, analysing, analysisResult, handleUpload }: {
  uploadProgress: number;
  analysing: boolean;
  analysisResult: null | { count: number; risk: string; priority: string[] };
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-4 animate-[fade-in_0.4s_ease]">
      {/* Upload Box */}
      <div className="panel p-6 text-center relative">
        <div className="corner-bracket corner-bracket-tl" />
        <div className="corner-bracket corner-bracket-tr" />
        <div className="corner-bracket corner-bracket-bl" />
        <div className="corner-bracket corner-bracket-br" />
        <Upload className="w-10 h-10 text-cyber mx-auto mb-3 opacity-70" />
        <h3 className="font-orbitron text-sm font-bold text-foreground mb-1">Upload Video for AI Analysis</h3>
        <p className="text-xs text-muted-foreground mb-4">Upload a crowd video — our AI will detect people, identify priority groups & assess risk</p>
        <label className="cursor-pointer inline-block">
          <input type="file" accept="video/*" onChange={handleUpload} className="hidden" />
          <span className="px-6 py-2.5 rounded-lg border border-cyber/50 text-cyber text-sm font-orbitron font-bold hover:bg-cyber/10 transition-colors">
            + Add Video
          </span>
        </label>
      </div>

      {/* Progress */}
      {uploadProgress > 0 && (
        <div className="panel p-4">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted-foreground">{analysing ? "🧠 Deep AI Scanning in progress..." : uploadProgress < 100 ? "Uploading..." : "Upload Complete"}</span>
            <span className="mono text-cyber">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="density-bar">
            <div className="density-fill-safe" style={{ width: `${uploadProgress}%` }} />
          </div>
          {analysing && (
            <p className="text-xs text-warning mt-2 mono" style={{ animation: "blink 1s ease infinite" }}>
              ⚡ Please wait 5 seconds... AI model processing frames
            </p>
          )}
        </div>
      )}

      {/* Results */}
      {analysisResult && (
        <div className="space-y-3 animate-[float-up_0.5s_ease]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="panel p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Detected People</p>
              <p className="font-orbitron text-3xl font-black neon-cyber">{analysisResult.count}</p>
            </div>
            <div className={`panel p-4 text-center panel-${analysisResult.risk === "CRITICAL" || analysisResult.risk === "HIGH" ? "danger" : analysisResult.risk === "MODERATE" ? "warning" : "safe"}`}>
              <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
              <p className={`font-orbitron text-3xl font-black ${analysisResult.risk === "CRITICAL" || analysisResult.risk === "HIGH" ? "neon-danger" : analysisResult.risk === "MODERATE" ? "neon-warning" : "neon-safe"}`}>
                {analysisResult.risk}
              </p>
            </div>
            {analysisResult.priority.map((p, i) => (
              <div key={i} className="panel panel-warning p-4">
                <AlertTriangle className="w-4 h-4 text-warning mb-1" />
                <p className="text-xs text-foreground">{p}</p>
              </div>
            ))}
          </div>

          <div className="panel p-4">
            <h3 className="font-orbitron text-xs text-foreground tracking-widest uppercase mb-3">Analysis Report</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              {[
                { label: "Adults", count: Math.floor(analysisResult.count * 0.6) },
                { label: "Children", count: Math.floor(analysisResult.count * 0.12) },
                { label: "Disabled", count: Math.floor(analysisResult.count * 0.05) },
                { label: "Seniors", count: Math.floor(analysisResult.count * 0.08) },
              ].map(g => (
                <div key={g.label}>
                  <p className="font-orbitron text-2xl font-bold text-cyber">{g.count}</p>
                  <p className="text-xs text-muted-foreground mt-1">{g.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RTSP Setup */}
      <div className="panel p-4">
        <h3 className="font-orbitron text-xs text-foreground tracking-widest uppercase mb-3">RTSP Camera Setup</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            placeholder="rtsp://camera-ip:554/stream"
            className="bg-secondary border border-panel-border/40 rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyber/60 md:col-span-2"
          />
          <button className="bg-cyber/10 border border-cyber/40 text-cyber rounded px-4 py-2 text-sm font-orbitron font-bold hover:bg-cyber/20 transition-colors">
            Connect Stream
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Connect live RTSP streams from IP cameras for real-time AI crowd analysis</p>
      </div>
    </div>
  );
}

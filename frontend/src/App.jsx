import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

// ─── Config ────────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Colour palette (blue-rain theme) ──────────────────────────────────────
const C = {
  blue:    "#1a73e8",
  sky:     "#4fc3f7",
  teal:    "#00acc1",
  navy:    "#0d47a1",
  light:   "#e3f2fd",
  accent:  "#29b6f6",
  success: "#43a047",
  warn:    "#fb8c00",
  danger:  "#e53935",
  muted:   "#78909c",
};

// ─── Helper ─────────────────────────────────────────────────────────────────
const api = async (path, opts = {}) => {
  const r = await fetch(`${API}${path}`, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
};
const post = (path, body) => api(path, { method: "POST", body: JSON.stringify(body) });

// ─── Shared UI ───────────────────────────────────────────────────────────────
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-blue-100 shadow-sm p-4 ${className}`}>{children}</div>
);
const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue:  "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    amber: "bg-amber-100 text-amber-800",
    red:   "bg-red-100 text-red-800",
  };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[color]}`}>{children}</span>;
};
const Spinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
  </div>
);
const SectionTitle = ({ children, sub }) => (
  <div className="mb-4">
    <h2 className="text-lg font-semibold text-slate-800">{children}</h2>
    {sub && <p className="text-sm text-slate-500 mt-0.5">{sub}</p>}
  </div>
);
const StatCard = ({ label, value, unit = "", color = "blue" }) => {
  const bg = { blue: "bg-blue-50", green: "bg-green-50", amber: "bg-amber-50", teal: "bg-teal-50" };
  const txt = { blue: "text-blue-700", green: "text-green-700", amber: "text-amber-700", teal: "text-teal-700" };
  return (
    <div className={`${bg[color]} rounded-lg p-3`}>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${txt[color]}`}>{value}<span className="text-xs font-normal ml-1">{unit}</span></p>
    </div>
  );
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard",   icon: "📊", label: "Dashboard" },
  { id: "dataset",     icon: "📂", label: "Dataset" },
  { id: "eda",         icon: "📈", label: "EDA" },
  { id: "ml",          icon: "🤖", label: "ML Models" },
  { id: "dl",          icon: "🧠", label: "Deep Learning" },
  { id: "rl",          icon: "🎮", label: "RL Demo" },
  { id: "predict",     icon: "🌧️", label: "Predict" },
  { id: "methodology", icon: "📋", label: "Methodology" },
];

const Sidebar = ({ active, setActive, dataLoaded }) => (
  <aside className="w-56 bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col min-h-screen shadow-xl">
    <div className="p-4 border-b border-blue-700">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">🌧️</span>
        <div>
          <p className="font-bold text-sm leading-tight">RainCast AI</p>
          <p className="text-xs text-blue-300">Mini Project</p>
        </div>
      </div>
    </div>
    <nav className="flex-1 p-3 space-y-0.5">
      {NAV.map(({ id, icon, label }) => (
        <button
          key={id}
          onClick={() => setActive(id)}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all
            ${active === id
              ? "bg-white text-blue-900 font-medium shadow"
              : "text-blue-200 hover:bg-blue-700 hover:text-white"}`}
        >
          <span>{icon}</span>
          <span>{label}</span>
          {id === "predict" && !dataLoaded && (
            <span className="ml-auto text-xs text-blue-400">⚠</span>
          )}
        </button>
      ))}
    </nav>
    <div className="p-4 border-t border-blue-700">
      <p className="text-xs text-blue-400">2nd Year Engineering</p>
      <p className="text-xs text-blue-400">Mini Project · 2024</p>
    </div>
  </aside>
);

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: Dashboard
// ─────────────────────────────────────────────────────────────────────────────
const DashboardPage = ({ dataInfo, mlResults, predictions }) => {
  const sampleTrend = Array.from({ length: 12 }, (_, i) => ({
    month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
    rainfall: Math.round(30 + 60 * Math.sin((i / 11) * Math.PI) + Math.random() * 10)
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Rainfall Analytics Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">AI-Driven Forecasting & Weather Analysis System</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Dataset Records" value={dataInfo?.shape?.[0] ?? "—"} color="blue" />
        <StatCard label="Features" value={dataInfo?.shape?.[1] ?? "—"} color="teal" />
        <StatCard label="Best ML R²" value={mlResults?.length ? Math.max(...mlResults.map(r => r.r2)).toFixed(3) : "—"} color="green" />
        <StatCard label="Predictions Made" value={predictions?.length ?? 0} color="amber" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <SectionTitle sub="Monthly distribution pattern">Seasonal Rainfall Trend</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={sampleTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="mm" />
              <Tooltip formatter={v => [`${v} mm`, "Rainfall"]} />
              <Area type="monotone" dataKey="rainfall" stroke={C.blue} fill={C.light} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle sub="Accuracy comparison">ML Model Performance</SectionTitle>
          {mlResults?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mlResults}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="model" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="accuracy" fill={C.blue} name="Accuracy %" radius={[4,4,0,0]} />
                <Bar dataKey="r2" fill={C.sky} name="R² Score" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">
              Train ML models to see comparison
            </div>
          )}
        </Card>
      </div>

      {/* Recent predictions */}
      {predictions?.length > 0 && (
        <Card>
          <SectionTitle sub="Last 5 predictions">Prediction History</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-50 text-left">
                  {["Temp","Humidity","Windspeed","Predicted (mm)","Level","Model"].map(h => (
                    <th key={h} className="px-3 py-2 text-xs font-medium text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {predictions.slice(-5).reverse().map((p, i) => (
                  <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2">{p.inputs?.temperature}°C</td>
                    <td className="px-3 py-2">{p.inputs?.humidity}%</td>
                    <td className="px-3 py-2">{p.inputs?.windspeed} km/h</td>
                    <td className="px-3 py-2 font-medium text-blue-700">{p.predicted_rainfall} mm</td>
                    <td className="px-3 py-2"><Badge color={p.level.includes("Heavy") ? "red" : p.level.includes("Moderate") ? "amber" : "green"}>{p.level}</Badge></td>
                    <td className="px-3 py-2 text-xs text-slate-500">{p.model_used}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Methodology flow mini */}
      <Card>
        <SectionTitle sub="System pipeline overview">Methodology Flow</SectionTitle>
        <div className="flex items-center gap-1 flex-wrap">
          {["Data Collection","Data Processing","AI Analytics Engine","Prediction Generator","Output Dashboard"].map((s, i, arr) => (
            <div key={s} className="flex items-center gap-1">
              <div className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1.5 rounded-full">{s}</div>
              {i < arr.length - 1 && <span className="text-slate-400 text-sm">→</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: Dataset
// ─────────────────────────────────────────────────────────────────────────────
const DatasetPage = ({ onDataLoaded }) => {
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [result, setResult] = useState(null);
  const [error, setError]   = useState("");
  const inputRef = useRef();

  const handleFile = async (file) => {
    setStatus("loading");
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`${API}/api/dataset/upload`, { method: "POST", body: fd });
      const data = await r.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setStatus("done");
      onDataLoaded(data);
    } catch (e) {
      setError(e.message);
      setStatus("error");
    }
  };

  const loadSample = async () => {
    setStatus("loading");
    setError("");
    try {
      const data = await api("/api/dataset/sample");
      setResult(data);
      setStatus("done");
      onDataLoaded(data);
    } catch (e) {
      setError(e.message);
      setStatus("error");
    }
  };

  return (
    <div className="space-y-5">
      <SectionTitle sub="Upload or use sample weather dataset">Dataset Management</SectionTitle>

      {/* Upload zone */}
      <Card>
        <div
          className="border-2 border-dashed border-blue-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        >
          <div className="text-5xl mb-3">📂</div>
          <p className="text-slate-700 font-medium">Drop CSV file here or click to upload</p>
          <p className="text-sm text-slate-400 mt-1">Supports: temperature, humidity, windspeed, pressure, moisture, rainfall</p>
          <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 border-t border-slate-200" />
          <span className="text-sm text-slate-400">or</span>
          <div className="flex-1 border-t border-slate-200" />
        </div>
        <button
          onClick={loadSample}
          disabled={status === "loading"}
          className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {status === "loading" ? "Loading…" : "Load Sample Dataset (Demo)"}
        </button>
      </Card>

      {status === "loading" && <Spinner />}
      {status === "error" && <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm">{error}</div>}

      {status === "done" && result && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total Rows" value={result.original_shape[0]} color="blue" />
            <StatCard label="Columns" value={result.columns.length} color="teal" />
            <StatCard label="Missing (before)" value={result.missing_before} color="amber" />
            <StatCard label="Missing (after)" value={result.missing_after} color="green" />
          </div>

          {/* Columns */}
          <Card>
            <SectionTitle sub="Detected features">Columns</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {result.columns.map(c => <Badge key={c} color="blue">{c}</Badge>)}
            </div>
          </Card>

          {/* Preview table */}
          <Card>
            <SectionTitle sub="First 20 rows">Dataset Preview</SectionTitle>
            <div className="overflow-x-auto">
              <table className="text-xs w-full">
                <thead>
                  <tr className="bg-blue-50">
                    {result.columns.map(c => (
                      <th key={c} className="px-3 py-2 text-left font-medium text-slate-600 whitespace-nowrap">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.preview.map((row, i) => (
                    <tr key={i} className={`border-t border-slate-100 ${i % 2 === 0 ? "" : "bg-slate-50"}`}>
                      {result.columns.map(c => (
                        <td key={c} className="px-3 py-1.5 whitespace-nowrap">{typeof row[c] === "number" ? row[c].toFixed(2) : row[c]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: EDA
// ─────────────────────────────────────────────────────────────────────────────
const EDAPage = ({ dataLoaded }) => {
  const [charts, setCharts] = useState({});
  const [loading, setLoading] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [trend, tempRain, humRain, seasonal, corr] = await Promise.all([
        api("/api/eda/rainfall-trend"),
        api("/api/eda/temperature-vs-rainfall"),
        api("/api/eda/humidity-vs-rainfall"),
        api("/api/eda/seasonal"),
        api("/api/eda/correlation"),
      ]);
      setCharts({ trend, tempRain, humRain, seasonal, corr });
    } catch {}
    setLoading(false);
  };

  useEffect(() => { if (dataLoaded) loadAll(); }, [dataLoaded]);

  if (!dataLoaded) return (
    <div className="text-center py-20 text-slate-400">
      <div className="text-5xl mb-3">📂</div>
      <p>Please load a dataset first from the Dataset page.</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <SectionTitle sub="Exploratory Data Analysis — graphical insights">EDA Visualizations</SectionTitle>
      {loading && <Spinner />}

      {charts.trend && (
        <Card>
          <SectionTitle sub="Rainfall values across dataset indices">Rainfall Trend</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={charts.trend.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="index" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="rainfall" stroke={C.blue} fill={C.light} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {charts.tempRain && (
          <Card>
            <SectionTitle sub="Scatter plot">Temperature vs Rainfall</SectionTitle>
            <ResponsiveContainer width="100%" height={200}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="temperature" name="Temp" unit="°C" tick={{ fontSize: 10 }} />
                <YAxis dataKey="rainfall" name="Rainfall" unit="mm" tick={{ fontSize: 10 }} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter data={charts.tempRain.data} fill={C.blue} fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </Card>
        )}

        {charts.humRain && (
          <Card>
            <SectionTitle sub="Scatter plot">Humidity vs Rainfall</SectionTitle>
            <ResponsiveContainer width="100%" height={200}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="humidity" name="Humidity" unit="%" tick={{ fontSize: 10 }} />
                <YAxis dataKey="rainfall" name="Rainfall" unit="mm" tick={{ fontSize: 10 }} />
                <Tooltip />
                <Scatter data={charts.humRain.data} fill={C.teal} fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {charts.seasonal && (
        <Card>
          <SectionTitle sub="Average monthly rainfall distribution">Seasonal Pattern</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts.seasonal.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="mm" />
              <Tooltip />
              <Bar dataKey="avgRainfall" name="Avg Rainfall (mm)" fill={C.accent} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {charts.corr && <CorrelationHeatmap corr={charts.corr} />}
    </div>
  );
};

const CorrelationHeatmap = ({ corr }) => {
  const { columns, matrix } = corr;
  const cell = (row, col) => matrix.find(m => m.row === row && m.col === col)?.value ?? 0;
  const color = (v) => {
    if (v > 0.7) return "bg-blue-700 text-white";
    if (v > 0.4) return "bg-blue-400 text-white";
    if (v > 0.1) return "bg-blue-200 text-blue-900";
    if (v > -0.1) return "bg-slate-100 text-slate-600";
    if (v > -0.4) return "bg-red-200 text-red-900";
    return "bg-red-500 text-white";
  };
  return (
    <Card>
      <SectionTitle sub="Feature correlation matrix">Correlation Heatmap</SectionTitle>
      <div className="overflow-x-auto">
        <table className="text-xs mx-auto">
          <thead>
            <tr>
              <th className="px-2 py-1" />
              {columns.map(c => <th key={c} className="px-2 py-1 font-medium text-slate-600 whitespace-nowrap">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {columns.map(row => (
              <tr key={row}>
                <td className="px-2 py-1 font-medium text-slate-600 whitespace-nowrap">{row}</td>
                {columns.map(col => {
                  const v = cell(row, col);
                  return (
                    <td key={col} className={`px-2 py-1.5 text-center rounded-sm m-0.5 font-medium ${color(v)}`} style={{ minWidth: 52 }}>
                      {v.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center gap-2 justify-center mt-3 text-xs text-slate-500">
          <div className="w-3 h-3 rounded bg-red-500" /> Negative
          <div className="w-3 h-3 rounded bg-slate-200" /> Neutral
          <div className="w-3 h-3 rounded bg-blue-700" /> Positive
        </div>
      </div>
    </Card>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: ML Models
// ─────────────────────────────────────────────────────────────────────────────
const MLPage = ({ dataLoaded, onMLResults }) => {
  const [status, setStatus] = useState("idle");
  const [results, setResults] = useState(null);

  const train = async () => {
    setStatus("loading");
    try {
      const data = await post("/api/ml/train", {});
      setResults(data);
      onMLResults(data.results);
      setStatus("done");
    } catch (e) {
      setStatus("error");
    }
  };

  if (!dataLoaded) return (
    <div className="text-center py-20 text-slate-400">
      <div className="text-5xl mb-3">🤖</div>
      <p>Load a dataset first to train ML models.</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <SectionTitle sub="Compare multiple supervised learning algorithms">Machine Learning Models</SectionTitle>

      <Card>
        <p className="text-sm text-slate-600 mb-3">
          Models trained: <strong>Linear Regression</strong>, <strong>Decision Tree</strong>, <strong>Random Forest</strong>, <strong>XGBoost</strong>
        </p>
        <button
          onClick={train}
          disabled={status === "loading"}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {status === "loading" ? "Training…" : "🚀 Train All Models"}
        </button>
        {status === "loading" && (
          <p className="text-xs text-slate-400 mt-2 animate-pulse">Training models on your dataset… this may take a few seconds.</p>
        )}
      </Card>

      {status === "done" && results && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard label="Best Model" value={results.best_model} color="blue" />
            <StatCard label="Best R² Score" value={results.best_r2} color="green" />
            <StatCard label="Features Used" value={results.feature_cols?.length} color="teal" />
          </div>

          <Card>
            <SectionTitle sub="Side-by-side accuracy comparison">Model Comparison Chart</SectionTitle>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={results.results} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="model" type="category" tick={{ fontSize: 10 }} width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="accuracy" name="Accuracy %" fill={C.blue} radius={[0,4,4,0]} />
                <Bar dataKey="r2" name="R² Score" fill={C.sky} radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <SectionTitle sub="Detailed metrics table">Results Table</SectionTitle>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-50 text-left">
                  {["Model","Accuracy %","RMSE","MAE","R²"].map(h => (
                    <th key={h} className="px-3 py-2 text-xs font-medium text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.results.map((r, i) => (
                  <tr key={i} className={`border-t border-slate-100 ${r.model === results.best_model ? "bg-blue-50 font-medium" : ""}`}>
                    <td className="px-3 py-2 flex items-center gap-1">
                      {r.model === results.best_model && <span className="text-yellow-500">★</span>}
                      {r.model}
                    </td>
                    <td className="px-3 py-2">{r.accuracy}%</td>
                    <td className="px-3 py-2">{r.rmse}</td>
                    <td className="px-3 py-2">{r.mae}</td>
                    <td className="px-3 py-2">{r.r2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {results.prediction_chart?.length > 0 && (
            <Card>
              <SectionTitle sub="Best model predictions vs actual values">Actual vs Predicted</SectionTitle>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={results.prediction_chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="index" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="actual" stroke={C.navy} strokeWidth={2} dot={false} name="Actual" />
                  <Line type="monotone" dataKey="predicted" stroke={C.accent} strokeWidth={2} dot={false} strokeDasharray="5 5" name="Predicted" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: Deep Learning
// ─────────────────────────────────────────────────────────────────────────────
const DLPage = ({ dataLoaded }) => {
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);

  const train = async () => {
    setStatus("loading");
    try {
      const data = await post("/api/dl/train", {});
      setResult(data);
      setStatus("done");
    } catch { setStatus("error"); }
  };

  if (!dataLoaded) return (
    <div className="text-center py-20 text-slate-400">
      <div className="text-5xl mb-3">🧠</div>
      <p>Load a dataset first to train the ANN model.</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <SectionTitle sub="Artificial Neural Network using TensorFlow/Keras">Deep Learning Forecasting</SectionTitle>

      {/* Architecture diagram */}
      <Card>
        <SectionTitle sub="ANN Architecture">Model Structure</SectionTitle>
        <div className="flex items-center justify-center gap-3 py-3 flex-wrap">
          {[
            { label: "Input Layer", nodes: "N features", color: "bg-blue-100 text-blue-800" },
            { label: "Hidden 1", nodes: "64 neurons · ReLU", color: "bg-blue-200 text-blue-900" },
            { label: "Dropout 20%", nodes: "Regularization", color: "bg-slate-100 text-slate-600" },
            { label: "Hidden 2", nodes: "32 neurons · ReLU", color: "bg-blue-300 text-blue-900" },
            { label: "Hidden 3", nodes: "16 neurons · ReLU", color: "bg-blue-400 text-white" },
            { label: "Output", nodes: "1 (rainfall)", color: "bg-blue-700 text-white" },
          ].map((l, i, arr) => (
            <div key={l.label} className="flex items-center gap-2">
              <div className={`${l.color} rounded-lg px-3 py-2 text-center text-xs font-medium`}>
                <div className="font-semibold">{l.label}</div>
                <div className="opacity-75 text-xs">{l.nodes}</div>
              </div>
              {i < arr.length - 1 && <span className="text-slate-400">→</span>}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 text-center mt-2">Optimizer: Adam · Loss: MSE · Epochs: 30</p>
      </Card>

      <button
        onClick={train}
        disabled={status === "loading"}
        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
      >
        {status === "loading" ? "Training ANN…" : "🧠 Train ANN Model"}
      </button>
      {status === "loading" && <p className="text-xs text-slate-400 animate-pulse">Training neural network for 30 epochs…</p>}

      {status === "done" && result && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Framework" value={result.framework.split(" ")[0]} color="blue" />
            <StatCard label="Epochs" value={result.epochs} color="teal" />
            <StatCard label="R² Score" value={result.r2} color="green" />
            <StatCard label="RMSE" value={result.rmse} color="amber" />
          </div>

          <Card>
            <SectionTitle sub="Training vs validation loss over epochs">Training Loss Curve</SectionTitle>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={result.loss_chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="epoch" tick={{ fontSize: 10 }} label={{ value: "Epoch", position: "insideBottom", offset: -2, fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="trainLoss" stroke={C.blue} strokeWidth={2} dot={false} name="Train Loss" />
                <Line type="monotone" dataKey="valLoss" stroke={C.warn} strokeWidth={2} dot={false} strokeDasharray="5 5" name="Val Loss" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {result.pred_chart?.length > 0 && (
            <Card>
              <SectionTitle sub="ANN predictions vs actual">Prediction Comparison</SectionTitle>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={result.pred_chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="index" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="actual" stroke={C.navy} strokeWidth={2} dot={false} name="Actual" />
                  <Line type="monotone" dataKey="predicted" stroke={C.accent} strokeWidth={2} dot={false} strokeDasharray="5 5" name="Predicted" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: RL Demo
// ─────────────────────────────────────────────────────────────────────────────
const RLPage = () => {
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);

  const simulate = async () => {
    setStatus("loading");
    try {
      const data = await post("/api/rl/simulate", {});
      setResult(data);
      setStatus("done");
    } catch { setStatus("error"); }
  };

  return (
    <div className="space-y-5">
      <SectionTitle sub="Q-Learning based hyperparameter optimization demo">Reinforcement Learning</SectionTitle>

      <Card>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          {[
            { icon: "🤖", t: "Agent", d: "ML model optimizer trying to find best hyperparameters" },
            { icon: "🌍", t: "Environment", d: "Prediction accuracy landscape (state space)" },
            { icon: "🎯", t: "Reward", d: "Higher accuracy = higher reward signal" },
          ].map(({ icon, t, d }) => (
            <div key={t} className="bg-blue-50 rounded-lg p-3">
              <div className="text-xl mb-1">{icon}</div>
              <div className="font-medium text-slate-800">{t}</div>
              <div className="text-xs text-slate-500 mt-1">{d}</div>
            </div>
          ))}
        </div>
      </Card>

      <button
        onClick={simulate}
        disabled={status === "loading"}
        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
      >
        {status === "loading" ? "Simulating…" : "▶ Run Q-Learning Simulation"}
      </button>

      {status === "done" && result && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Algorithm" value="Q-Learning" color="blue" />
            <StatCard label="Episodes" value={result.episodes} color="teal" />
            <StatCard label="Max Reward" value={result.max_reward} color="green" />
            <StatCard label="Avg Reward" value={result.avg_reward} color="amber" />
          </div>

          <Card>
            <SectionTitle sub="Agent reward per episode (smoothed)">Reward Curve</SectionTitle>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={result.smoothed_chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="episode" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="reward" stroke={C.blue} strokeWidth={2} dot={false} name="Smoothed Reward" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <SectionTitle sub="Actions taken during optimization">Optimization Steps</SectionTitle>
            <div className="space-y-2">
              {result.optimization_steps.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-blue-50">
                  <div className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 text-xs font-bold flex items-center justify-center">{s.step}</div>
                  <div className="flex-1 text-sm text-slate-700">{s.action}</div>
                  <div className="text-sm font-medium text-blue-700">+{s.reward}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle sub="Episode-by-episode Q-learning log">Training Log</SectionTitle>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-blue-50">
                  {["Episode","Total Reward","Epsilon","Best Q-Value"].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.steps_log.map((s, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-3 py-1.5">{s.episode}</td>
                    <td className="px-3 py-1.5">{s.totalReward}</td>
                    <td className="px-3 py-1.5">{s.epsilon}</td>
                    <td className="px-3 py-1.5">{s.bestQValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: Predict
// ─────────────────────────────────────────────────────────────────────────────
const PredictPage = ({ onPrediction }) => {
  const [form, setForm] = useState({ temperature: 28, humidity: 75, windspeed: 12, pressure: 1010, moisture: 65, visibility: 5 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: parseFloat(v) }));

  const predict = async () => {
    setLoading(true);
    try {
      const data = await post("/api/predict/rainfall", form);
      setResult(data);
      onPrediction(data);
    } catch {}
    setLoading(false);
  };

  const levelColor = (l) => l?.includes("Heavy") ? "text-red-600" : l?.includes("Moderate") ? "text-amber-600" : l?.includes("Light") ? "text-blue-600" : "text-green-600";
  const levelBg   = (l) => l?.includes("Heavy") ? "bg-red-50 border-red-200" : l?.includes("Moderate") ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200";

  const fields = [
    { key: "temperature", label: "Temperature", unit: "°C", min: 0, max: 50, step: 0.5 },
    { key: "humidity",    label: "Humidity",    unit: "%",  min: 0, max: 100, step: 1 },
    { key: "windspeed",   label: "Wind Speed",  unit: "km/h", min: 0, max: 60, step: 0.5 },
    { key: "pressure",    label: "Pressure",    unit: "hPa", min: 960, max: 1040, step: 0.5 },
    { key: "moisture",    label: "Moisture",    unit: "%",  min: 0, max: 100, step: 1 },
    { key: "visibility",  label: "Visibility",  unit: "km", min: 0, max: 20, step: 0.5 },
  ];

  return (
    <div className="space-y-5">
      <SectionTitle sub="Enter weather parameters to get rainfall prediction">Rainfall Prediction</SectionTitle>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Input form */}
        <Card>
          <SectionTitle sub="Adjust sliders or type values">Weather Parameters</SectionTitle>
          <div className="space-y-4">
            {fields.map(f => (
              <div key={f.key}>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-slate-600">{f.label}</label>
                  <span className="text-sm font-medium text-blue-700">{form[f.key]} {f.unit}</span>
                </div>
                <input
                  type="range" min={f.min} max={f.max} step={f.step}
                  value={form[f.key]}
                  onChange={e => set(f.key, e.target.value)}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{f.min}{f.unit}</span><span>{f.max}{f.unit}</span>
                </div>
              </div>
            ))}
            <button
              onClick={predict}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition mt-2 disabled:opacity-50"
            >
              {loading ? "Predicting…" : "🌧️ Predict Rainfall"}
            </button>
          </div>
        </Card>

        {/* Result panel */}
        <div className="space-y-4">
          {result ? (
            <>
              <Card className={`border ${levelBg(result.level)}`}>
                <div className="text-center py-4">
                  <div className="text-5xl mb-2">
                    {result.level === "No Rain" ? "☀️" : result.level === "Light Rain" ? "🌦️" : result.level.includes("Heavy") ? "⛈️" : "🌧️"}
                  </div>
                  <div className={`text-2xl font-bold ${levelColor(result.level)}`}>{result.level}</div>
                  <div className="text-4xl font-bold text-slate-800 mt-2">{result.predicted_rainfall} <span className="text-lg font-normal text-slate-500">mm</span></div>
                  <div className="mt-2">
                    <div className="text-sm text-slate-500 mb-1">Probability</div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: `${result.probability}%` }} />
                    </div>
                    <div className="text-sm font-medium text-blue-700 mt-1">{result.probability}%</div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Model Used</span>
                    <span className="font-medium">{result.model_used}</span>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-slate-700">
                    💡 {result.insight}
                  </div>
                </div>
              </Card>

              {/* Radar chart of inputs */}
              <Card>
                <SectionTitle sub="Input parameter overview">Parameter Radar</SectionTitle>
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={[
                    { param: "Temp", value: (form.temperature / 50) * 100 },
                    { param: "Humidity", value: form.humidity },
                    { param: "Windspeed", value: (form.windspeed / 60) * 100 },
                    { param: "Pressure", value: ((form.pressure - 960) / 80) * 100 },
                    { param: "Moisture", value: form.moisture },
                    { param: "Visibility", value: (form.visibility / 20) * 100 },
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="param" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar dataKey="value" stroke={C.blue} fill={C.blue} fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-16">
              <div className="text-6xl mb-4">🌤️</div>
              <p className="text-sm">Adjust parameters and click Predict</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: Methodology
// ─────────────────────────────────────────────────────────────────────────────
const MethodologyPage = () => (
  <div className="space-y-5">
    <SectionTitle sub="System design and project flow">Methodology</SectionTitle>

    {/* Pipeline */}
    <Card>
      <SectionTitle sub="Data flow through the system">System Pipeline</SectionTitle>
      <div className="space-y-3">
        {[
          { n: "01", t: "Data Collection", d: "Collect historical weather data (CSV/API). Features: temperature, humidity, windspeed, pressure, moisture, visibility, rainfall.", icon: "📡", color: "bg-blue-100" },
          { n: "02", t: "Data Processing", d: "Handle missing values via mean imputation. Normalize features using StandardScaler. Split into train/test sets (80/20).", icon: "⚙️", color: "bg-blue-200" },
          { n: "03", t: "AI Analytics Engine", d: "Train ML models (Linear Regression, Decision Tree, Random Forest, XGBoost) and ANN via TensorFlow. Compare performance metrics (R², RMSE, MAE).", icon: "🤖", color: "bg-blue-300" },
          { n: "04", t: "RL Optimization", d: "Q-learning agent tunes hyperparameters by maximizing prediction accuracy reward over 50 training episodes.", icon: "🎮", color: "bg-blue-400" },
          { n: "05", t: "Prediction Generator", d: "User inputs weather parameters → best model makes real-time rainfall prediction with probability and severity level.", icon: "🌧️", color: "bg-blue-500" },
          { n: "06", t: "Output Dashboard", d: "Interactive dashboard shows EDA visualizations, model comparisons, prediction history, and seasonal trends.", icon: "📊", color: "bg-blue-700" },
        ].map(({ n, t, d, icon, color }) => (
          <div key={n} className="flex gap-4">
            <div className={`${color} text-white w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0`}>{n}</div>
            <div className="flex-1 border-l-2 border-blue-100 pl-4 pb-3">
              <div className="font-medium text-slate-800 flex items-center gap-2">{icon} {t}</div>
              <div className="text-sm text-slate-500 mt-1">{d}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>

    {/* Objectives */}
    <Card>
      <SectionTitle sub="Project objectives">Objectives</SectionTitle>
      <ul className="space-y-2 text-sm text-slate-700">
        {[
          "Develop an AI-driven system for accurate rainfall prediction",
          "Compare multiple ML algorithms for weather forecasting",
          "Implement a deep learning ANN model using TensorFlow/Keras",
          "Demonstrate reinforcement learning for AI optimization",
          "Provide an interactive dashboard for data visualization",
          "Enable real-time rainfall prediction from weather inputs",
        ].map((o, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">✓</span> {o}
          </li>
        ))}
      </ul>
    </Card>

    {/* Tech stack */}
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <SectionTitle>Frontend Stack</SectionTitle>
        {[["React + Vite","UI Framework"],["Tailwind CSS","Styling"],["Recharts","Data Visualization"]].map(([t, s]) => (
          <div key={t} className="flex justify-between py-1.5 border-b border-slate-100 text-sm last:border-0">
            <span className="font-medium text-slate-700">{t}</span>
            <span className="text-slate-400">{s}</span>
          </div>
        ))}
      </Card>
      <Card>
        <SectionTitle>Backend & ML Stack</SectionTitle>
        {[["Flask","REST API Backend"],["Scikit-learn","ML Models"],["TensorFlow/Keras","Deep Learning"],["NumPy/Pandas","Data Processing"],["XGBoost","Gradient Boosting"]].map(([t, s]) => (
          <div key={t} className="flex justify-between py-1.5 border-b border-slate-100 text-sm last:border-0">
            <span className="font-medium text-slate-700">{t}</span>
            <span className="text-slate-400">{s}</span>
          </div>
        ))}
      </Card>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]         = useState("dashboard");
  const [dataInfo, setDataInfo] = useState(null);
  const [mlResults, setMlResults] = useState([]);
  const [predictions, setPredictions] = useState([]);

  const onDataLoaded = (d) => setDataInfo(d);
  const onMLResults  = (r) => setMlResults(r);
  const onPrediction = (p) => setPredictions(prev => [...prev, p]);

  const dataLoaded = !!dataInfo;

  const pages = {
    dashboard:   <DashboardPage dataInfo={dataInfo} mlResults={mlResults} predictions={predictions} />,
    dataset:     <DatasetPage onDataLoaded={onDataLoaded} />,
    eda:         <EDAPage dataLoaded={dataLoaded} />,
    ml:          <MLPage dataLoaded={dataLoaded} onMLResults={onMLResults} />,
    dl:          <DLPage dataLoaded={dataLoaded} />,
    rl:          <RLPage />,
    predict:     <PredictPage onPrediction={onPrediction} />,
    methodology: <MethodologyPage />,
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar active={page} setActive={setPage} dataLoaded={dataLoaded} />
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="text-sm text-slate-500">
            🌧️ <span className="font-medium text-slate-700">AI-Driven Rainfall Forecasting System</span>
          </div>
          <div className="flex items-center gap-2">
            {dataLoaded && <Badge color="green">Dataset Loaded</Badge>}
            {mlResults.length > 0 && <Badge color="blue">Models Trained</Badge>}
          </div>
        </div>
        <div className="p-6 max-w-5xl mx-auto">
          {pages[page]}
        </div>
      </main>
    </div>
  );
}

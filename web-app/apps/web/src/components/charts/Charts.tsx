import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useTheme } from '../../store/theme';

// "Intelly" pastel chart palette: lavender, butter, lime, pink, periwinkle, teal, rose.
export const CHART_COLORS = ['#8b7be8', '#e3c14e', '#86c25a', '#e57aa4', '#6f8fe0', '#4bb8a0', '#e0607f'];

function useAxis() {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  return {
    grid: dark ? '#26333f' : '#e6eaf0',
    tick: dark ? '#9aabbd' : '#64748b',
    tooltipBg: dark ? '#141e2a' : '#ffffff',
    tooltipBorder: dark ? '#26333f' : '#e2e8f0',
    text: dark ? '#e7edf4' : '#16202c',
  };
}

function TooltipStyle() {
  const a = useAxis();
  return { contentStyle: { background: a.tooltipBg, border: `1px solid ${a.tooltipBorder}`, borderRadius: 10, fontSize: 12, color: a.text, boxShadow: '0 8px 24px -8px rgb(0 0 0 / 0.2)' }, labelStyle: { color: a.text, fontWeight: 600 }, itemStyle: { color: a.text } };
}

export function AttendanceAreaChart({ data }: { data: { date: string; present: number; absent: number; late: number }[] }) {
  const a = useAxis();
  const t = TooltipStyle();
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="gPresent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.4} />
            <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gLate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS[1]} stopOpacity={0.22} />
            <stop offset="100%" stopColor={CHART_COLORS[1]} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gAbsent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS[6]} stopOpacity={0.18} />
            <stop offset="100%" stopColor={CHART_COLORS[6]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={a.grid} vertical={false} />
        <XAxis dataKey="date" tick={{ fill: a.tick, fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: a.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
        <Tooltip {...t} />
        <Area type="monotone" dataKey="present" stroke={CHART_COLORS[0]} strokeWidth={2.5} fill="url(#gPresent)" activeDot={{ r: 4 }} />
        <Area type="monotone" dataKey="late" stroke={CHART_COLORS[1]} strokeWidth={2} fill="url(#gLate)" activeDot={{ r: 3 }} />
        <Area type="monotone" dataKey="absent" stroke={CHART_COLORS[6]} strokeWidth={2} fill="url(#gAbsent)" activeDot={{ r: 3 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SimpleBarChart({ data, dataKey, xKey, color = CHART_COLORS[0], height = 260 }: { data: any[]; dataKey: string; xKey: string; color?: string; height?: number }) {
  const a = useAxis();
  const t = TooltipStyle();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="gBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.95} />
            <stop offset="100%" stopColor={color} stopOpacity={0.55} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={a.grid} vertical={false} />
        <XAxis dataKey={xKey} tick={{ fill: a.tick, fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: a.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
        <Tooltip {...t} cursor={{ fill: a.grid, opacity: 0.4 }} />
        <Bar dataKey={dataKey} fill="url(#gBar)" radius={[6, 6, 0, 0]} maxBarSize={44} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function GroupedBarChart({ data }: { data: { week: string; assigned: number; completed: number }[] }) {
  const a = useAxis();
  const t = TooltipStyle();
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={a.grid} vertical={false} />
        <XAxis dataKey="week" tick={{ fill: a.tick, fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: a.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
        <Tooltip {...t} />
        <Legend wrapperStyle={{ fontSize: 12, color: a.tick }} />
        <Line type="monotone" dataKey="assigned" stroke={CHART_COLORS[3]} strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="completed" stroke={CHART_COLORS[2]} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({ data, height = 260, centerLabel, centerSub }: { data: { label: string; value: number }[]; height?: number; centerLabel?: string; centerSub?: string }) {
  const t = TooltipStyle();
  const a = useAxis();
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" innerRadius="62%" outerRadius="85%" paddingAngle={2} stroke="none" cornerRadius={6}>
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip {...t} formatter={(v: number, n) => [`${v} (${total ? Math.round((v / total) * 100) : 0}%)`, n]} />
          <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
      {/* Center total overlay */}
      <div className="pointer-events-none absolute inset-x-0 flex flex-col items-center justify-center" style={{ top: 0, height: height - 34 }}>
        <span className="text-2xl font-bold tracking-tight" style={{ color: a.text }}>{centerLabel ?? total}</span>
        {centerSub && <span className="text-[11px] font-medium uppercase tracking-wide" style={{ color: a.tick }}>{centerSub}</span>}
      </div>
    </div>
  );
}

/** Radial percentage gauge — great for "present rate", goal attainment, etc. */
export function RadialGauge({ value, label, sublabel, color = CHART_COLORS[2], height = 220 }: { value: number; label?: string; sublabel?: string; color?: string; height?: number }) {
  const a = useAxis();
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: v, fill: color }]} startAngle={90} endAngle={-270}>
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar background={{ fill: a.grid }} dataKey="value" cornerRadius={16} angleAxisId={0} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tracking-tight" style={{ color: a.text }}>{v}%</span>
        {label && <span className="mt-0.5 text-xs font-medium" style={{ color: a.tick }}>{label}</span>}
        {sublabel && <span className="text-[11px]" style={{ color: a.tick }}>{sublabel}</span>}
      </div>
    </div>
  );
}

export function Sparkline({ data, color = CHART_COLORS[0] }: { data: number[]; color?: string }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sp-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#sp-${color})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useTheme } from '../../store/theme';

export const CHART_COLORS = ['#2e6fb0', '#c79212', '#1b7f5e', '#7a3fb0', '#b4630a', '#0ea5e9', '#e11d48'];

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
            <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.35} />
            <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={a.grid} vertical={false} />
        <XAxis dataKey="date" tick={{ fill: a.tick, fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: a.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
        <Tooltip {...t} />
        <Area type="monotone" dataKey="present" stroke={CHART_COLORS[0]} strokeWidth={2} fill="url(#gPresent)" />
        <Line type="monotone" dataKey="late" stroke={CHART_COLORS[1]} strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="absent" stroke={CHART_COLORS[6]} strokeWidth={2} dot={false} />
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
        <CartesianGrid strokeDasharray="3 3" stroke={a.grid} vertical={false} />
        <XAxis dataKey={xKey} tick={{ fill: a.tick, fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: a.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
        <Tooltip {...t} cursor={{ fill: a.grid, opacity: 0.4 }} />
        <Bar dataKey={dataKey} fill={color} radius={[5, 5, 0, 0]} maxBarSize={44} />
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

export function DonutChart({ data, height = 260 }: { data: { label: string; value: number }[]; height?: number }) {
  const t = TooltipStyle();
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="label" innerRadius="58%" outerRadius="82%" paddingAngle={2} stroke="none">
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip {...t} formatter={(v: number, n) => [`${v} (${Math.round((v / total) * 100)}%)`, n]} />
        <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
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

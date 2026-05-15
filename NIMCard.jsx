import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const pct = n => `${(n * 100).toFixed(2)}%`;

export default function NIMCard({ result }) {
  const { cof, spread, nim, offeredRate, festivalDiscount, inputs } = result;

  const data = [
    { name: 'Cost of Funds', value: cof  * 100, color: '#6366f1' },
    { name: 'Spread',        value: spread * 100, color: '#10b981' },
  ];
  if (festivalDiscount > 0) {
    data.push({ name: 'Festival Disc.', value: -(festivalDiscount * 100), color: '#f59e0b' });
  }

  return (
    <div className="card p-5">
      <p className="section-title">Net Interest Margin</p>

      {/* Rate waterfall */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3 text-center">
          <p className="text-xs text-indigo-600 font-medium">Cost of Funds</p>
          <p className="text-xl font-bold text-indigo-700">{pct(cof)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Fixed for all products</p>
        </div>
        <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-center">
          <p className="text-xs text-emerald-600 font-medium">Risk Spread</p>
          <p className="text-xl font-bold text-emerald-700">+{pct(spread)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Score-based pricing</p>
        </div>
        {festivalDiscount > 0 && (
          <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 text-center">
            <p className="text-xs text-amber-600 font-medium">Festival Disc.</p>
            <p className="text-xl font-bold text-amber-700">−{pct(festivalDiscount)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Auto loan promo</p>
          </div>
        )}
        <div className="rounded-lg bg-rose-50 border border-rose-100 p-3 text-center">
          <p className="text-xs text-rose-600 font-medium">NIM</p>
          <p className="text-xl font-bold text-rose-700">{pct(nim)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Rate − CoF</p>
        </div>
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center col-span-2 sm:col-span-1">
          <p className="text-xs text-slate-600 font-medium">Offered Rate</p>
          <p className="text-xl font-bold text-slate-800">{pct(offeredRate)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{result.product.label}</p>
        </div>
      </div>

      {/* Simple bar chart */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="30%">
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v.toFixed(2)}%`} />
            <Tooltip formatter={v => `${v.toFixed(3)}%`} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-xs text-muted-foreground text-center">
        CoF fixed at 5.56% · Spread determined by credit score ·{' '}
        {inputs.loanType === 'auto' ? 'Auto loan festival discount applies when enabled' : 'No promotional discount on this product'}
      </p>
    </div>
  );
}

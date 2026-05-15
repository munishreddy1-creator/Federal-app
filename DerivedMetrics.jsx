import { AlertTriangle, CheckCircle } from 'lucide-react';

const pct    = n => `${(n * 100).toFixed(2)}%`;
const money  = n => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

function MetricRow({ label, value, status, note }) {
  const color =
    status === 'good'    ? 'text-emerald-600' :
    status === 'warning' ? 'text-amber-600'   :
                           'text-red-600';
  const Icon = status === 'good' ? CheckCircle : AlertTriangle;
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {note && <p className="text-xs text-muted-foreground mt-0.5">{note}</p>}
      </div>
      <div className="flex items-center gap-1.5 shrink-0 ml-4">
        <Icon size={14} className={color} />
        <span className={`text-sm font-bold ${color}`}>{value}</span>
      </div>
    </div>
  );
}

export default function DerivedMetrics({ result }) {
  const { dti, ltv, surplus, emi, stressEmi, spendRatio, product, inputs } = result;

  const afterEmi = surplus - emi;

  const rows = [
    {
      label: 'Debt-to-Income (DTI)',
      value: pct(dti),
      status: dti <= 0.40 ? 'good' : dti <= 0.55 ? 'warning' : 'bad',
      note:  'Total EMI / Gross monthly income',
    },
    {
      label: 'Loan-to-Value (LTV)',
      value: pct(ltv),
      status: ltv <= product.ltvCap ? 'good' : ltv <= product.ltvCap * 1.05 ? 'warning' : 'bad',
      note:  `Loan ÷ Asset value  ·  Cap ${pct(product.ltvCap)}`,
    },
    {
      label: 'Spend-to-Income Ratio',
      value: pct(spendRatio),
      status: spendRatio <= 0.50 ? 'good' : spendRatio <= 0.70 ? 'warning' : 'bad',
      note:  'Monthly expenses ÷ Monthly income',
    },
    {
      label: 'Monthly Surplus',
      value: money(surplus),
      status: surplus > 0 ? 'good' : 'bad',
      note:  'Income − Expenses − Existing EMI',
    },
    {
      label: 'Proposed EMI',
      value: money(emi),
      status: emi <= surplus * 0.50 ? 'good' : emi <= surplus * 0.70 ? 'warning' : 'bad',
      note:  `At offered rate ${pct(result.offeredRate)}`,
    },
    {
      label: 'Stress EMI (+2%)',
      value: money(stressEmi),
      status: stressEmi <= surplus * 0.85 ? 'good' : 'bad',
      note:  `At stress rate ${pct(result.offeredRate + 0.02)}`,
    },
    {
      label: 'After-EMI Residual',
      value: money(afterEmi),
      status: afterEmi >= surplus * 0.15 ? 'good' : 'bad',
      note:  'Surplus remaining after proposed EMI',
    },
    {
      label: 'Borrower Age',
      value: `${inputs.age} yrs`,
      status: inputs.age <= 45 ? 'good' : inputs.age <= 55 ? 'warning' : 'bad',
      note:  'Older borrowers carry higher repayment risk',
    },
  ];

  return (
    <div className="card p-5">
      <p className="section-title">Derived Metrics</p>
      <div className="divide-y divide-border">
        {rows.map(r => <MetricRow key={r.label} {...r} />)}
      </div>
    </div>
  );
}

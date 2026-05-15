import { useEffect, useState } from 'react';
import {
  TrendingUp, Shield, DollarSign, Percent,
  CreditCard, Activity, Clock, Users,
} from 'lucide-react';

const fmt = (n, prefix = '₹') =>
  n >= 1e7 ? `${prefix}${(n / 1e7).toFixed(2)} Cr`
  : n >= 1e5 ? `${prefix}${(n / 1e5).toFixed(2)} L`
  : `${prefix}${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const pct = n => `${(n * 100).toFixed(2)}%`;

function KPICard({ icon: Icon, label, value, sub, color, delay }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`card p-4 flex flex-col gap-2 transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className={`rounded-lg p-1.5 ${color}`}>
          <Icon size={16} className="text-white" />
        </span>
      </div>
      <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default function KPICards({ result }) {
  const {
    emi, dti, ltv, surplus, creditScore,
    offeredRate, nim, maxSafeLoan, inputs,
  } = result;

  const decisionColor =
    result.decision === 'APPROVE'       ? 'text-emerald-600' :
    result.decision === 'MANUAL REVIEW' ? 'text-amber-600'   :
                                          'text-red-600';

  const kpis = [
    {
      icon: DollarSign, label: 'Monthly EMI', color: 'bg-blue-500',
      value: fmt(emi),
      sub:   `on ₹${(inputs.loanAmount / 1e5).toFixed(0)}L for ${inputs.tenure} months`,
    },
    {
      icon: Percent, label: 'Offered Rate', color: 'bg-violet-500',
      value: pct(offeredRate),
      sub:   `CoF 5.56% + Spread ${pct(result.spread)}`,
    },
    {
      icon: TrendingUp, label: 'Credit Score', color: 'bg-indigo-500',
      value: creditScore.toFixed(1),
      sub:   creditScore >= 80 ? 'Excellent' : creditScore >= 65 ? 'Good' : creditScore >= 50 ? 'Fair' : 'Poor',
    },
    {
      icon: Activity, label: 'DTI Ratio', color: dti > 0.55 ? 'bg-red-500' : dti > 0.40 ? 'bg-amber-500' : 'bg-emerald-500',
      value: pct(dti),
      sub:   dti <= 0.40 ? 'Healthy' : dti <= 0.55 ? 'Elevated' : 'High Risk',
    },
    {
      icon: Shield, label: 'LTV Ratio', color: ltv > result.product.ltvCap ? 'bg-red-500' : 'bg-teal-500',
      value: pct(ltv),
      sub:   `Cap: ${pct(result.product.ltvCap)}`,
    },
    {
      icon: DollarSign, label: 'Monthly Surplus', color: 'bg-cyan-500',
      value: fmt(surplus),
      sub:   'After expenses & existing EMI',
    },
    {
      icon: CreditCard, label: 'NIM', color: 'bg-rose-500',
      value: pct(nim),
      sub:   `Net Interest Margin (Rate − CoF)`,
    },
    {
      icon: Clock, label: 'Max Safe Loan', color: 'bg-orange-500',
      value: fmt(maxSafeLoan),
      sub:   'Based on 50% surplus rule',
    },
  ];

  return (
    <div className="space-y-3">
      {/* Decision Banner */}
      <div className={`card p-4 flex items-center gap-4 border-l-4 ${
        result.decision === 'APPROVE'       ? 'border-l-emerald-500 bg-emerald-50' :
        result.decision === 'MANUAL REVIEW' ? 'border-l-amber-500  bg-amber-50'   :
                                              'border-l-red-500    bg-red-50'
      }`}>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Underwriting Decision</p>
          <p className={`text-2xl font-extrabold ${decisionColor}`}>{result.decision}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {result.inputs.orgName} · Age {result.inputs.age} ·{' '}
            {result.inputs.employmentType === 'employed' ? 'Salaried' : 'Self-Employed'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((k, i) => (
          <KPICard key={k.label} {...k} delay={i * 60} />
        ))}
      </div>
    </div>
  );
}

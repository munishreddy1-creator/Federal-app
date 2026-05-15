import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

const money = n => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export default function RiskPanel({ result }) {
  const { riskCodes, maxSafeLoan, inputs, decision } = result;

  const loanVsMax = inputs.loanAmount / maxSafeLoan;
  const maxBarColor =
    loanVsMax <= 1   ? 'bg-emerald-500' :
    loanVsMax <= 1.2 ? 'bg-amber-500'   :
                       'bg-red-500';

  return (
    <div className="card p-5 space-y-5">
      <p className="section-title">Risk Analysis</p>

      {/* Max safe loan */}
      <div>
        <div className="flex justify-between text-sm mb-1.5">
          <span className="font-medium text-foreground">Requested vs Max Safe Loan</span>
          <span className="text-muted-foreground text-xs">{(loanVsMax * 100).toFixed(0)}%</span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${maxBarColor}`}
            style={{ width: `${Math.min(loanVsMax * 100, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Requested: <strong className="text-foreground">{money(inputs.loanAmount)}</strong></span>
          <span>Max Safe: <strong className="text-foreground">{money(maxSafeLoan)}</strong></span>
        </div>
        {inputs.loanAmount > maxSafeLoan && (
          <p className="mt-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
            Requested amount exceeds max safe loan by{' '}
            <strong>{money(inputs.loanAmount - maxSafeLoan)}</strong>.
            Consider reducing the loan or increasing income.
          </p>
        )}
      </div>

      {/* Risk reason codes */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
          <ShieldAlert size={15} /> Risk Reason Codes
        </p>
        {riskCodes.length === 0 ? (
          <div className="flex items-center gap-2 text-emerald-600 text-sm">
            <CheckCircle size={15} />
            <span>No risk flags — clean profile.</span>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {riskCodes.map((code, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <AlertTriangle size={14} className="mt-0.5 text-amber-500 shrink-0" />
                <span className="text-foreground">{code}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Age factor summary */}
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm">
        <p className="font-semibold text-slate-700 mb-1">Age &amp; Employment Summary</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-slate-600">
          <span>Age:</span>          <span className="font-medium">{inputs.age} years</span>
          <span>Employment:</span>   <span className="font-medium">
            {inputs.employmentType === 'employed' ? 'Salaried' : 'Self-Employed'}
          </span>
          <span>Organisation:</span> <span className="font-medium">{inputs.orgName}</span>
          <span>Age Risk:</span>     <span className={`font-medium ${
            inputs.age <= 35 ? 'text-emerald-600' :
            inputs.age <= 50 ? 'text-amber-600'   :
                               'text-red-600'
          }`}>
            {inputs.age <= 35 ? 'Low' : inputs.age <= 50 ? 'Moderate' : inputs.age <= 60 ? 'High' : 'Very High'}
          </span>
        </div>
      </div>
    </div>
  );
}

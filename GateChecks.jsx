import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

function GateRow({ gate }) {
  const { label, description, status, threshold } = gate;
  const cfg = {
    PASS:   { Icon: CheckCircle2, cls: 'text-emerald-600', badgeCls: 'badge-pass',   txt: 'PASS' },
    MANUAL: { Icon: AlertTriangle, cls: 'text-amber-500',  badgeCls: 'badge-manual', txt: 'MANUAL' },
    REJECT: { Icon: XCircle,       cls: 'text-red-500',    badgeCls: 'badge-reject', txt: 'REJECT' },
  }[status];

  return (
    <div className={`flex items-start gap-3 py-3 border-b border-border last:border-0`}>
      <cfg.Icon size={18} className={`mt-0.5 shrink-0 ${cfg.cls}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-foreground">{label}</span>
          <span className={cfg.badgeCls}>{cfg.txt}</span>
        </div>
        <p className="text-sm text-foreground mt-0.5">{description}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{threshold}</p>
      </div>
    </div>
  );
}

export default function GateChecks({ result }) {
  const { gates, decision } = result;
  const passCount   = gates.filter(g => g.status === 'PASS').length;
  const manualCount = gates.filter(g => g.status === 'MANUAL').length;
  const rejectCount = gates.filter(g => g.status === 'REJECT').length;

  const decisionStyle =
    decision === 'APPROVE'       ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
    decision === 'MANUAL REVIEW' ? 'bg-amber-50  border-amber-200  text-amber-700'    :
                                   'bg-red-50    border-red-200    text-red-700';

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="section-title mb-0">Gate Checks</p>
        <div className="flex gap-1.5 text-xs">
          <span className="badge-pass">{passCount} Pass</span>
          {manualCount > 0 && <span className="badge-manual">{manualCount} Manual</span>}
          {rejectCount > 0 && <span className="badge-reject">{rejectCount} Reject</span>}
        </div>
      </div>

      <div className="divide-y divide-border">
        {gates.map(g => <GateRow key={g.id} gate={g} />)}
      </div>

      <div className={`mt-4 rounded-lg border px-4 py-3 text-sm font-semibold ${decisionStyle}`}>
        Final Decision: {decision}
        {decision === 'REJECT' && (
          <span className="block text-xs font-normal mt-0.5">
            All REJECT gates must be resolved before re-submission.
          </span>
        )}
        {decision === 'MANUAL REVIEW' && (
          <span className="block text-xs font-normal mt-0.5">
            Requires senior underwriter sign-off.
          </span>
        )}
      </div>
    </div>
  );
}

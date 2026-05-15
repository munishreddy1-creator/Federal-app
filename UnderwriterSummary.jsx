import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

const pct   = n => `${(n * 100).toFixed(2)}%`;
const money = n => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

function StatusIcon({ status }) {
  if (status === 'PASS')   return <CheckCircle2 size={14} className="text-emerald-600" />;
  if (status === 'MANUAL') return <AlertTriangle size={14} className="text-amber-500" />;
  return <XCircle size={14} className="text-red-500" />;
}

export default function UnderwriterSummary() {
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('fcp_result');
    if (raw) {
      try { setResult(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, []);

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">No underwriting result found. Please run the calculator first.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          <ArrowLeft size={16} /> Back to Calculator
        </button>
      </div>
    );
  }

  const { inputs, product, cof, offeredRate, nim, spread, emi, stressEmi,
          dti, ltv, spendRatio, surplus, creditScore, maxSafeLoan,
          gates, riskCodes, decision, scoreComponents, unsecuredCount } = result;

  const decisionStyle =
    decision === 'APPROVE'       ? { bg: '#ecfdf5', border: '#10b981', text: '#065f46' } :
    decision === 'MANUAL REVIEW' ? { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' } :
                                   { bg: '#fef2f2', border: '#ef4444', text: '#7f1d1d' };

  return (
    <div className="min-h-screen bg-white">
      {/* Header / Toolbar — not printed */}
      <div className="no-print sticky top-0 z-50 bg-white border-b border-border shadow-sm px-6 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="btn-secondary text-xs py-1.5">
          <ArrowLeft size={13} /> Back
        </button>
        <span className="font-semibold text-sm">Underwriter Summary</span>
        <button onClick={() => window.print()} className="btn-primary text-xs py-1.5">
          <Printer size={13} /> Print / Save PDF
        </button>
      </div>

      {/* ── Printable report ──────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-8 py-10 space-y-6 font-sans text-sm text-gray-900">

        {/* Title block */}
        <div className="border-b-2 border-gray-800 pb-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">FederalCreditPro</h1>
            <p className="text-gray-500 text-xs mt-0.5">Retail Loan Underwriting &amp; Automated Pricing Platform</p>
          </div>
          <div className="text-right text-xs text-gray-500">
            <p>Report generated: {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
            <p>Computation: In-browser · No cloud dependency</p>
          </div>
        </div>

        {/* Decision banner */}
        <div
          className="rounded-xl border-2 px-6 py-4 flex items-center justify-between"
          style={{ background: decisionStyle.bg, borderColor: decisionStyle.border }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: decisionStyle.text }}>
              Underwriting Decision
            </p>
            <p className="text-3xl font-extrabold" style={{ color: decisionStyle.text }}>{decision}</p>
          </div>
          <div className="text-right text-xs" style={{ color: decisionStyle.text }}>
            <p className="font-semibold">{product.label}</p>
            <p>Composite Score: <strong>{creditScore.toFixed(1)} / 100</strong></p>
            <p>Unsecured Loans: <strong>{unsecuredCount}</strong></p>
          </div>
        </div>

        {/* Two-column: borrower + loan */}
        <div className="grid grid-cols-2 gap-6">

          {/* Borrower profile */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 font-semibold text-xs uppercase tracking-wider text-gray-500">
              Borrower Profile
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {[
                  ['Age',          `${inputs.age} years`],
                  ['Employment',   inputs.employmentType === 'employed' ? 'Salaried' : 'Self-Employed'],
                  ['Organisation', inputs.orgName],
                  ['Monthly Income', money(inputs.monthlyIncome)],
                  ['Monthly Expenses', money(inputs.monthlyExpenses)],
                  ['Existing EMI',  money(inputs.existingEmi)],
                  ['CIBIL Score',   inputs.cibilScore],
                  ['Prior Defaults', inputs.priorDefaults],
                  ['Liquidity Buffer', `${inputs.liquidityMonths} months`],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td className="px-4 py-1.5 text-gray-500 w-1/2">{k}</td>
                    <td className="px-4 py-1.5 font-semibold">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Loan details */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 font-semibold text-xs uppercase tracking-wider text-gray-500">
              Loan Details &amp; Pricing
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {[
                  ['Product',         product.label],
                  ['Loan Amount',     money(inputs.loanAmount)],
                  ['Asset Value',     money(inputs.propertyValue)],
                  ['Tenure',         `${inputs.tenure} months`],
                  ['Cost of Funds',   pct(cof)],
                  ['Risk Spread',     pct(spread)],
                  ['Offered Rate',    pct(offeredRate)],
                  ['NIM',             pct(nim)],
                  ['Monthly EMI',     money(emi)],
                  ['Max Safe Loan',   money(maxSafeLoan)],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td className="px-4 py-1.5 text-gray-500 w-1/2">{k}</td>
                    <td className="px-4 py-1.5 font-semibold">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key ratios */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 font-semibold text-xs uppercase tracking-wider text-gray-500">
            Key Ratios
          </div>
          <div className="grid grid-cols-4 divide-x divide-gray-100 text-center">
            {[
              ['DTI',        pct(dti),        dti > 0.40],
              ['LTV',        pct(ltv),        ltv > product.ltvCap],
              ['Spend Ratio', pct(spendRatio), spendRatio > 0.50],
              ['Surplus',    money(surplus),  surplus < 0],
            ].map(([k, v, warn]) => (
              <div key={k} className={`py-3 px-2 ${warn ? 'bg-red-50' : ''}`}>
                <p className="text-xs text-gray-400 uppercase">{k}</p>
                <p className={`font-bold text-lg ${warn ? 'text-red-600' : 'text-gray-800'}`}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Gate checks */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 font-semibold text-xs uppercase tracking-wider text-gray-500">
            Gate Checks (8 Gates)
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="px-4 py-1.5 text-left text-xs text-gray-500 font-semibold">Gate</th>
                <th className="px-4 py-1.5 text-left text-xs text-gray-500 font-semibold">Value</th>
                <th className="px-4 py-1.5 text-left text-xs text-gray-500 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {gates.map(g => (
                <tr key={g.id} className={g.status === 'REJECT' ? 'bg-red-50' : g.status === 'MANUAL' ? 'bg-amber-50' : ''}>
                  <td className="px-4 py-1.5 font-medium">{g.label}</td>
                  <td className="px-4 py-1.5 text-gray-600">{g.description}</td>
                  <td className="px-4 py-1.5">
                    <span className="flex items-center gap-1 font-semibold text-xs">
                      <StatusIcon status={g.status} />
                      {g.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Score breakdown */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 font-semibold text-xs uppercase tracking-wider text-gray-500">
            Score Breakdown — Composite: {creditScore.toFixed(2)} / 100
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="px-4 py-1.5 text-left text-xs text-gray-500">Component</th>
                <th className="px-4 py-1.5 text-right text-xs text-gray-500">Raw (0–100)</th>
                <th className="px-4 py-1.5 text-right text-xs text-gray-500">Weight</th>
                <th className="px-4 py-1.5 text-right text-xs text-gray-500">Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.entries(scoreComponents).map(([k, c]) => (
                <tr key={k}>
                  <td className="px-4 py-1.5 font-medium">{c.label}</td>
                  <td className="px-4 py-1.5 text-right">{c.raw.toFixed(0)}</td>
                  <td className="px-4 py-1.5 text-right">{(c.weight * 100).toFixed(0)}%</td>
                  <td className="px-4 py-1.5 text-right font-semibold">{(c.raw * c.weight).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-gray-300 bg-gray-50">
              <tr>
                <td colSpan={3} className="px-4 py-1.5 font-bold">Total</td>
                <td className="px-4 py-1.5 text-right font-bold">{creditScore.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Risk reason codes */}
        {riskCodes.length > 0 && (
          <div className="border border-amber-200 rounded-lg overflow-hidden">
            <div className="bg-amber-50 px-4 py-2 font-semibold text-xs uppercase tracking-wider text-amber-700">
              Risk Reason Codes
            </div>
            <ul className="px-4 py-3 space-y-1">
              {riskCodes.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <AlertTriangle size={13} className="mt-0.5 text-amber-500 shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Underwriter sign-off */}
        <div className="border border-gray-200 rounded-lg p-4 grid grid-cols-3 gap-8 mt-4">
          {['Underwriter', 'Credit Manager', 'Branch Head'].map(role => (
            <div key={role}>
              <p className="text-xs text-gray-400 mb-6">{role}</p>
              <div className="border-t border-gray-400 pt-1">
                <p className="text-xs text-gray-400">Signature &amp; Date</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 pt-2">
          This report is generated by FederalCreditPro — an in-browser underwriting tool.
          All calculations are based on inputs provided and should be verified before final sanction.
        </p>
      </div>
    </div>
  );
}

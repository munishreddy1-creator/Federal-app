import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, RefreshCw } from 'lucide-react';
import LoanInputForm   from '../components/loan/LoanInputForm.jsx';
import KPICards        from '../components/loan/KPICards.jsx';
import DerivedMetrics  from '../components/loan/DerivedMetrics.jsx';
import GateChecks      from '../components/loan/GateChecks.jsx';
import ScoreBreakdown  from '../components/loan/ScoreBreakdown.jsx';
import NIMCard         from '../components/loan/NIMCard.jsx';
import RiskPanel       from '../components/loan/RiskPanel.jsx';
import AmortizationTable from '../components/loan/AmortizationTable.jsx';
import MetricsTable    from '../components/loan/MetricsTable.jsx';
import { runLoanEngine } from '../lib/loanEngine.js';

export default function LoanCalculator() {
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(inputs) {
    setLoading(true);
    // Simulate async (engine is synchronous; defer for UX)
    setTimeout(() => {
      const r = runLoanEngine(inputs);
      setResult(r);
      localStorage.setItem('fcp_result', JSON.stringify(r));
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  }

  return (
    <div className="min-h-screen">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold text-primary leading-none">FederalCreditPro</h1>
            <p className="text-xs text-muted-foreground">Retail Loan Underwriting &amp; Pricing Platform</p>
          </div>
          <div className="flex items-center gap-2">
            {result && (
              <>
                <button
                  onClick={() => { setResult(null); window.scrollTo({ top: 0 }); }}
                  className="btn-secondary text-xs py-1.5"
                >
                  <RefreshCw size={13} /> New
                </button>
                <button
                  onClick={() => navigate('/underwriter-summary')}
                  className="btn-primary text-xs py-1.5"
                >
                  <FileText size={13} /> Underwriter Summary
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        {!result ? (
          /* ── Input panel ─────────────────────────────────────────────────── */
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">New Loan Application</h2>
              <p className="text-muted-foreground text-sm mt-1">
                All computations run locally in-browser. No data is sent to any server.
              </p>
            </div>
            <LoanInputForm onSubmit={handleSubmit} loading={loading} />
          </div>
        ) : (
          /* ── Results panel ───────────────────────────────────────────────── */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Underwriting Result</h2>
                <p className="text-sm text-muted-foreground">
                  {result.product.label} · {result.inputs.orgName} · Age {result.inputs.age}
                </p>
              </div>
            </div>

            {/* KPI Cards */}
            <KPICards result={result} />

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GateChecks      result={result} />
              <ScoreBreakdown  result={result} />
              <DerivedMetrics  result={result} />
              <RiskPanel       result={result} />
              <div className="lg:col-span-2">
                <NIMCard result={result} />
              </div>
              <div className="lg:col-span-2">
                <AmortizationTable result={result} />
              </div>
              <div className="lg:col-span-2">
                <MetricsTable result={result} />
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={() => navigate('/underwriter-summary')}
                className="btn-primary"
              >
                <FileText size={16} /> View Underwriter Summary (Printable)
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

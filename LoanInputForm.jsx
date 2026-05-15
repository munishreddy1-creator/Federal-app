import { useState } from 'react';
import { Plus, Trash2, Info } from 'lucide-react';
import { EXISTING_LOAN_TYPES } from '../../lib/loanEngine.js';

const DEFAULT_FORM = {
  // Loan details
  loanType:       'housing',
  loanAmount:     '',
  propertyValue:  '',
  tenure:         '',
  isFestivalSeason: false,

  // Personal details
  age:            '',
  employmentType: 'employed',
  orgName:        '',

  // Financial details
  monthlyIncome:    '',
  monthlyExpenses:  '',
  existingEmi:      '',

  // Credit details
  cibilScore:       '',
  priorDefaults:    '0',
  liquidityMonths:  '',

  // Existing loans
  existingLoans: [],
};

const EMPTY_LOAN = { type: 'personal', outstanding: '', emi: '' };

export default function LoanInputForm({ onSubmit, loading }) {
  const [form, setForm]   = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // ── Existing loans helpers ────────────────────────────────────────────────
  const addLoan    = () => setForm(f => ({ ...f, existingLoans: [...f.existingLoans, { ...EMPTY_LOAN }] }));
  const removeLoan = i  => setForm(f => ({ ...f, existingLoans: f.existingLoans.filter((_, idx) => idx !== i) }));
  const setLoan    = (i, key, val) =>
    setForm(f => ({ ...f, existingLoans: f.existingLoans.map((l, idx) => idx === i ? { ...l, [key]: val } : l) }));

  const loanTypeInfo = id => EXISTING_LOAN_TYPES.find(t => t.id === id);
  const unsecuredCount = form.existingLoans.filter(l => {
    const t = loanTypeInfo(l.type);
    return t && !t.secured;
  }).length;

  // ── Validation ────────────────────────────────────────────────────────────
  function validate() {
    const e = {};
    if (!form.loanAmount   || +form.loanAmount   <= 0) e.loanAmount   = 'Required';
    if (!form.propertyValue|| +form.propertyValue <= 0) e.propertyValue= 'Required';
    if (!form.tenure       || +form.tenure        <= 0) e.tenure       = 'Required';
    if (!form.age          || +form.age           <= 0) e.age          = 'Required';
    if (!form.orgName.trim())                           e.orgName      = 'Required';
    if (!form.monthlyIncome|| +form.monthlyIncome <= 0) e.monthlyIncome= 'Required';
    if (!form.monthlyExpenses || +form.monthlyExpenses < 0) e.monthlyExpenses = 'Required';
    if (!form.cibilScore   || +form.cibilScore    <= 0) e.cibilScore   = 'Required';
    if (!form.liquidityMonths || +form.liquidityMonths < 0) e.liquidityMonths = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      loanType:         form.loanType,
      loanAmount:       +form.loanAmount,
      propertyValue:    +form.propertyValue,
      tenure:           +form.tenure,
      monthlyIncome:    +form.monthlyIncome,
      monthlyExpenses:  +form.monthlyExpenses,
      existingEmi:      +(form.existingEmi || 0),
      existingLoans:    form.existingLoans,
      cibilScore:       +form.cibilScore,
      priorDefaults:    +form.priorDefaults,
      liquidityMonths:  +form.liquidityMonths,
      age:              +form.age,
      employmentType:   form.employmentType,
      orgName:          form.orgName.trim(),
      isFestivalSeason: form.isFestivalSeason,
    });
  }

  const err = key => errors[key] ? (
    <p className="mt-0.5 text-xs text-red-500">{errors[key]}</p>
  ) : null;

  const field = (label, key, type = 'number', placeholder = '') => (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        className={`input ${errors[key] ? 'border-red-400' : ''}`}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => set(key, e.target.value)}
      />
      {err(key)}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Loan Details ──────────────────────────────────────────────────── */}
      <div className="card p-5 space-y-4">
        <p className="section-title">Loan Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Loan Type</label>
            <select className="select" value={form.loanType} onChange={e => set('loanType', e.target.value)}>
              <option value="housing">Housing Loan</option>
              <option value="auto">Auto Loan</option>
              <option value="gold">Gold Loan</option>
            </select>
          </div>
          {field('Loan Amount (₹)', 'loanAmount', 'number', '5000000')}
          <div>
            <label className="label">
              {form.loanType === 'gold' ? 'Gold Value (₹)' : form.loanType === 'auto' ? 'Vehicle Value (₹)' : 'Property Value (₹)'}
            </label>
            <input
              type="number"
              className={`input ${errors.propertyValue ? 'border-red-400' : ''}`}
              placeholder="6000000"
              value={form.propertyValue}
              onChange={e => set('propertyValue', e.target.value)}
            />
            {err('propertyValue')}
          </div>
          <div>
            <label className="label">Tenure (months)</label>
            <input
              type="number"
              className={`input ${errors.tenure ? 'border-red-400' : ''}`}
              placeholder="240"
              value={form.tenure}
              onChange={e => set('tenure', e.target.value)}
            />
            {err('tenure')}
          </div>
        </div>

        {form.loanType === 'auto' && (
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              className="rounded"
              checked={form.isFestivalSeason}
              onChange={e => set('isFestivalSeason', e.target.checked)}
            />
            <span>Festival Season Discount (−0.25% on rate)</span>
          </label>
        )}
      </div>

      {/* ── Personal Details ──────────────────────────────────────────────── */}
      <div className="card p-5 space-y-4">
        <p className="section-title">Personal &amp; Employment Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div>
            <label className="label">Employment Type</label>
            <select
              className="select"
              value={form.employmentType}
              onChange={e => set('employmentType', e.target.value)}
            >
              <option value="employed">Employed (Salaried)</option>
              <option value="self_employed">Self Employed</option>
            </select>
          </div>

          <div>
            <label className="label">Organisation / Employer Name</label>
            <input
              type="text"
              className={`input ${errors.orgName ? 'border-red-400' : ''}`}
              placeholder={form.employmentType === 'self_employed' ? 'Business name' : 'Company name'}
              value={form.orgName}
              onChange={e => set('orgName', e.target.value)}
            />
            {err('orgName')}
          </div>

          <div>
            <label className="label">Age (years)</label>
            <input
              type="number"
              className={`input ${errors.age ? 'border-red-400' : ''}`}
              placeholder="35"
              min="18"
              max="75"
              value={form.age}
              onChange={e => set('age', e.target.value)}
            />
            {err('age')}
            {form.age && (
              <p className="mt-1 text-xs text-muted-foreground">
                {+form.age <= 35 ? '✓ Prime repayment age' :
                 +form.age <= 50 ? '⚠ Moderate age factor' :
                 +form.age <= 60 ? '⚠ Elevated age risk' :
                 '✗ High age risk — impacts eligibility'}
              </p>
            )}
          </div>

        </div>
      </div>

      {/* ── Financial Details ─────────────────────────────────────────────── */}
      <div className="card p-5 space-y-4">
        <p className="section-title">Financial Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('Monthly Income (₹)',   'monthlyIncome',   'number', '80000')}
          {field('Monthly Expenses (₹)', 'monthlyExpenses', 'number', '30000')}
          <div>
            <label className="label">Existing EMI Obligations (₹/mo)</label>
            <input
              type="number"
              className="input"
              placeholder="0"
              value={form.existingEmi}
              onChange={e => set('existingEmi', e.target.value)}
            />
            <p className="mt-0.5 text-xs text-muted-foreground">Total EMI of all current loans</p>
          </div>
          {field('Liquidity Buffer (months)', 'liquidityMonths', 'number', '6')}
        </div>
      </div>

      {/* ── Credit Profile ────────────────────────────────────────────────── */}
      <div className="card p-5 space-y-4">
        <p className="section-title">Credit Profile</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">CIBIL Score (300–900)</label>
            <input
              type="number"
              className={`input ${errors.cibilScore ? 'border-red-400' : ''}`}
              placeholder="750"
              min="300"
              max="900"
              value={form.cibilScore}
              onChange={e => set('cibilScore', e.target.value)}
            />
            {err('cibilScore')}
          </div>
          <div>
            <label className="label">Prior Defaults</label>
            <select className="select" value={form.priorDefaults} onChange={e => set('priorDefaults', e.target.value)}>
              <option value="0">0 — None</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3+</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Existing Loans ────────────────────────────────────────────────── */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="section-title mb-0">Existing Loans</p>
          <button type="button" onClick={addLoan} className="btn-secondary text-xs py-1.5 px-3">
            <Plus size={14} /> Add Loan
          </button>
        </div>

        {unsecuredCount >= 3 && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            <Info size={16} className="mt-0.5 shrink-0" />
            <span>
              <strong>{unsecuredCount} unsecured loans</strong> detected. 3 or more unsecured obligations
              will trigger an automatic <strong>REJECT</strong> gate.
            </span>
          </div>
        )}

        {form.existingLoans.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No existing loans added. Click "Add Loan" to declare obligations.
          </p>
        )}

        <div className="space-y-3">
          {form.existingLoans.map((loan, i) => {
            const info = loanTypeInfo(loan.type);
            return (
              <div key={i} className="rounded-lg border border-border p-3 space-y-3 bg-accent/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Loan #{i + 1}</span>
                    {info && (
                      info.secured
                        ? <span className="badge-secured">Secured</span>
                        : <span className="badge-unsecured">Unsecured</span>
                    )}
                  </div>
                  <button type="button" onClick={() => removeLoan(i)}
                    className="text-muted-foreground hover:text-red-500 transition">
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="label text-xs">Loan Type</label>
                    <select
                      className="select text-xs py-1.5"
                      value={loan.type}
                      onChange={e => setLoan(i, 'type', e.target.value)}
                    >
                      {EXISTING_LOAN_TYPES.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.label} {t.secured ? '(S)' : '(U)'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs">Outstanding (₹)</label>
                    <input
                      type="number"
                      className="input text-xs py-1.5"
                      placeholder="500000"
                      value={loan.outstanding}
                      onChange={e => setLoan(i, 'outstanding', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Monthly EMI (₹)</label>
                    <input
                      type="number"
                      className="input text-xs py-1.5"
                      placeholder="8000"
                      value={loan.emi}
                      onChange={e => setLoan(i, 'emi', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {form.existingLoans.length > 0 && (
          <div className="flex gap-4 text-xs text-muted-foreground pt-1">
            <span>Total loans: <strong className="text-foreground">{form.existingLoans.length}</strong></span>
            <span>Secured: <strong className="text-blue-600">{form.existingLoans.length - unsecuredCount}</strong></span>
            <span>Unsecured: <strong className={unsecuredCount >= 3 ? 'text-red-600' : 'text-orange-600'}>{unsecuredCount}</strong></span>
          </div>
        )}
      </div>

      {/* ── Submit ────────────────────────────────────────────────────────── */}
      <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
        {loading ? 'Calculating…' : 'Run Underwriting Engine'}
      </button>
    </form>
  );
}

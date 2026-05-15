const pct    = n => `${(n * 100).toFixed(3)}%`;
const money  = n => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export default function MetricsTable({ result }) {
  const { inputs, product, cof, offeredRate, nim, spread, emi, stressEmi,
          dti, ltv, spendRatio, surplus, creditScore, maxSafeLoan,
          unsecuredCount, festivalDiscount } = result;

  const rows = [
    { section: 'Loan Product' },
    { label: 'Product',          value: product.label },
    { label: 'Loan Amount',      value: money(inputs.loanAmount) },
    { label: 'Asset Value',      value: money(inputs.propertyValue) },
    { label: 'Tenure',           value: `${inputs.tenure} months (${(inputs.tenure / 12).toFixed(1)} yrs)` },
    { label: 'LTV Cap',          value: pct(product.ltvCap) },

    { section: 'Borrower Profile' },
    { label: 'Age',              value: `${inputs.age} years` },
    { label: 'Employment',       value: inputs.employmentType === 'employed' ? 'Salaried' : 'Self-Employed' },
    { label: 'Organisation',     value: inputs.orgName },
    { label: 'Monthly Income',   value: money(inputs.monthlyIncome) },
    { label: 'Monthly Expenses', value: money(inputs.monthlyExpenses) },
    { label: 'Existing EMI',     value: money(inputs.existingEmi) },
    { label: 'CIBIL Score',      value: inputs.cibilScore },
    { label: 'Prior Defaults',   value: inputs.priorDefaults },
    { label: 'Liquidity Buffer', value: `${inputs.liquidityMonths} months` },

    { section: 'Derived Ratios' },
    { label: 'DTI Ratio',        value: pct(dti) },
    { label: 'LTV Ratio',        value: pct(ltv) },
    { label: 'Spend Ratio',      value: pct(spendRatio) },
    { label: 'Monthly Surplus',  value: money(surplus) },
    { label: 'After-EMI Residual', value: money(surplus - emi) },

    { section: 'Pricing & NIM' },
    { label: 'Cost of Funds (CoF)', value: pct(cof) },
    { label: 'Risk Spread',         value: pct(spread) },
    { label: 'Festival Discount',   value: festivalDiscount > 0 ? `−${pct(festivalDiscount)}` : 'None' },
    { label: 'Offered Rate',        value: pct(offeredRate) },
    { label: 'NIM',                 value: pct(nim) },

    { section: 'EMI Calculations' },
    { label: 'Monthly EMI',      value: money(emi) },
    { label: 'Stress EMI (+2%)', value: money(stressEmi) },
    { label: 'Max Safe Loan',    value: money(maxSafeLoan) },

    { section: 'Portfolio Exposure' },
    { label: 'Existing Loans (total)',     value: inputs.existingLoans.length },
    { label: 'Unsecured Loan Count',       value: unsecuredCount },
    { label: 'Unsecured Gate',             value: unsecuredCount < 3 ? 'PASS' : 'REJECT' },

    { section: 'Score' },
    { label: 'Composite Credit Score', value: creditScore.toFixed(2) },
    { label: 'Decision',               value: result.decision },
  ];

  return (
    <div className="card p-5">
      <p className="section-title">Full Metrics Table</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            {rows.map((row, i) =>
              row.section ? (
                <tr key={i} className="bg-accent/50">
                  <td colSpan={2} className="py-2 px-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {row.section}
                  </td>
                </tr>
              ) : (
                <tr key={i} className="border-b border-border hover:bg-accent/30 transition-colors">
                  <td className="py-2 px-3 text-muted-foreground">{row.label}</td>
                  <td className="py-2 px-3 font-semibold text-foreground text-right">{row.value}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

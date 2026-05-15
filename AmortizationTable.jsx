const fmt = n => n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

export default function AmortizationTable({ result }) {
  const { amortization } = result;

  const totalInterest  = amortization.reduce((s, r) => s + r.interest, 0);
  const totalPrincipal = amortization.reduce((s, r) => s + r.principal, 0);

  return (
    <div className="card p-5">
      <p className="section-title">Amortisation Schedule — First 12 Months</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Month', 'EMI (₹)', 'Principal (₹)', 'Interest (₹)', 'Balance (₹)'].map(h => (
                <th key={h} className="py-2 px-2 text-right first:text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {amortization.map(row => (
              <tr key={row.month} className="hover:bg-accent/40 transition-colors">
                <td className="py-2 px-2 font-medium text-foreground">{row.month}</td>
                <td className="py-2 px-2 text-right tabular-nums">{fmt(row.emi)}</td>
                <td className="py-2 px-2 text-right tabular-nums text-blue-600">{fmt(row.principal)}</td>
                <td className="py-2 px-2 text-right tabular-nums text-rose-600">{fmt(row.interest)}</td>
                <td className="py-2 px-2 text-right tabular-nums text-muted-foreground">{fmt(row.balance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-accent/30">
              <td className="py-2 px-2 font-semibold text-sm">12-Mo Total</td>
              <td className="py-2 px-2 text-right font-semibold tabular-nums">
                {fmt(totalPrincipal + totalInterest)}
              </td>
              <td className="py-2 px-2 text-right font-semibold tabular-nums text-blue-600">{fmt(totalPrincipal)}</td>
              <td className="py-2 px-2 text-right font-semibold tabular-nums text-rose-600">{fmt(totalInterest)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Interest-to-principal ratio (12 mo): {(totalInterest / totalPrincipal * 100).toFixed(1)}%
      </p>
    </div>
  );
}

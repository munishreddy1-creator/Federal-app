export default function ScoreBreakdown({ result }) {
  const { scoreComponents, creditScore } = result;

  const gradeColor = s =>
    s >= 80 ? 'bg-emerald-500' :
    s >= 60 ? 'bg-blue-500'    :
    s >= 40 ? 'bg-amber-500'   :
              'bg-red-500';

  const gradeLabel = s =>
    s >= 80 ? 'Excellent' :
    s >= 60 ? 'Good'      :
    s >= 40 ? 'Fair'      :
              'Poor';

  const overallGrade =
    creditScore >= 80 ? { label: 'Excellent', color: 'text-emerald-600' } :
    creditScore >= 65 ? { label: 'Good',      color: 'text-blue-600'    } :
    creditScore >= 50 ? { label: 'Fair',      color: 'text-amber-600'   } :
                        { label: 'Poor',      color: 'text-red-600'     };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="section-title mb-0">Score Breakdown</p>
        <div className="text-right">
          <span className={`text-2xl font-extrabold ${overallGrade.color}`}>
            {creditScore.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground ml-1">/ 100 · {overallGrade.label}</span>
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(scoreComponents).map(([key, comp]) => {
          const weighted = comp.raw * comp.weight;
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-foreground">{comp.label}</span>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span>{(comp.weight * 100).toFixed(0)}% wt</span>
                  <span className="font-semibold text-foreground w-20 text-right">
                    {comp.raw.toFixed(0)}/100 → {weighted.toFixed(1)} pts
                  </span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${gradeColor(comp.raw)}`}
                  style={{ width: `${comp.raw}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 text-right">{gradeLabel(comp.raw)}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-border flex justify-between text-sm">
        <span className="text-muted-foreground">Weighted Total</span>
        <span className={`font-bold ${overallGrade.color}`}>
          {creditScore.toFixed(2)} / 100
        </span>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
        {[['≥80', 'Excellent', 'bg-emerald-100 text-emerald-700'],
          ['65–79', 'Good', 'bg-blue-100 text-blue-700'],
          ['50–64', 'Fair', 'bg-amber-100 text-amber-700'],
          ['<50', 'Poor', 'bg-red-100 text-red-700']].map(([r, l, c]) => (
          <div key={r} className={`rounded-lg px-1 py-1.5 ${c}`}>
            <div className="font-bold">{r}</div>
            <div>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

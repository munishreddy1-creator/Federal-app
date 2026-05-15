// ─── Loan Products — CoF fixed at 5.56% for all products ─────────────────────
export const LOAN_PRODUCTS = {
  housing: { label: 'Housing Loan', ltvCap: 0.80, cof: 0.0556, secured: true },
  auto:    { label: 'Auto Loan',    ltvCap: 0.85, cof: 0.0556, secured: true },
  gold:    { label: 'Gold Loan',    ltvCap: 0.75, cof: 0.0556, secured: true },
};

// ─── Existing loan types — gold is SECURED ────────────────────────────────────
export const EXISTING_LOAN_TYPES = [
  { id: 'housing',    label: 'Housing Loan',   secured: true  },
  { id: 'auto',       label: 'Auto Loan',       secured: true  },
  { id: 'gold',       label: 'Gold Loan',       secured: true  }, // ← secured (not unsecured)
  { id: 'personal',   label: 'Personal Loan',   secured: false },
  { id: 'creditcard', label: 'Credit Card',     secured: false },
  { id: 'business',   label: 'Business Loan',   secured: false },
];

// ─── Score weights (total = 100%) ─────────────────────────────────────────────
export const SCORE_WEIGHTS = {
  cibil:      { label: 'CIBIL Score',     weight: 0.24 },
  dti:        { label: 'DTI Ratio',       weight: 0.19 },
  ltv:        { label: 'LTV Ratio',       weight: 0.19 },
  income:     { label: 'Income',          weight: 0.10 },
  defaults:   { label: 'Prior Defaults',  weight: 0.10 },
  spendRatio: { label: 'Spend Ratio',     weight: 0.08 },
  liquidity:  { label: 'Liquidity',       weight: 0.05 },
  age:        { label: 'Age Factor',      weight: 0.03 },
  employment: { label: 'Employment Type', weight: 0.02 },
};

// ─── Individual scoring functions ─────────────────────────────────────────────
function scoreCibil(v) {
  if (v >= 800) return 100;
  if (v >= 750) return 85;
  if (v >= 700) return 70;
  if (v >= 650) return 50;
  if (v >= 600) return 25;
  return 0;
}

function scoreDti(v) {
  if (v <= 0.20) return 100;
  if (v <= 0.30) return 85;
  if (v <= 0.40) return 70;
  if (v <= 0.50) return 40;
  if (v <= 0.55) return 20;
  return 0;
}

function scoreLtv(ltv, cap) {
  const r = ltv / cap;
  if (r <= 0.70) return 100;
  if (r <= 0.80) return 85;
  if (r <= 0.90) return 70;
  if (r <= 1.00) return 50;
  if (r <= 1.05) return 20;
  return 0;
}

function scoreIncome(v) {
  if (v >= 200000) return 100;
  if (v >= 100000) return 85;
  if (v >= 50000)  return 70;
  if (v >= 25000)  return 50;
  if (v >= 15000)  return 25;
  return 0;
}

function scoreDefaults(v) {
  if (v === 0) return 100;
  if (v === 1) return 50;
  if (v === 2) return 20;
  return 0;
}

function scoreSpendRatio(v) {
  if (v <= 0.20) return 100;
  if (v <= 0.35) return 85;
  if (v <= 0.50) return 70;
  if (v <= 0.60) return 40;
  if (v <= 0.70) return 20;
  return 0;
}

function scoreLiquidity(v) {
  if (v >= 12) return 100;
  if (v >= 6)  return 80;
  if (v >= 3)  return 60;
  if (v >= 1)  return 30;
  return 0;
}

// ─── Age scoring: higher age → lower score ────────────────────────────────────
export function scoreAge(age) {
  if (age < 21)    return 0;
  if (age <= 25)   return 70;
  if (age <= 35)   return 100;
  if (age <= 45)   return 80;
  if (age <= 50)   return 60;
  if (age <= 55)   return 40;
  if (age <= 60)   return 20;
  return 5;                    // > 60 — very low score
}

// ─── Employment scoring ───────────────────────────────────────────────────────
export function scoreEmployment(type) {
  if (type === 'employed')      return 100;
  if (type === 'self_employed') return 70;
  return 50;
}

// ─── EMI formula ──────────────────────────────────────────────────────────────
export function computeEmi(principal, annualRate, tenureMonths) {
  if (!principal || !tenureMonths) return 0;
  const r = annualRate / 12;
  if (r === 0) return principal / tenureMonths;
  return (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
}

// ─── Amortisation schedule (first 12 months) ─────────────────────────────────
export function computeAmortization(principal, annualRate, tenureMonths) {
  const r = annualRate / 12;
  const emi = computeEmi(principal, annualRate, tenureMonths);
  const schedule = [];
  let balance = principal;
  for (let i = 1; i <= Math.min(12, tenureMonths); i++) {
    const interest = balance * r;
    const principalPaid = emi - interest;
    balance = Math.max(0, balance - principalPaid);
    schedule.push({ month: i, emi, principal: principalPaid, interest, balance });
  }
  return schedule;
}

// ─── Count unsecured loans in existing portfolio ──────────────────────────────
export function countUnsecuredLoans(existingLoans = []) {
  return existingLoans.filter(l => {
    const def = EXISTING_LOAN_TYPES.find(t => t.id === l.type);
    return def && !def.secured;
  }).length;
}

// ─── Main underwriting engine ─────────────────────────────────────────────────
export function runLoanEngine(inputs) {
  const {
    loanType,
    loanAmount,
    propertyValue,
    tenure,
    monthlyIncome,
    monthlyExpenses,
    existingEmi,
    existingLoans = [],
    cibilScore,
    priorDefaults,
    liquidityMonths,
    age,
    employmentType,
    isFestivalSeason,
  } = inputs;

  const product  = LOAN_PRODUCTS[loanType];
  const cof      = product.cof; // 5.56% — fixed for all products

  const ltv        = propertyValue > 0 ? loanAmount / propertyValue : 1;
  const spendRatio = monthlyIncome  > 0 ? monthlyExpenses / monthlyIncome : 1;
  const surplus    = monthlyIncome - monthlyExpenses - existingEmi;

  // ── First-pass score using a rough 12% rate to approximate DTI ───────────
  const roughEmi = computeEmi(loanAmount, 0.12, tenure);
  const roughDti = monthlyIncome > 0 ? (existingEmi + roughEmi) / monthlyIncome : 1;

  const scoreComponents = {
    cibil:      { raw: scoreCibil(cibilScore),          weight: SCORE_WEIGHTS.cibil.weight,      label: SCORE_WEIGHTS.cibil.label },
    dti:        { raw: scoreDti(roughDti),               weight: SCORE_WEIGHTS.dti.weight,         label: SCORE_WEIGHTS.dti.label },
    ltv:        { raw: scoreLtv(ltv, product.ltvCap),   weight: SCORE_WEIGHTS.ltv.weight,         label: SCORE_WEIGHTS.ltv.label },
    income:     { raw: scoreIncome(monthlyIncome),        weight: SCORE_WEIGHTS.income.weight,      label: SCORE_WEIGHTS.income.label },
    defaults:   { raw: scoreDefaults(priorDefaults),      weight: SCORE_WEIGHTS.defaults.weight,    label: SCORE_WEIGHTS.defaults.label },
    spendRatio: { raw: scoreSpendRatio(spendRatio),       weight: SCORE_WEIGHTS.spendRatio.weight,  label: SCORE_WEIGHTS.spendRatio.label },
    liquidity:  { raw: scoreLiquidity(liquidityMonths),   weight: SCORE_WEIGHTS.liquidity.weight,   label: SCORE_WEIGHTS.liquidity.label },
    age:        { raw: scoreAge(age),                     weight: SCORE_WEIGHTS.age.weight,         label: SCORE_WEIGHTS.age.label },
    employment: { raw: scoreEmployment(employmentType),   weight: SCORE_WEIGHTS.employment.weight,  label: SCORE_WEIGHTS.employment.label },
  };

  const creditScore = Object.values(scoreComponents).reduce((s, c) => s + c.raw * c.weight, 0);

  // ── Spread based on credit score ─────────────────────────────────────────
  let spread;
  if      (creditScore >= 80) spread = 0.020;
  else if (creditScore >= 65) spread = 0.030;
  else if (creditScore >= 50) spread = 0.040;
  else                         spread = 0.055;

  const festivalDiscount = loanType === 'auto' && isFestivalSeason ? 0.0025 : 0;
  const offeredRate = cof + spread - festivalDiscount;
  const nim         = offeredRate - cof;                // Net Interest Margin

  // ── Final EMIs at actual offered rate ────────────────────────────────────
  const emi       = computeEmi(loanAmount, offeredRate, tenure);
  const stressEmi = computeEmi(loanAmount, offeredRate + 0.02, tenure);
  const dti       = monthlyIncome > 0 ? (existingEmi + emi) / monthlyIncome : 1;

  // Refine DTI score with actual rate
  scoreComponents.dti.raw = scoreDti(dti);

  // ── Unsecured loan count ──────────────────────────────────────────────────
  const unsecuredCount = countUnsecuredLoans(existingLoans);

  // ── Gate checks (8 gates) ─────────────────────────────────────────────────
  const gates = [
    {
      id:          'cibil',
      label:       'CIBIL Score',
      description: `Score: ${cibilScore}`,
      status:      cibilScore >= 700 ? 'PASS' : cibilScore >= 650 ? 'MANUAL' : 'REJECT',
      threshold:   '≥700 Pass  |  650–699 Manual  |  <650 Reject',
    },
    {
      id:          'dti',
      label:       'DTI Ratio',
      description: `DTI: ${(dti * 100).toFixed(1)}%`,
      status:      dti <= 0.40 ? 'PASS' : dti <= 0.55 ? 'MANUAL' : 'REJECT',
      threshold:   '≤40% Pass  |  40–55% Manual  |  >55% Reject',
    },
    {
      id:          'ltv',
      label:       'LTV Ratio',
      description: `LTV ${(ltv * 100).toFixed(1)}% vs Cap ${(product.ltvCap * 100).toFixed(0)}%`,
      status:      ltv <= product.ltvCap ? 'PASS' : ltv <= product.ltvCap * 1.05 ? 'MANUAL' : 'REJECT',
      threshold:   'Within cap Pass  |  ≤5% over Manual  |  >5% Reject',
    },
    {
      id:          'spendRatio',
      label:       'Spend-to-Income',
      description: `Spend Ratio: ${(spendRatio * 100).toFixed(1)}%`,
      status:      spendRatio <= 0.50 ? 'PASS' : spendRatio <= 0.70 ? 'MANUAL' : 'REJECT',
      threshold:   '≤50% Pass  |  50–70% Manual  |  >70% Reject',
    },
    {
      id:          'emiAffordability',
      label:       'EMI Affordability',
      description: `EMI ₹${emi.toFixed(0)} vs 50% Surplus ₹${(surplus * 0.50).toFixed(0)}`,
      status:      emi <= surplus * 0.50 ? 'PASS' : emi <= surplus * 0.70 ? 'MANUAL' : 'REJECT',
      threshold:   'EMI ≤50% surplus Pass',
    },
    {
      id:          'stressTest',
      label:       'Stress Test (+2%)',
      description: `Stress EMI ₹${stressEmi.toFixed(0)} vs 85% Surplus ₹${(surplus * 0.85).toFixed(0)}`,
      status:      stressEmi <= surplus * 0.85 ? 'PASS' : 'REJECT',
      threshold:   'Stress EMI ≤85% surplus Pass',
    },
    {
      id:          'residualIncome',
      label:       'Residual Income',
      description: `After-EMI ₹${(surplus - emi).toFixed(0)} vs 15% Surplus ₹${(surplus * 0.15).toFixed(0)}`,
      status:      (surplus - emi) >= surplus * 0.15 ? 'PASS' : 'REJECT',
      threshold:   'After-EMI income ≥15% surplus Pass',
    },
    {
      id:          'unsecuredLoans',
      label:       'Unsecured Loan Count',
      description: `Unsecured loans on file: ${unsecuredCount}`,
      status:      unsecuredCount < 3 ? 'PASS' : 'REJECT',
      threshold:   '<3 unsecured loans Pass  |  ≥3 Reject',
    },
  ];

  const statuses = gates.map(g => g.status);
  let decision = 'APPROVE';
  if (statuses.includes('REJECT'))       decision = 'REJECT';
  else if (statuses.includes('MANUAL'))  decision = 'MANUAL REVIEW';

  // ── Risk reason codes ─────────────────────────────────────────────────────
  const riskCodes = [];
  if (cibilScore < 700)        riskCodes.push(`Low CIBIL score (${cibilScore})`);
  if (dti > 0.40)              riskCodes.push(`Elevated DTI (${(dti * 100).toFixed(1)}%)`);
  if (ltv > product.ltvCap)   riskCodes.push(`LTV exceeds product cap (${(ltv * 100).toFixed(1)}%)`);
  if (spendRatio > 0.50)       riskCodes.push(`High spend ratio (${(spendRatio * 100).toFixed(1)}%)`);
  if (priorDefaults > 0)       riskCodes.push(`Prior defaults: ${priorDefaults}`);
  if (unsecuredCount >= 3)     riskCodes.push(`Excessive unsecured obligations (${unsecuredCount})`);
  if (age > 55)                riskCodes.push(`Age-related repayment risk (${age} yrs)`);
  if (employmentType === 'self_employed') riskCodes.push('Self-employed income variability');
  if (liquidityMonths < 3)     riskCodes.push('Inadequate liquidity buffer');

  // ── Max safe loan ─────────────────────────────────────────────────────────
  const maxEmi = surplus * 0.50;
  const r      = offeredRate / 12;
  const maxSafeLoan = r > 0
    ? maxEmi * (Math.pow(1 + r, tenure) - 1) / (r * Math.pow(1 + r, tenure))
    : maxEmi * tenure;

  const amortization = computeAmortization(loanAmount, offeredRate, tenure);

  return {
    product,
    cof,
    offeredRate,
    nim,
    spread,
    festivalDiscount,
    emi,
    stressEmi,
    dti,
    ltv,
    spendRatio,
    surplus,
    creditScore,
    scoreComponents,
    gates,
    decision,
    riskCodes,
    maxSafeLoan,
    unsecuredCount,
    amortization,
    inputs,
  };
}

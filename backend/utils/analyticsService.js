function groupByMonth(transactions) {
  const buckets = {};
  for (const t of transactions) {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    buckets[key] = (buckets[key] || 0) + (t.emissionKg || 0);
  }
  return Object.entries(buckets)
    .map(([month, totalKg]) => ({ month, totalKg: Math.round(totalKg * 100) / 100 }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function forecastEmissions(transactions, goalTargetKg) {
  const monthly = groupByMonth(transactions);
  const result = { historical: monthly, projected: [], yearEndProjectionKg: 0, trend: 'insufficient_data', monthlySlopeKg: 0, goalTargetKg: goalTargetKg || null, onPaceToMeetGoal: null };

  if (monthly.length < 2) {
    result.yearEndProjectionKg = monthly.reduce((s, m) => s + m.totalKg, 0);
    return result;
  }

  const n = monthly.length;
  const indices = monthly.map((_, i) => i);
  const totals = monthly.map(m => m.totalKg);
  const sumX = indices.reduce((a, b) => a + b, 0);
  const sumY = totals.reduce((a, b) => a + b, 0);
  const sumXY = indices.reduce((s, i) => s + i * totals[i], 0);
  const sumX2 = indices.reduce((s, i) => s + i * i, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const monthlySlopeKg = Math.round(slope * 100) / 100;

  const trend = slope > 0.5 ? 'rising' : slope < -0.5 ? 'falling' : 'flat';

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const lastMonthIndex = monthly.length - 1;

  let projectedTotal = 0;
  const projected = [];
  for (let m = currentMonth + 1; m <= 11; m++) {
    const x = lastMonthIndex + (m - currentMonth);
    const predicted = Math.max(0, intercept + slope * x);
    const monthKey = `${currentYear}-${String(m + 1).padStart(2, '0')}`;
    projected.push({ month: monthKey, totalKg: Math.round(predicted * 100) / 100 });
    projectedTotal += predicted;
  }
  result.projected = projected;

  const historicalTotal = monthly.reduce((s, m) => s + m.totalKg, 0);
  const yearEndProjectionKg = Math.round((historicalTotal + projectedTotal) * 100) / 100;
  result.yearEndProjectionKg = yearEndProjectionKg;
  result.trend = trend;
  result.monthlySlopeKg = monthlySlopeKg;

  if (goalTargetKg != null) {
    result.onPaceToMeetGoal = yearEndProjectionKg <= goalTargetKg;
  }

  return result;
}

function detectAnomalies(transactions) {
  const result = { monthlyAnomalies: [], transactionAnomalies: [] };

  const monthly = groupByMonth(transactions);
  if (monthly.length >= 3) {
    const totals = monthly.map(m => m.totalKg);
    const mean = totals.reduce((s, v) => s + v, 0) / totals.length;
    const variance = totals.reduce((s, v) => s + (v - mean) ** 2, 0) / totals.length;
    const stddev = Math.sqrt(variance);
    if (stddev > 0) {
      for (const m of monthly) {
        const zScore = (m.totalKg - mean) / stddev;
        if (Math.abs(zScore) >= 2) {
          result.monthlyAnomalies.push({
            month: m.month,
            totalKg: m.totalKg,
            zScore: Math.round(zScore * 100) / 100,
            direction: zScore > 0 ? 'spike' : 'drop'
          });
        }
      }
    }
  }

  const deptGroups = {};
  for (const t of transactions) {
    const deptId = t.department ? (t.department._id || t.department).toString() : 'none';
    if (!deptGroups[deptId]) deptGroups[deptId] = { name: t.department?.name || 'Unknown', transactions: [] };
    deptGroups[deptId].transactions.push(t);
  }

  for (const deptId of Object.keys(deptGroups)) {
    const group = deptGroups[deptId];
    if (group.transactions.length < 4) continue;
    const vals = group.transactions.map(t => t.emissionKg || 0);
    const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
    const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length;
    const stddev = Math.sqrt(variance);
    if (stddev === 0) continue;
    for (const t of group.transactions) {
      const zScore = (t.emissionKg - mean) / stddev;
      if (Math.abs(zScore) >= 2.5) {
        result.transactionAnomalies.push({
          transactionId: t._id,
          name: t.name || `Transaction ${t._id}`,
          department: group.name,
          date: t.date,
          emissionKg: t.emissionKg,
          zScore: Math.round(zScore * 100) / 100,
          direction: zScore > 0 ? 'spike' : 'drop'
        });
      }
    }
  }

  return result;
}

function benchmarkDepartments(transactions) {
  const deptMap = {};
  for (const t of transactions) {
    const deptId = t.department ? (t.department._id || t.department).toString() : 'none';
    if (!deptMap[deptId]) deptMap[deptId] = { name: t.department?.name || 'Unknown', totalKg: 0, count: 0 };
    deptMap[deptId].totalKg += t.emissionKg || 0;
    deptMap[deptId].count++;
  }

  const depts = Object.values(deptMap).map(d => ({
    name: d.name,
    totalKg: Math.round(d.totalKg * 100) / 100,
    transactionCount: d.count
  }));

  const companyAverageKg = depts.length > 0
    ? Math.round((depts.reduce((s, d) => s + d.totalKg, 0) / depts.length) * 100) / 100
    : 0;

  depts.sort((a, b) => a.totalKg - b.totalKg);
  const ranked = depts.map((d, i) => ({
    ...d,
    rank: i + 1,
    variancePct: companyAverageKg > 0
      ? Math.round(((d.totalKg - companyAverageKg) / companyAverageKg) * 1000) / 10
      : 0
  }));

  return { companyAverageKg, departments: ranked };
}

module.exports = { groupByMonth, forecastEmissions, detectAnomalies, benchmarkDepartments };

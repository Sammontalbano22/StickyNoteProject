import React from 'react';
import Chart from 'chart.js/auto';

// Configuration for each finance template
const templateConfigs = {
  'Savings Goal': {
    name: 'Goal Name',
    target: 'Target Amount ($)',
    current: 'Current Saved ($)',
    progress: 'Progress:',
    extra: ({ goalName, setGoalName, target, setTarget, current, setCurrent }) => (
      <>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontWeight: 600, color: '#b35c00' }}>Why are you saving?</label>
          <input
            type="text"
            placeholder="e.g. For a summer trip, new laptop, etc."
            style={{ width: '100%', fontSize: 15, borderRadius: 6, border: '1px solid #ccc', padding: '5px 10px', marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontWeight: 600, color: '#b35c00' }}>Deadline (optional):</label>
          <input type="date" style={{ fontSize: 15, borderRadius: 6, border: '1px solid #ccc', padding: '5px 10px', marginTop: 4 }} />
        </div>
      </>
    )
  },
  'Emergency Fund': {
    name: 'Fund Name',
    target: 'Target Fund ($)',
    current: 'Current Saved ($)',
    progress: 'Progress:',
    extra: ({ target, setTarget }) => (
      <div style={{ marginBottom: 8 }}>
        <label style={{ fontWeight: 600, color: '#b35c00' }}>Months of expenses covered:</label>
        <input type="number" min="1" placeholder="e.g. 3" style={{ width: 80, fontSize: 15, borderRadius: 6, border: '1px solid #ccc', padding: '5px 10px', marginLeft: 8 }} />
      </div>
    )
  },
  'Budgeting': {
    name: 'Budget Name',
    target: 'Monthly Budget ($)',
    current: 'Spent So Far ($)',
    progress: 'Budget Used:',
    extra: ({ goalName, setGoalName, target, setTarget, current, setCurrent }) => {
      // New state for long-term goal, timeframe, notes, expenses, AI, and milestones
      const [longTermGoal, setLongTermGoal] = React.useState('');
      const [timeframe, setTimeframe] = React.useState('');
      const [notes, setNotes] = React.useState('');
      const [expense, setExpense] = React.useState('');
      const [expenseList, setExpenseList] = React.useState([]);
      const [aiAdvice, setAiAdvice] = React.useState('');
      const [milestones, setMilestones] = React.useState([]);
      const [loading, setLoading] = React.useState(false);
      const [error, setError] = React.useState('');
      // Calculate total spent for long-term
      const totalSpent = expenseList.reduce((sum, e) => sum + Number(e.amount), Number(current) || 0);
      // Add expense to log
      const addExpense = () => {
        if (!expense || isNaN(expense) || Number(expense) <= 0) return;
        setExpenseList([...expenseList, { amount: expense, date: new Date().toLocaleDateString() }]);
        setCurrent(String((Number(current) || 0) + Number(expense)));
        setExpense('');
      };
      // Remove expense
      const removeExpense = idx => {
        const removed = expenseList[idx];
        setExpenseList(expenseList.filter((_, i) => i !== idx));
        setCurrent(String((Number(current) || 0) - Number(removed.amount)));
      };
      // Get AI suggestions for milestones
      async function getBudgetAdvice() {
        setLoading(true);
        setError('');
        setAiAdvice('');
        setMilestones([]);
        try {
          const res = await fetch('/api/ai/budget-milestones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              goalName,
              monthlyBudget: target,
              spent: totalSpent,
              longTermGoal,
              timeframe,
              notes,
              expenses: expenseList
            })
          });
          let data;
          try {
            data = await res.json();
          } catch (jsonErr) {
            setError('Server error: Invalid JSON response.');
            setLoading(false);
            return;
          }
          if (!res.ok) {
            setError(data.error ? `Server error: ${data.error}${data.details ? ' - ' + data.details : ''}` : 'AI service error');
            setLoading(false);
            return;
          }
          setAiAdvice(data.advice || data.result || 'No advice returned.');
          if (data.milestones) setMilestones(data.milestones);
        } catch (e) {
          setError('Could not get suggestions. ' + (e.message || ''));
        } finally {
          setLoading(false);
        }
      }
      // Progress for long-term goal
      const longTermProgress = longTermGoal && !isNaN(longTermGoal) ? Math.min(100, Math.round((totalSpent / Number(longTermGoal)) * 100)) : 0;
      return (
        <>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontWeight: 600, color: '#b35c00' }}>Long-term Goal ($):</label>
            <input type="number" min="1" value={longTermGoal} onChange={e => setLongTermGoal(e.target.value)} placeholder="e.g. 5000" style={{ width: 120, fontSize: 15, borderRadius: 6, border: '1px solid #ccc', padding: '5px 10px', marginLeft: 8 }} />
            <label style={{ fontWeight: 600, color: '#b35c00', marginLeft: 16 }}>Timeframe (months):</label>
            <input type="number" min="1" value={timeframe} onChange={e => setTimeframe(e.target.value)} placeholder="e.g. 12" style={{ width: 60, fontSize: 15, borderRadius: 6, border: '1px solid #ccc', padding: '5px 10px', marginLeft: 8 }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontWeight: 600, color: '#b35c00' }}>Notes:</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Save for vacation, reduce eating out..." style={{ width: '60%', fontSize: 15, borderRadius: 6, border: '1px solid #ccc', padding: '5px 10px', marginLeft: 8 }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontWeight: 600, color: '#b35c00' }}>Add Expense ($):</label>
            <input type="number" min="0.01" step="0.01" value={expense} onChange={e => setExpense(e.target.value)} style={{ width: 90, fontSize: 15, borderRadius: 6, border: '1px solid #ccc', padding: '5px 10px', marginLeft: 8 }} />
            <button onClick={addExpense} style={{ marginLeft: 8, background: '#44bba4', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 14px', fontWeight: 600, cursor: 'pointer' }}>Add</button>
          </div>
          {expenseList.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <b>Expense Log:</b>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {expenseList.map((e, i) => (
                  <li key={i} style={{ fontSize: 14, marginBottom: 2 }}>
                    ${e.amount} on {e.date} <button onClick={() => removeExpense(i)} style={{ marginLeft: 6, color: '#b35c00', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>x</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div style={{ marginBottom: 8 }}>
            <button onClick={getBudgetAdvice} disabled={loading} style={{ background: '#44bba4', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, cursor: loading ? 'wait' : 'pointer' }}>
              {loading ? 'Getting Suggestions...' : 'Get Milestone Suggestions'}
            </button>
          </div>
          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
          {aiAdvice && (
            <div style={{ background: '#e1bee7', borderRadius: 8, padding: 10, color: '#4d2600', fontSize: 15, marginBottom: 8 }}>
              <b>AI Suggestions:</b><br />
              <span>{aiAdvice}</span>
            </div>
          )}
          {milestones.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <b>Milestones:</b>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {milestones.map((m, i) => (
                  <li key={i} style={{ fontSize: 14, marginBottom: 2 }}>{m}</li>
                ))}
              </ul>
            </div>
          )}
          {longTermGoal && !isNaN(longTermGoal) && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontWeight: 600, color: '#b35c00', marginBottom: 4 }}>Long-term Progress:</div>
              <div style={{ background: '#b3e5fc', borderRadius: 8, height: 18, width: '100%', position: 'relative', overflow: 'hidden', boxShadow: '0 2px 8px #b3e5fc55' }}>
                <div style={{
                  width: `${longTermProgress}%`,
                  background: 'linear-gradient(90deg, #44bba4 60%, #b3e5fc 100%)',
                  height: '100%',
                  borderRadius: 8,
                  transition: 'width 0.4s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  fontWeight: 700,
                  color: '#fff',
                  fontSize: 13,
                  paddingRight: 8,
                  boxShadow: '0 2px 8px #44bba455',
                }}>
                  {`${longTermProgress}%`}
                </div>
              </div>
            </div>
          )}
        </>
      );
    }
  },
  'Investment': {
    name: 'Investment Name',
    target: 'Target Value ($)',
    current: 'Current Value ($)',
    progress: 'Progress:',
    extra: ({}) => (
      <>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontWeight: 600, color: '#b35c00' }}>Type:</label>
          <select style={{ fontSize: 15, borderRadius: 6, border: '1px solid #ccc', padding: '5px 10px', marginLeft: 8 }}>
            <option>Stock</option>
            <option>ETF</option>
            <option>Mutual Fund</option>
            <option>Crypto</option>
            <option>Real Estate</option>
            <option>Other</option>
          </select>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontWeight: 600, color: '#b35c00' }}>Risk Level:</label>
          <select style={{ fontSize: 15, borderRadius: 6, border: '1px solid #ccc', padding: '5px 10px', marginLeft: 8 }}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
      </>
    )
  },
  'Debt Payoff': {
    name: 'Debt Name',
    target: 'Total Debt ($)',
    current: 'Paid Off ($)',
    progress: 'Paid Off:',
    extra: ({ target, setTarget, current, setCurrent }) => {
      const [interest, setInterest] = React.useState('');
      const [minPayment, setMinPayment] = React.useState('');
      const [months, setMonths] = React.useState('');
      const [aiResult, setAiResult] = React.useState(null);
      const [aiPlan, setAiPlan] = React.useState(null); // Store plan for chart
      const [loading, setLoading] = React.useState(false);
      const [error, setError] = React.useState('');
      const chartRef = React.useRef(null);
      const chartInstance = React.useRef(null);

      // Helper to call AI for payoff plan
      async function getPayoffPlan() {
        setLoading(true);
        setError('');
        setAiResult(null);
        setAiPlan(null);
        try {
          const res = await fetch('/api/ai/debt-payoff', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              total: target,
              paid: current,
              interest,
              minPayment,
              months
            })
          });
          let data;
          try {
            data = await res.json();
          } catch (jsonErr) {
            setError('Server error: Invalid JSON response.');
            setLoading(false);
            return;
          }
          if (!res.ok) {
            setError(data.error ? `Server error: ${data.error}${data.details ? ' - ' + data.details : ''}` : 'AI service error');
            setLoading(false);
            return;
          }
          setAiResult(data.result || data.choices?.[0]?.text || 'No advice returned.');
          if (data.plan) {
            setAiPlan(data.plan);
            // Actually update sticky note fields with the payment plan
            if (data.plan.payment) setMinPayment(data.plan.payment);
            if (data.plan.months) setMonths(data.plan.months);
            // Set the target to the original debt and current to 0 (reset progress for new plan)
            if (target) setTarget(target);
            if (setCurrent) setCurrent(0);
          }
        } catch (e) {
          setError('Could not get payoff plan. ' + (e.message || ''));
        } finally {
          setLoading(false);
        }
      }

      // Draw chart when aiPlan changes
      React.useEffect(() => {
        if (aiPlan && chartRef.current) {
          if (chartInstance.current) chartInstance.current.destroy();
          chartInstance.current = new Chart(chartRef.current, {
            type: 'line',
            data: {
              labels: aiPlan.balances?.map((_, i) => `Month ${i+1}`),
              datasets: [{
                label: 'Debt Balance',
                data: aiPlan.balances,
                borderColor: '#44bba4',
                backgroundColor: 'rgba(68,187,164,0.1)',
                tension: 0.2,
                fill: true
              }]
            },
            options: {
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } }
            }
          });
        }
        return () => { if (chartInstance.current) chartInstance.current.destroy(); };
      }, [aiPlan]);

      // Simple payoff math
      let payoffMonths = '';
      let payoffTotal = '';
      if (target && minPayment && interest) {
        const P = Number(target) - Number(current || 0);
        const r = Number(interest) / 100 / 12;
        const m = Number(minPayment);
        if (P > 0 && r > 0 && m > 0) {
          const n = Math.log(m / (m - P * r)) / Math.log(1 + r);
          payoffMonths = n > 0 ? Math.ceil(n) : '';
          payoffTotal = payoffMonths ? (payoffMonths * m).toFixed(2) : '';
        }
      }

      return (
        <>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontWeight: 600, color: '#b35c00' }}>Interest Rate (%):</label>
            <input type="number" min="0" max="100" step="0.01" value={interest} onChange={e => setInterest(e.target.value)} placeholder="e.g. 4.5" style={{ width: 100, fontSize: 15, borderRadius: 6, border: '1px solid #ccc', padding: '5px 10px', marginLeft: 8 }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontWeight: 600, color: '#b35c00' }}>Minimum Payment ($):</label>
            <input type="number" min="0" value={minPayment} onChange={e => setMinPayment(e.target.value)} placeholder="e.g. 150" style={{ width: 100, fontSize: 15, borderRadius: 6, border: '1px solid #ccc', padding: '5px 10px', marginLeft: 8 }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontWeight: 600, color: '#b35c00' }}>Want to pay off in (months)?</label>
            <input type="number" min="1" value={months} onChange={e => setMonths(e.target.value)} placeholder="Optional" style={{ width: 80, fontSize: 15, borderRadius: 6, border: '1px solid #ccc', padding: '5px 10px', marginLeft: 8 }} />
          </div>
          {payoffMonths && (
            <div style={{ marginBottom: 8, color: '#388e3c', fontWeight: 600 }}>
              <span>Estimated months to pay off: <b>{payoffMonths}</b></span><br />
              <span>Total paid (with interest): <b>${payoffTotal}</b></span>
            </div>
          )}
          <div style={{ marginBottom: 8 }}>
            <button onClick={getPayoffPlan} disabled={loading || !target || !minPayment || !interest} style={{ background: '#44bba4', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, cursor: loading ? 'wait' : 'pointer' }}>
              {loading ? 'Getting AI Plan...' : 'Get AI Payoff Plan'}
            </button>
          </div>
          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
          {aiResult && (
            <div style={{ background: '#e1bee7', borderRadius: 8, padding: 10, color: '#4d2600', fontSize: 15, marginBottom: 8 }}>
              <b>AI Payoff Advice:</b><br />
              <span>{aiResult}</span>
            </div>
          )}
          {aiPlan && aiPlan.balances && (
            <div style={{ marginBottom: 8 }}>
              <b>Payment Plan Graph:</b>
              <canvas ref={chartRef} width={320} height={120} style={{ display: 'block', margin: '10px 0', background: '#fffbe8', borderRadius: 8, border: '1px solid #f4a261' }} />
            </div>
          )}
        </>
      );
    }
  },
  'Retirement': {
    name: 'Retirement Account',
    target: 'Target Value ($)',
    current: 'Current Value ($)',
    progress: 'Progress:',
    extra: ({}) => (
      <>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontWeight: 600, color: '#b35c00' }}>Account Type:</label>
          <select style={{ fontSize: 15, borderRadius: 6, border: '1px solid #ccc', padding: '5px 10px', marginLeft: 8 }}>
            <option>401(k)</option>
            <option>IRA</option>
            <option>Roth IRA</option>
            <option>403(b)</option>
            <option>Other</option>
          </select>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontWeight: 600, color: '#b35c00' }}>Employer Match?</label>
          <select style={{ fontSize: 15, borderRadius: 6, border: '1px solid #ccc', padding: '5px 10px', marginLeft: 8 }}>
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>
      </>
    )
  },
  'Other': {
    name: 'Finance Note',
    extra: () => (
      <div style={{ marginBottom: 8 }}>
        <label style={{ fontWeight: 600, color: '#b35c00' }}>Details:</label>
        <textarea placeholder="Describe your custom finance goal or note..." style={{ width: '100%', fontSize: 15, borderRadius: 6, border: '1px solid #ccc', padding: '7px 10px', marginTop: 4 }} rows={2} />
      </div>
    )
  }
};

// Handles all finance-related templates for StickyNotePad
const FinanceNoteTemplate = ({
  template,
  setTemplate,
  goalName,
  setGoalName,
  target,
  setTarget,
  current,
  setCurrent
}) => {
  const config = templateConfigs[template] || templateConfigs['Other'];

  // Helper for progress calculation
  const getProgress = () => {
    if (!target || isNaN(target)) return 0;
    return Math.min(100, Math.round((Number(current) || 0) / Number(target) * 100));
  };

  return (
    <div style={{ width: '100%', marginBottom: 12, background: '#fffbe8', borderRadius: 10, padding: 12, border: '1.5px solid #f4a261' }}>
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontWeight: 600, color: '#b35c00', marginRight: 8 }}>Template:</label>
        <select value={template} onChange={e => setTemplate(e.target.value)} style={{ fontSize: 16, borderRadius: 6, border: '1px solid #ccc', padding: '4px 10px' }}>
          {Object.keys(templateConfigs).map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ fontWeight: 600, color: '#b35c00' }}>{config.name}:</label>
        <input
          type="text"
          value={goalName}
          onChange={e => setGoalName(e.target.value)}
          placeholder={template === 'Other' ? 'e.g. Custom Finance Goal' : `e.g. ${config.name}`}
          style={{ width: '100%', fontSize: 16, borderRadius: 6, border: '1px solid #ccc', padding: '6px 10px', marginTop: 4 }}
        />
      </div>
      {config.target && (
        <div style={{ marginBottom: 8, display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 600, color: '#b35c00' }}>{config.target}:</label>
            <input
              type="number"
              min="1"
              value={target}
              onChange={e => setTarget(e.target.value)}
              placeholder={`e.g. ${template === 'Budgeting' ? '400' : '500'}`}
              style={{ width: '100%', fontSize: 16, borderRadius: 6, border: '1px solid #ccc', padding: '6px 10px', marginTop: 4 }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 600, color: '#b35c00' }}>{config.current}:</label>
            <input
              type="number"
              min="0"
              value={current}
              onChange={e => setCurrent(e.target.value)}
              placeholder={`e.g. ${template === 'Budgeting' ? '120' : '120'}`}
              style={{ width: '100%', fontSize: 16, borderRadius: 6, border: '1px solid #ccc', padding: '6px 10px', marginTop: 4 }}
            />
          </div>
        </div>
      )}
      {config.extra && config.extra({ goalName, setGoalName, target, setTarget, current, setCurrent })}
      {config.progress && target && !isNaN(target) && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontWeight: 600, color: '#b35c00', marginBottom: 4 }}>{config.progress}</div>
          <div style={{ background: '#ffd1dc', borderRadius: 8, height: 22, width: '100%', position: 'relative', overflow: 'hidden', boxShadow: '0 2px 8px #ffd1dc55' }}>
            <div style={{
              width: `${getProgress()}%`,
              background: template === 'Budgeting' ? 'linear-gradient(90deg, #e57373 60%, #ffd1dc 100%)' : 'linear-gradient(90deg, #44bba4 60%, #b3e5fc 100%)',
              height: '100%',
              borderRadius: 8,
              transition: 'width 0.4s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              fontWeight: 700,
              color: '#fff',
              fontSize: 15,
              paddingRight: 10,
              boxShadow: '0 2px 8px #44bba455',
            }}>
              {`${getProgress()}%`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceNoteTemplate;

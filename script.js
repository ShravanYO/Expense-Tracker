// ========= DATA STORE =========
const CAT_ICONS = {
  food:'🍜', rent:'🏠', transport:'🚗', health:'💊',
  entertainment:'🎬', shopping:'🛍', income:'💰', other:'📦'
};

let currentUser = null;
let currentType = 'expense';
let currentFilter = 'all';
let currentMonth = new Date().getMonth();
let currentYear  = new Date().getFullYear();
let chartMode = 'donut';
let mainChart = null;

function getData() {
  return JSON.parse(localStorage.getItem('obsidian_data') || '{"users":{},"transactions":{}}');
}
function saveData(d) {
  localStorage.setItem('obsidian_data', JSON.stringify(d));
}

// ========= AUTH =========
function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((t,i) => t.classList.toggle('active', (tab==='login'&&i===0)||(tab==='register'&&i===1)));
  document.getElementById('login-form').style.display    = tab==='login'    ? 'flex' : 'none';
  document.getElementById('register-form').style.display = tab==='register' ? 'flex' : 'none';
}

function doLogin() {
  const u = document.getElementById('login-user').value.trim();
  const p = document.getElementById('login-pass').value;
  const d = getData();
  if (!d.users[u] || d.users[u].password !== p) {
    showAuthError('login-error', 'Invalid username or password.');
    return;
  }
  currentUser = u;
  enterApp();
}

function doRegister() {
  const name   = document.getElementById('reg-name').value.trim();
  const u      = document.getElementById('reg-user').value.trim();
  const p      = document.getElementById('reg-pass').value;
  const budget = parseFloat(document.getElementById('reg-budget').value) || 30000;
  const d = getData();
  if (!name||!u||p.length<4) { showAuthError('reg-error','Please fill all fields (password min 4 chars).'); return; }
  if (d.users[u]) { showAuthError('reg-error','Username already taken.'); return; }
  d.users[u] = { name, password: p, budget };
  if (!d.transactions[u]) d.transactions[u] = [];
  saveData(d);
  currentUser = u;
  enterApp();
}

function showAuthError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg; el.style.display = 'block';
  setTimeout(() => el.style.display='none', 3000);
}

function enterApp() {
  document.getElementById('auth-screen').style.display='none';
  document.getElementById('app').style.display='block';
  const d = getData();
  const name = d.users[currentUser].name;
  document.getElementById('user-display').textContent = name;
  document.getElementById('user-avatar').textContent  = name.charAt(0).toUpperCase();
  document.getElementById('f-date').value = new Date().toISOString().split('T')[0];
  currentMonth = new Date().getMonth();
  currentYear  = new Date().getFullYear();
  renderAll();
}

function doLogout() {
  currentUser = null;
  document.getElementById('app').style.display='none';
  document.getElementById('auth-screen').style.display='flex';
  document.getElementById('login-user').value='';
  document.getElementById('login-pass').value='';
}

// ========= TRANSACTIONS =========
function getTransactions() {
  const d = getData();
  return d.transactions[currentUser] || [];
}

function saveTransactions(txns) {
  const d = getData();
  d.transactions[currentUser] = txns;
  saveData(d);
}

function monthKey(t) {
  const dt = new Date(t.date);
  return { m: dt.getMonth(), y: dt.getFullYear() };
}

function filteredByMonth() {
  return getTransactions().filter(t => {
    const k = monthKey(t);
    return k.m === currentMonth && k.y === currentYear;
  });
}

function addTransaction() {
  const name   = document.getElementById('f-name').value.trim();
  const amount = parseFloat(document.getElementById('f-amount').value);
  const date   = document.getElementById('f-date').value;
  const cat    = document.getElementById('f-category').value;

  if (!name || !amount || !date || amount<=0) {
    showToast('Please fill all fields correctly.','error'); return;
  }

  const txns = getTransactions();
  txns.unshift({
    id: Date.now()+'', name, amount, date, category: cat, type: currentType
  });
  saveTransactions(txns);
  document.getElementById('f-name').value='';
  document.getElementById('f-amount').value='';
  showToast('Transaction added ✓');
  renderAll();
}

function deleteTransaction(id) {
  const txns = getTransactions().filter(t => t.id !== id);
  saveTransactions(txns);
  showToast('Removed.');
  renderAll();
}

// ========= BUDGET =========
function openBudgetModal() {
  const d = getData();
  document.getElementById('budget-input').value = d.users[currentUser].budget || '';
  document.getElementById('budget-modal').classList.add('open');
}
function closeBudgetModal() {
  document.getElementById('budget-modal').classList.remove('open');
}
function saveBudget() {
  const val = parseFloat(document.getElementById('budget-input').value);
  if (!val||val<=0) { showToast('Enter valid amount.','error'); return; }
  const d = getData();
  d.users[currentUser].budget = val;
  saveData(d);
  closeBudgetModal();
  showToast('Budget updated ✓');
  renderAll();
}

// ========= RENDER =========
function renderAll() {
  updateMonthLabel();
  updateStats();
  renderList();
  renderChart();
}

function updateMonthLabel() {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('month-label').textContent = `${months[currentMonth]} ${currentYear}`;
}

function updateStats() {
  const txns = filteredByMonth();
  const income  = txns.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
  const expense = txns.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
  const balance = income - expense;
  const d = getData();
  const budget = d.users[currentUser]?.budget || 0;
  const pct = budget>0 ? Math.min((expense/budget)*100,999) : 0;

  document.getElementById('stat-balance').textContent = fmt(balance);
  document.getElementById('stat-income').textContent  = fmt(income);
  document.getElementById('stat-spent').textContent   = fmt(expense);
  document.getElementById('stat-txn-count').textContent = `${txns.length} transaction${txns.length!==1?'s':''}`;
  document.getElementById('stat-income-count').textContent = `${txns.filter(t=>t.type==='income').length} entr${txns.filter(t=>t.type==='income').length!==1?'ies':'y'}`;
  document.getElementById('stat-spent-count').textContent  = `${txns.filter(t=>t.type==='expense').length} entr${txns.filter(t=>t.type==='expense').length!==1?'ies':'y'}`;
  document.getElementById('stat-budget-pct').textContent   = budget>0 ? `${Math.round(pct)}%` : '—';
  document.getElementById('stat-budget-info').textContent  = budget>0 ? `of ${fmt(budget)} limit` : 'No budget set';

  const bar = document.getElementById('budget-bar');
  bar.style.width = Math.min(pct,100)+'%';
  bar.className = 'budget-bar-fill' + (pct>100?' over':pct>75?' warn':'');
}

function renderList() {
  const txns = filteredByMonth().filter(t => currentFilter==='all' || t.type===currentFilter);
  const el = document.getElementById('expense-list');
  if (!txns.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">◈</div><div>No transactions found.</div></div>`;
    return;
  }
  el.innerHTML = txns.map(t => `
    <div class="expense-item">
      <div class="expense-icon">${CAT_ICONS[t.category]||'📦'}</div>
      <div>
        <div class="expense-name">${esc(t.name)}</div>
        <div class="expense-meta">${fmtDate(t.date)}</div>
      </div>
      <div><span class="cat-badge cat-${t.category}">${t.category}</span></div>
      <div class="expense-amount ${t.type==='expense'?'neg':'pos'}">
        ${t.type==='expense'?'−':'+'}${fmt(t.amount)}
      </div>
      <button class="btn-delete" onclick="deleteTransaction('${t.id}')">✕</button>
    </div>
  `).join('');
}

function renderChart() {
  const txns = filteredByMonth();
  if (mainChart) { mainChart.destroy(); mainChart=null; }
  const ctx = document.getElementById('main-chart').getContext('2d');

  Chart.defaults.color = 'rgba(232,230,224,0.5)';
  Chart.defaults.font.family = "'DM Mono', monospace";
  Chart.defaults.font.size = 11;

  if (chartMode==='donut') {
    const expenses = txns.filter(t=>t.type==='expense');
    const cats = {};
    expenses.forEach(t => { cats[t.category]=(cats[t.category]||0)+t.amount; });
    const labels = Object.keys(cats);
    const values = Object.values(cats);
    const colors = {
      food:'#e0935c', rent:'#9b7ee8', transport:'#5c9de0',
      health:'#5cba8a', entertainment:'#c9a84c',
      shopping:'#5cb8ba', income:'#5cba8a', other:'rgba(232,230,224,0.3)'
    };
    mainChart = new Chart(ctx, {
      type:'doughnut',
      data: {
        labels: labels.length ? labels : ['No data'],
        datasets:[{
          data: values.length ? values : [1],
          backgroundColor: labels.length ? labels.map(l=>colors[l]||'#555') : ['rgba(255,255,255,0.05)'],
          borderColor: 'transparent',
          borderWidth:0,
          hoverOffset:6
        }]
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        cutout:'68%',
        plugins:{
          legend:{ position:'right', labels:{ boxWidth:10, padding:14 } },
          tooltip:{
            callbacks:{ label: ctx => ` ${ctx.label}: ${fmt(ctx.raw)}` }
          }
        }
      }
    });
  } else {
    // last 6 months bar
    const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const allTxns = getTransactions();
    const labels=[]; const incomes=[]; const expenses=[];
    for(let i=5;i>=0;i--) {
      let m=currentMonth-i, y=currentYear;
      if(m<0){m+=12;y--;}
      labels.push(months[m]+" '"+String(y).slice(2));
      const slice = allTxns.filter(t=>{const k=monthKey(t);return k.m===m&&k.y===y;});
      incomes.push(slice.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0));
      expenses.push(slice.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0));
    }
    mainChart = new Chart(ctx, {
      type:'bar',
      data:{
        labels,
        datasets:[
          { label:'Income',  data:incomes,  backgroundColor:'rgba(92,186,138,0.5)',  borderColor:'#5cba8a',borderWidth:1 },
          { label:'Expense', data:expenses, backgroundColor:'rgba(224,92,92,0.4)',   borderColor:'#e05c5c',borderWidth:1 }
        ]
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ labels:{ boxWidth:10, padding:14 } },
                  tooltip:{ callbacks:{ label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.raw)}` } } },
        scales:{
          x:{ grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'rgba(232,230,224,0.4)'} },
          y:{ grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'rgba(232,230,224,0.4)',callback:v=>'₹'+v.toLocaleString()} }
        }
      }
    });
  }
}

// ========= UI CONTROLS =========
function setType(type) {
  currentType = type;
  document.getElementById('btn-expense').className='type-btn'+(type==='expense'?' active-expense':'');
  document.getElementById('btn-income').className='type-btn'+(type==='income'?' active-income':'');
  const catSel = document.getElementById('f-category');
  if (type==='income') catSel.value='income';
}

function setFilter(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderList();
}

function switchChart(mode) {
  chartMode = mode;
  document.querySelectorAll('.chart-tab').forEach((t,i)=>t.classList.toggle('active',(mode==='donut'&&i===0)||(mode==='bar'&&i===1)));
  renderChart();
}

function changeMonth(delta) {
  currentMonth += delta;
  if (currentMonth>11){currentMonth=0;currentYear++;}
  if (currentMonth<0) {currentMonth=11;currentYear--;}
  renderAll();
}

// ========= UTILS =========
function fmt(n) { return '₹'+Math.abs(n).toLocaleString('en-IN',{minimumFractionDigits:0,maximumFractionDigits:0}); }
function fmtDate(s) { return new Date(s).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}); }
function esc(s) { const d=document.createElement('div');d.textContent=s;return d.innerHTML; }

function showToast(msg, type='') {
  const t=document.createElement('div');
  t.className='toast'+(type?' '+type:'');
  t.textContent=msg;
  document.body.appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; t.style.transition='opacity 0.4s'; setTimeout(()=>t.remove(),400); },2000);
}

// keyboard enter submit
document.addEventListener('keydown', e => {
  if(e.key==='Enter'){
    if(document.getElementById('login-form').style.display!=='none' && document.getElementById('app').style.display==='none') doLogin();
  }
});

// close modal on overlay click
document.getElementById('budget-modal').addEventListener('click', function(e){
  if(e.target===this) closeBudgetModal();
});

// init date
document.getElementById('f-date').value = new Date().toISOString().split('T')[0];
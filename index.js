
let table = document.getElementById('table');
let totalMoney = 0;
let totalSpend = 0;
let balance = 0;
let transactions = [];

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const mode = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  localStorage.setItem('theme', mode);
  document.getElementById('theme-toggle').innerText = mode === 'light' ? 'Dark' : 'Light';
};

// On page load
window.onload = function () {
  // Load theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    document.getElementById('theme-toggle').innerText = 'Light';
  }
  
  // Load transactions
  transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  transactions.forEach(renderTransaction);
  updateTotals();
};

function handleClick() {
  let date = document.getElementsByClassName('date')[0].value;
  let amount = parseFloat(document.getElementsByClassName('amount')[0].value);
  let category = document.getElementsByClassName('category')[0].value;
  let value = document.getElementsByClassName('value')[0].value;
  
  if (!date || isNaN(amount) || !value || value === "Transaction type" || category === "Category") {
    alert('Please fill all fields with valid values');
    return;
  }

  const transaction = {
    id: Date.now(),
    date: date,
    amount: amount,
    type: value,
    category: category
  };
  
  transactions.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderTransaction(transaction);
  updateTotals();
  
  // Clear form fields
  document.getElementsByClassName('date')[0].value = '';
  document.getElementsByClassName('amount')[0].value = '';
  document.getElementsByClassName('value')[0].value = 'Transaction type';
  document.getElementsByClassName('category')[0].value = 'Category';
}

function renderTransaction(transaction) {
  let row = document.createElement('tr');
  row.dataset.id = transaction.id;
  
  let col1 = document.createElement('td');
  col1.innerText = transaction.amount;

  let col2 = document.createElement('td');
  col2.innerText = transaction.type;

  let colCategory = document.createElement('td');
  colCategory.innerText = transaction.category;

  let col3 = document.createElement('td');
  col3.innerText = transaction.date;

  let col4 = document.createElement('td');
  const svgHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" class="bi bi-trash3-fill" viewBox="0 0 16 16">
      <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 
      11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 
      3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 
      6.5 0h3A1.5 1.5 0 0 1 11 
      1.5m-5 0v1h4v-1a.5.5 0 0 
      0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 
      5.029l.5 8.5a.5.5 0 1 
      0 .998-.06l-.5-8.5a.5.5 0 1 
      0-.998.06m6.53-.528a.5.5 0 0 
      0-.528.47l-.5 8.5a.5.5 0 0 0 
      .998.058l.5-8.5a.5.5 0 0 
      0-.47-.528M8 4.5a.5.5 0 0 
      0-.5.5v8.5a.5.5 0 0 0 1 
      0V5a.5.5 0 0 0-.5-.5"/>
    </svg>
  `;
  
  const btn = document.createElement('button');
  btn.className = 'btn btn-sm';
  btn.innerHTML = svgHTML;
  btn.onclick = function() {
    table.removeChild(row);
    transactions = transactions.filter(t => t.id !== transaction.id);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    updateTotals();
  };

  col4.appendChild(btn);
  row.appendChild(col1);
  row.appendChild(col2);
  row.appendChild(colCategory);
  row.appendChild(col3);
  row.appendChild(col4);
  table.appendChild(row);
}

function updateTotals() {
  totalMoney = 0;
  totalSpend = 0;

  transactions.forEach(t => {
    if (t.type === "income") {
      totalMoney += t.amount;
    } else {
      totalSpend += t.amount;
    }
  });

  balance = totalMoney - totalSpend;
  document.getElementById('income').innerText = totalMoney;
  document.getElementById('expense').innerText = totalSpend;
  document.getElementById('balance').innerText = balance;
}

function filterTransactions(type) {
  // Clear existing rows (preserve header)
  const headerRow = table.querySelector('thead tr') || table.rows[0];
  table.innerHTML = '';
  if (headerRow) table.appendChild(headerRow);

  // Filter transactions
  const filteredTransactions = type === 'all' 
    ? transactions 
    : transactions.filter(tx => tx.type === type);

  // Render filtered transactions
  filteredTransactions.forEach(renderTransaction);
  updateFilteredTotals(filteredTransactions);
}

function updateFilteredTotals(filteredTransactions) {
  let filteredMoney = 0;
  let filteredSpend = 0;

  filteredTransactions.forEach(t => {
    if (t.type === "income") {
      filteredMoney += t.amount;
    } else {
      filteredSpend += t.amount;
    }
  });

  document.getElementById('income').innerText = filteredMoney;
  document.getElementById('expense').innerText = filteredSpend;
  document.getElementById('balance').innerText = filteredMoney - filteredSpend;
}

function filterByDate() {
  let start = document.getElementById('start-date').value;
  let end = document.getElementById('end-date').value;

  // If no dates selected, show all transactions
  if (!start && !end) {
    const headerRow = table.querySelector('thead tr') || table.rows[0];
    table.innerHTML = '';
    if (headerRow) table.appendChild(headerRow);
    
    transactions.forEach(renderTransaction);
    updateTotals();
    return;
  }

  // Check if only one date is selected
  if (!start || !end) {
    alert('Please select both start and end dates or clear both to show all');
    return;
  }

  // Clear table (preserve header)
  const headerRow = table.querySelector('thead tr') || table.rows[0];
  table.innerHTML = '';
  if (headerRow) table.appendChild(headerRow);

  // Filter and display transactions
  const filtered = transactions.filter(t => {
    const transDate = new Date(t.date);
    const startDate = new Date(start);
    const endDate = new Date(end);
    return transDate >= startDate && transDate <= endDate;
  });

  filtered.forEach(renderTransaction);
  updateFilteredTotals(filtered);
}

function exportCSV() {
  let rows = [["Amount", "Transaction Type", "Transaction Date"]]; // header

  // Loop through table rows, skip the header (rowIndex 0)
  for (let i = 1; i < table.rows.length; i++) {
    const cols = table.rows[i].cells;
    const amount = cols[0].innerText;
    const type = cols[1].innerText;
    const date = cols[2].innerText;

    rows.push([amount, type, date]);
  }

  // Convert to CSV format
  let csvContent = rows.map(e => e.join(",")).join("\n");

  // Create downloadable blob
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  // Create and click a temporary download link
  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}


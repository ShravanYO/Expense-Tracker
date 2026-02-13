# 💎 Obsidian — Expense Tracker

> A refined, elegant personal finance tracker with a dark aesthetic. Built with pure HTML, CSS, and JavaScript — no frameworks, no dependencies (except Chart.js for graphs).

---

## ✨ Features

- **Multi-user authentication** — register and login with separate data per user
- **Add & delete transactions** — track both expenses and income
- **Category tagging** — Food, Rent, Transport, Health, Entertainment, Shopping & more
- **Budget limits** — set a monthly budget with a live progress bar (warns at 75%, alerts when over)
- **Charts & analytics** — donut chart by category + 6-month income vs expense bar chart
- **Monthly summary** — net balance, total income, total spent, budget usage
- **Month navigation** — browse through past and future months
- **Persistent storage** — all data saved locally via `localStorage`

---

## 🛠 Tech Stack

| Layer      | Technology          |
|------------|---------------------|
| Structure  | HTML5               |
| Styling    | CSS3 (custom properties, grid, animations) |
| Logic      | Vanilla JavaScript (ES6+) |
| Charts     | [Chart.js 4.4](https://www.chartjs.org/) |
| Fonts      | Google Fonts (Cormorant Garamond, DM Mono, Syne) |

---

## 🚀 Getting Started

No installation or build step needed.

```bash
git clone https://github.com/your-username/obsidian-expense-tracker.git
cd obsidian-expense-tracker
```

Then just open `index.html` in your browser. That's it!

---

## 📁 Project Structure

```
obsidian-expense-tracker/
├── index.html     # App structure & markup
├── style.css      # Dark theme styling & animations
└── script.js      # Auth, transactions, charts & logic
```

---

## 📸 Preview

> Dark, gold-accented UI with smooth animations, category badges, and interactive charts.

---

## 📌 Notes

- Data is stored in the browser's `localStorage` — no backend required
- Amounts are displayed in Indian Rupees (₹), easily customizable in `script.js`
- Works fully offline

---

## 📄 License

MIT — free to use, modify, and distribute.

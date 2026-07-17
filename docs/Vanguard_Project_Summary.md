# Vanguard.AI (Formerly Vanguard) - Project Summary

## What is this project? (The Motive)
Vanguard.AI is an **Agentic Insider Threat Detection Platform**. 
Usually, banks focus on stopping hackers from breaking in from the *outside*. But what happens if a bank employee (an *insider*) goes rogue and starts stealing or snooping on customer data? 
Vanguard.AI solves this problem. It acts as an autonomous security guard that constantly monitors bank employees, uses Machine Learning to detect if they are acting suspiciously, and uses an AI Agent to instantly lock their account before they can steal data.

We also built a **Client Transparency Portal**. This is a dashboard for the actual bank customers, showing them exactly who accessed their data, proving to them that the bank is protecting their privacy.

---

## How it Works (The Flow)

1. **The Telemetry Engine (Math & ML):**
   The system constantly watches employees and calculates a "Risk Score" out of 100 based on 4 math vectors (Isolation Forest Telemetry):
   - **Hour:** Are they logging in at 3 AM?
   - **Data Sensitivity:** Are they looking at VIP accounts?
   - **Action Velocity:** Are they downloading 500 files per second?
   - **Geo Risk:** Are they logging in from a strange country?

2. **The LangGraph AI Agent (The Brain):**
   If an employee's Risk Score gets too high, a human admin (CISO) clicks "Review". 
   Instead of the human having to read boring logs, our **Multi-Agent AI** kicks in:
   - It reads the employee's logs.
   - It cross-references their actions against standard hacking techniques (MITRE ATT&CK Framework).
   - It writes a beautifully formatted, easy-to-read Markdown report for the admin.

3. **The Autonomous SOAR (The Weapon):**
   If the AI determines the employee is definitely stealing data or snooping, the AI makes a decision entirely on its own: it fires the `suspend_account` weapon. 
   It instantly locks the employee out of the database in real-time.

---

## The 3 Main Dashboards (The Features)

### 1. Landing Page (`http://localhost:5173/`)
A cinematic, animated introduction to Vanguard.AI. It features smooth "Framer Motion" animations and sets a premium, enterprise-grade tone.

### 2. The SOC Dashboard (For Bank Admins)
This is the command center where security admins watch the bank.
- **Top KPIs:** Shows Active Decoys, Anomalous Sessions, and Zero-Trust Drift.
- **Threat Vector Donut Chart:** A dynamic chart showing the split between "Data Access" threats (snooping) and "Data Export" threats (stealing).
- **Live Telemetry Feed:** A list of all employees. Employees with high Risk Scores turn flashing red. Clicking "Review" on a red employee opens their specific Intelligence Portal.

### 3. The Intelligence Portal (The Deep Dive)
When you click on a suspicious employee, you are taken here.
- **AI Investigation:** Click the purple "Initiate AI Investigation" button to watch the LangGraph AI generate a report and autonomously lock the user's account.
- **Isolation Forest Telemetry:** Shows the exact math metrics (Hour, Velocity, etc.) that triggered the alarm.
- **MITRE ATT&CK Matrix:** Shows exactly what hacking techniques the employee is using.

### 4. Client Transparency Portal (`http://localhost:5173/client-portal`)
This is for the *customer* (e.g., Mukesh Ambani). 
- **Dynamic Data:** It pulls their real balance and transactions from the backend database.
- **QPC Badge:** Features a "Quantum-Proof Cryptography" badge to show extreme security.
- **Data Privacy Audit:** The coolest feature! It shows a live log of every bank employee who looked at this customer's account. If Vanguard.AI caught a rogue employee snooping, the customer sees a red "BLOCKED" badge, proving the AI successfully defended them.

---

## Why This Project is Incredible
1. **Multi-Agent AI:** It doesn't just use ChatGPT to generate text. It uses LangGraph to give the AI "tools" (like the ability to suspend accounts) so the AI can take real action.
2. **Dynamic Full-Stack:** Everything is connected. The frontend (React), backend (Node/Express), AI server (Python/Flask), and Database (SQLite) all talk to each other in real-time.
3. **Cinematic UI:** Thanks to `framer-motion`, Recharts, and Tailwind CSS, the project looks like a multi-million dollar enterprise software product.

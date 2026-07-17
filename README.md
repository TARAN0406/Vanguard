<div align="center">
  <img src="assets/screenshots/logo_placeholder.png" alt="Project Logo" width="150"/>
  <h1>🛡️ Vanguard: Zero-Trust Insider Threat Portal</h1>
  <p><strong>FinSpark'26 Hackathon Submission | Bank of Maharashtra</strong></p>
  <p><em>Tackling Problem Statement 1: Privileged Access Misuse & Insider Threat Detection</em></p>
</div>

---

## 🎯 The Problem
Insider threats pose one of the most severe risks to banking infrastructure today. From employees and contractors to system administrators acting maliciously or negligently, identifying unauthorized privileged access is critical to maintaining data integrity. 

## 💡 Our Solution
**Vanguard** is a next-generation, Zero-Trust insider threat detection portal designed specifically for modern banking systems. 

We correlate cybersecurity telemetry with behavioral analytics to detect anomalous employee activities in real-time. By leveraging simulated honeypots, dynamic risk-scoring algorithms, and strict role-based access monitoring, Vanguard acts as the ultimate sentinel for financial data.

### ✨ Key Features
- **🚨 Dynamic Risk Scoring:** Every employee is assigned a real-time risk score (1-100) based on their actions, login times, file access, and network anomalies.
- **🍯 Active Decoy Triggers (Honeypots):** We strategically deploy fake sensitive documents (e.g., `VIP_Client_List_Q3.pdf`). If a user attempts to access these, they are instantly flagged.
- **🧠 Behavioral Analytics & Contextual Telemetry:** Deep dive into specific employee actions. Our portal provides explainable insights into *why* a user's behavior was flagged as anomalous.
- **⚡ Autonomous SOAR Action:** High-confidence threats trigger immediate account suspension and network containment.
- **🔒 Quantum-Proof Cryptography (QPC) Validation:** The Client Portal ensures that sensitive artifacts are signed and validated using CRYSTALS-Kyber.
- **🌗 USWDS-Inspired Accessibility:** A highly professional, government-grade UI with full Light/Dark mode support for security analysts.

## 🛠️ Technology Stack
- **Frontend:** React 19, Vite, Tailwind CSS v3.4 (USWDS Color Palette), Recharts, Framer Motion
- **Backend:** Node.js, Express, TensorFlow.js (Neural Scoring Engine), SQLite/In-Memory State
- **Icons & Graphics:** Lucide React

## 🚀 Quick Start
Please refer to the [Setup Guide](docs/SETUP.md) for detailed instructions on running the full stack locally.

## 📚 Documentation
- [Architecture & Design Decisions](docs/ARCHITECTURE.md)
- [Project Setup](docs/SETUP.md)
- [Vanguard Project Summary (Original Specs)](docs/Vanguard_Project_Summary.md)

---
*Built with ❤️ for FinSpark'26*

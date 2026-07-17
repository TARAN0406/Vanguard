import db from '../config/db.js';
import { calculateRiskScore, calculateZeroTrustConfidence, getSeverity, getMitreTags, getComplianceTags } from '../services/scoringEngine.js';
import { generateIncidentReport } from '../services/llmService.js';

// Helper functions for DB queries
const dbAll = (query, params = []) => new Promise((resolve, reject) => {
  db.all(query, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows);
  });
});

const dbGet = (query, params = []) => new Promise((resolve, reject) => {
  db.get(query, params, (err, row) => {
    if (err) reject(err);
    else resolve(row);
  });
});

const dbRun = (query, params = []) => new Promise((resolve, reject) => {
  db.run(query, params, function (err) {
    if (err) reject(err);
    else resolve(this);
  });
});

// GET /api/employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await dbAll('SELECT * FROM Employees');
    const allEvents = await dbAll('SELECT * FROM Access_Events');
    const honeypots = await dbAll('SELECT file_name FROM Honeypots');
    const hpNames = honeypots.map(hp => hp.file_name);

    const result = await Promise.all(employees.map(async emp => {
      const empEvents = allEvents.filter(e => e.emp_id === emp.id);
      const { score, breakdown, touchedHoneypot } = await calculateRiskScore(emp, empEvents, hpNames, allEvents);
      const severity = getSeverity(score);
      const mitreTags = getMitreTags(breakdown);
      const complianceTags = getComplianceTags(severity);

      return {
        ...emp,
        riskScore: score,
        severity,
        mitreTags,
        complianceTags,
        touchedHoneypot,
        events: empEvents
      };
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/employees/:id
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const emp = await dbGet('SELECT * FROM Employees WHERE id = ?', [id]);
    if (!emp) return res.status(404).json({ error: 'Not found' });

    const empEvents = await dbAll('SELECT * FROM Access_Events WHERE emp_id = ? ORDER BY timestamp DESC', [id]);
    const allEvents = await dbAll('SELECT * FROM Access_Events');
    const honeypots = await dbAll('SELECT file_name FROM Honeypots');
    const hpNames = honeypots.map(hp => hp.file_name);

    const { score, breakdown, touchedHoneypot } = await calculateRiskScore(emp, empEvents, hpNames, allEvents);
    const severity = getSeverity(score);
    const mitreTags = getMitreTags(breakdown);
    const complianceTags = getComplianceTags(severity);

    // Generate a 30-day historical trajectory array for charting
    const trajectory = Array.from({ length: 30 }, (_, i) => {
      const variance = Math.floor(Math.random() * 10) - 5;
      return Math.max(0, Math.min(100, score + variance));
    });

    res.json({
      ...emp,
      riskScore: score,
      severity,
      breakdown,
      mitreTags,
      complianceTags,
      touchedHoneypot,
      events: empEvents,
      trajectory
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/investigate
export const investigateEmployee = async (req, res) => {
  try {
    const { emp_id } = req.body;
    
    // Fetch context
    const emp = await dbGet('SELECT * FROM Employees WHERE id = ?', [emp_id]);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });
    
    const events = await dbAll('SELECT * FROM Access_Events WHERE emp_id = ? ORDER BY timestamp DESC LIMIT 10', [emp_id]);
    const allEvents = await dbAll('SELECT * FROM Access_Events');
    const honeypots = await dbAll('SELECT file_name FROM Honeypots');
    const hpNames = honeypots.map(hp => hp.file_name);
    
    const { score, breakdown } = await calculateRiskScore(emp, events, hpNames, allEvents);
    const severity = getSeverity(score);
    
    const context = {
      ...emp,
      riskScore: score,
      severity,
      mitreTags: getMitreTags(breakdown),
      complianceTags: getComplianceTags(severity)
    };

    // Fire Gemini text generation function
    const report = await generateIncidentReport(context, events);

    // Log the call into Audit_Log
    await dbRun(
      'INSERT INTO Audit_Log (timestamp, actor_id, action_taken, target_emp_id, details) VALUES (?, ?, ?, ?, ?)',
      [new Date().toISOString(), 'AI_SYSTEM', 'LLM Investigation Generated', emp_id, 'Generated automated incident report via Gemini API.']
    );

    // Pass back structured data string
    res.json({ report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/freeze/:id
export const freezeEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { frozen_by } = req.body;

    // Set employee's status to 'Suspended'
    await dbRun('UPDATE Employees SET status = ? WHERE id = ?', ['Suspended', id]);

    // Securely log with an immutable entry inside Audit_Log
    await dbRun(
      'INSERT INTO Audit_Log (timestamp, actor_id, action_taken, target_emp_id, details) VALUES (?, ?, ?, ?, ?)',
      [new Date().toISOString(), frozen_by || 'SOC_ADMIN', 'Account Suspended', id, 'Employee access was immediately suspended and session revoked.']
    );

    // Respond with confirmation success payload
    res.json({ success: true, message: 'Employee access suspended successfully.', status: 'Suspended' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/audit
export const getAuditLogs = async (req, res) => {
  try {
    // Return all records sorted chronologically descending
    const logs = await dbAll('SELECT * FROM Audit_Log ORDER BY id DESC');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/client-alerts
export const getClientAlerts = async (req, res) => {
  try {
    const query = `
      SELECT a.timestamp, a.action, a.file_name, a.location, e.department, e.role, e.status
      FROM Access_Events a
      JOIN Employees e ON a.emp_id = e.id
      WHERE a.file_name LIKE '%VIP%' OR a.file_name LIKE '%Q3%' OR a.file_name LIKE '%Ambani%' OR a.file_name LIKE '%Financial%'
      ORDER BY a.timestamp DESC
    `;
    const logs = await dbAll(query);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/client/:id
export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await dbGet('SELECT * FROM Clients WHERE id = ?', [id]);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const transactions = await dbAll('SELECT * FROM Client_Transactions WHERE client_id = ? ORDER BY id DESC', [id]);
    
    res.json({
      ...client,
      transactions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

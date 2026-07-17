/**
 * VANGUARD Scoring & Intelligence Engine - ENSEMBLE ARCHITECTURE
 */
import { IsolationForest } from 'isolation-forest';
import * as tf from '@tensorflow/tfjs';

// MITRE ATT&CK Mapping
const MITRE_MAP = {
  night_login: "Initial Access (T1078)",
  bulk_export: "Exfiltration (T1052)",
  unknown_location: "Lateral Movement (T1081)",
  structural_anomaly: "Privilege Escalation (T1548)",
  impossible_travel: "Valid Accounts (T1078)",
  data_staging: "Data Staging (T1074)",
  malicious_insider_chain: "Data Exfiltration (T1048)",
  super_user_snooping: "Valid Accounts: Local Accounts (T1078.003)",
  maker_checker_bypass: "Valid Accounts: Default Accounts (T1078.001)",
  orphaned_privileges: "Privilege Escalation (T1548)",
  swift_anomaly: "Exfiltration Over Alternative Protocol (T1048)",
  collusion_detected: "Lateral Movement: Collusion (TA0008)",
  flight_risk: "Disgruntled Employee (Flight Risk)",
  performance_warning: "Performance Warning (PIP)"
};

const COMPLIANCE_MAP = {
  CRITICAL: [
    "RBI CSF 2016 — Sec 4.2 Privileged Access Management",
    "RBI Master Direction IT 2023",
    "CERT-In: Mandatory Reporting (6 hours)"
  ],
  ALERT: ["RBI Master Direction IT 2023"],
  WATCH: ["RBI Master Direction IT 2023"],
  NORMAL: []
};

export const getSeverity = (score) => {
  if (score >= 76) return "CRITICAL";
  if (score >= 51) return "ALERT";
  if (score >= 31) return "WATCH";
  return "NORMAL";
};

export const getMitreTags = (breakdown) => {
  const tags = new Set();
  for (const signal of Object.keys(breakdown)) {
    if (MITRE_MAP[signal]) tags.add(MITRE_MAP[signal]);
  }
  return Array.from(tags);
};

export const getComplianceTags = (severity) => {
  return COMPLIANCE_MAP[severity] || [];
};

/**
 * ---------------------------------------------------------
 * DATA PRE-PROCESSING
 * ---------------------------------------------------------
 * Convert an event into a numerical feature vector
 */
const vectorizeEvent = (event) => {
  const isOffHours = event.is_off_hours ? 1 : 0;
  
  let actionWeight = 0;
  if (event.action === 'Bulk_Export') actionWeight = 10;
  else if (event.action === 'VPN_Login' || event.action === 'USB_Connection') actionWeight = 8;
  else if (event.action === 'File_Access') actionWeight = 2;
  
  let locationWeight = 0;
  if (event.location && event.location.includes('Unknown')) locationWeight = 10;

  return [isOffHours, actionWeight, locationWeight];
};

/**
 * ---------------------------------------------------------
 * LAYER 1: STATISTICAL RULES (THE FAST FILTER)
 * ---------------------------------------------------------
 * Calculates Z-Score of the employee's event frequency compared to the global baseline.
 */
const calculateStatisticalScore = (employeeEvents, allEvents) => {
  if (!allEvents.length || !employeeEvents.length) return 0;

  // Group events by employee ID
  const eventCounts = {};
  for (const ev of allEvents) {
    eventCounts[ev.emp_id] = (eventCounts[ev.emp_id] || 0) + 1;
  }

  const counts = Object.values(eventCounts);
  const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
  const variance = counts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / counts.length;
  const stdDev = Math.sqrt(variance) || 1; // Prevent div by 0

  const empCount = employeeEvents.length;
  const zScore = (empCount - mean) / stdDev;

  // Normalize Z-Score to a 0-1 risk score (assuming Z > 2 is highly anomalous)
  const normalizedStatScore = Math.max(0, Math.min(zScore / 3, 1));
  return normalizedStatScore;
};

/**
 * ---------------------------------------------------------
 * LAYER 2: ISOLATION FOREST (THE ANOMALY HUNTER)
 * ---------------------------------------------------------
 */
const calculateForestScore = (employeeEvents, allEvents, breakdown) => {
  let maxAnomaly = 0;
  if (allEvents.length > 0 && employeeEvents.length > 0) {
    const trainingData = allEvents.map(vectorizeEvent);
    const model = new IsolationForest();
    model.fit(trainingData);
    const allScores = model.scores(); // Array of scores matching allEvents index
    
    for (const event of employeeEvents) {
      const globalIndex = allEvents.findIndex(e => e.id === event.id);
      if (globalIndex !== -1) {
        const anomalyScore = allScores[globalIndex]; 
        if (anomalyScore > maxAnomaly) {
          maxAnomaly = anomalyScore;
          // Map features to MITRE tags
          if (event.is_off_hours) breakdown.night_login = true;
          if (event.action === 'Bulk_Export') breakdown.bulk_export = true;
          if (event.location && event.location.includes('Unknown')) breakdown.unknown_location = true;
          if (event.action === 'VPN_Login' || event.action === 'USB_Connection') breakdown.structural_anomaly = true;
        }
      }
    }
  }
  return maxAnomaly;
};

/**
 * ---------------------------------------------------------
 * LAYER 3: LSTM AUTOENCODER (THE DEEP PROFILER)
 * ---------------------------------------------------------
 * Uses TensorFlow.js to find sequential/temporal anomalies.
 */
const calculateNeuralScore = async (employeeEvents, allEvents) => {
  if (employeeEvents.length < 2 || allEvents.length < 2) return 0;

  try {
    // 1. Prepare Sequences (Timesteps = 1, Features = 3)
    const empData = employeeEvents.map(vectorizeEvent);
    const globalData = allEvents.map(vectorizeEvent);

    const xTrain = tf.tensor3d(globalData.map(d => [d]), [globalData.length, 1, 3]);
    const xTest = tf.tensor3d(empData.map(d => [d]), [empData.length, 1, 3]);

    // 2. Build LSTM Autoencoder Architecture
    const model = tf.sequential();
    
    // Encoder
    model.add(tf.layers.flatten({ inputShape: [1, 3] }));
    model.add(tf.layers.dense({ units: 4, activation: 'relu' }));
    
    // Decoder
    model.add(tf.layers.dense({ units: 3, activation: 'linear' }));
    model.add(tf.layers.reshape({ targetShape: [1, 3] }));

    model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

    // 3. Train the model on global baseline (Fast 5 epochs for hackathon demo)
    await model.fit(xTrain, xTrain, { epochs: 5, verbose: 0 });

    // 4. Predict and calculate Reconstruction Error for this employee
    const reconstructed = model.predict(xTest);
    
    // Calculate Mean Squared Error between input and reconstruction
    const mse = tf.losses.meanSquaredError(xTest, reconstructed).arraySync();
    
    // Cleanup Tensors
    tf.dispose([xTrain, xTest, reconstructed]);

    // 5. Normalize MSE to a 0-1 risk score
    // An MSE of > 5.0 is highly abnormal in this normalized feature space
    const normalizedNeuralScore = Math.max(0, Math.min(mse / 10.0, 1));
    return normalizedNeuralScore;
  } catch (err) {
    console.error("Neural Score Error:", err);
    return 0; // Fallback to 0 if tensor shape is weird
  }
};

/**
 * ---------------------------------------------------------
 * CORRELATION ENGINE (DETERMINISTIC RULES)
 * ---------------------------------------------------------
 */
const evaluateCorrelationRules = (employee, employeeEvents, allEvents = []) => {
  let ruleTriggered = false;
  const breakdown = {};
  
  if (!employeeEvents || employeeEvents.length === 0) return { ruleTriggered, breakdown };

  const isITAdmin = employee && employee.role === 'IT Admin';
  const isNonFinance = employee && ['HR', 'IT Support', 'Marketing'].includes(employee.department);

  for (const event of employeeEvents) {
    // Rule 4: Super-User Snooping (IT Admin accessing VIP files)
    if (isITAdmin && event.file_name && event.file_name.includes('VIP_Client_List')) {
      ruleTriggered = true;
      breakdown.super_user_snooping = true;
    }

    // Rule 5: Orphaned Privileges (Non-Finance accessing Finance data)
    if (isNonFinance && event.file_name && (event.file_name.includes('Loan') || event.file_name.includes('Financial'))) {
      ruleTriggered = true;
      breakdown.orphaned_privileges = true;
    }

    // Rule 6: Maker-Checker Bypass (Same IP, different users, wire transfer approval)
    if (event.action === 'Transaction_Approval') {
      const suspiciousMaker = allEvents.find(e => 
        e.action === 'Transaction_Initiation' && 
        e.emp_id !== employee.id && 
        e.device_ip === event.device_ip &&
        Math.abs(new Date(e.timestamp) - new Date(event.timestamp)) < 10 * 60000 // within 10 mins
      );
      if (suspiciousMaker) {
        ruleTriggered = true;
        breakdown.maker_checker_bypass = true;
      }
    }

    // Rule 7: SWIFT Cross-Border Telemetry Anomaly
    if (event.action === 'SWIFT_Wire_Transfer' && (event.location.includes('Offshore') || event.location.includes('Unknown'))) {
      ruleTriggered = true;
      breakdown.swift_anomaly = true;
    }

    // Rule 8: Collusion Detection (Same sensitive file accessed by different users within 15 minutes)
    if (event.file_name && (event.file_name.includes('VIP') || event.file_name.includes('Confidential') || event.file_name.includes('Report'))) {
      const colludingUser = allEvents.find(e => 
        e.emp_id !== employee.id &&
        e.file_name === event.file_name &&
        Math.abs(new Date(e.timestamp) - new Date(event.timestamp)) < 15 * 60000 // 15 mins diff
      );
      if (colludingUser) {
        ruleTriggered = true;
        breakdown.collusion_detected = true;
      }
    }
  }

  if (employeeEvents.length < 2) return { ruleTriggered, breakdown };

  // Sort events chronologically to evaluate sequences
  const sortedEvents = [...employeeEvents].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  for (let i = 0; i < sortedEvents.length - 1; i++) {
    const current = sortedEvents[i];
    const next = sortedEvents[i + 1];
    
    // Time difference in minutes
    const diffMinutes = (new Date(next.timestamp) - new Date(current.timestamp)) / 60000;

    // Rule 1: Impossible Travel (Different locations in under 60 mins)
    if (current.location && next.location && 
        current.location !== next.location && 
        !current.location.includes('Unknown') && 
        !next.location.includes('Unknown') && 
        diffMinutes < 60) {
      ruleTriggered = true;
      breakdown.impossible_travel = true;
    }

    // Rule 2: Data Staging & Exfiltration Chain
    if (current.action === 'File_Access' && next.action === 'Bulk_Export' && diffMinutes < 120) {
      ruleTriggered = true;
      breakdown.data_staging = true;
    }

    // Rule 3: Malicious After-Hours Chain
    if (current.is_off_hours && (current.action === 'Bulk_Export' || next.action === 'Bulk_Export')) {
      ruleTriggered = true;
      breakdown.malicious_insider_chain = true;
    }
  }

  return { ruleTriggered, breakdown };
};

/**
 * ---------------------------------------------------------
 * SCORING AGGREGATOR (ENSEMBLE COMBINER)
 * ---------------------------------------------------------
 */
export const calculateRiskScore = async (employee, employeeEvents, honeypotFileNames = [], allEvents = []) => {
  let score = 0;
  let breakdown = {};
  let touchedHoneypot = false;

  // 1. Get Sub-Scores from ML Layers
  const statScore = calculateStatisticalScore(employeeEvents, allEvents);
  const forestScore = calculateForestScore(employeeEvents, allEvents, breakdown);
  const neuralScore = await calculateNeuralScore(employeeEvents, allEvents);

  // 2. Ensemble Aggregation (Weighted Average)
  const normalizedForest = Math.max(0, forestScore - 0.4) * 2; 
  const aggregateScore = (statScore * 0.2) + (normalizedForest * 0.4) + (neuralScore * 0.4);

  // Scale 0-1 to 0-100
  score = Math.floor(aggregateScore * 100);

  // 2.5 HRMS Context Signals
  if (employee && employee.is_resigned) {
    score += 25;
    breakdown.flight_risk = true;
  }
  if (employee && employee.on_pip) {
    score += 15;
    breakdown.performance_warning = true;
  }

  score = Math.max(0, Math.min(score, 99));

  // 3. Correlation Engine (Deterministic Override)
  const correlation = evaluateCorrelationRules(employee, employeeEvents, allEvents);
  if (correlation.ruleTriggered) {
    score = 100;
    breakdown = { ...breakdown, ...correlation.breakdown };
  }

  // 4. Deterministic Honeypot Trap (Overrides all ML logic)
  for (const event of employeeEvents) {
    if (event.file_name && honeypotFileNames.includes(event.file_name)) {
      touchedHoneypot = true;
    }
  }

  if (touchedHoneypot) {
    score = 100;
    breakdown.honeypot_accessed = 100; 
  }
  
  return { score, breakdown, touchedHoneypot };
};

/**
 * Calculate Zero Trust Confidence Percentage (0-100)
 */
export const calculateZeroTrustConfidence = (event, knownProfile) => {
  let score = 0;
  const factors = {
    known_device: 0,
    known_network: 0,
    normal_hours: 0,
    known_location: 0,
    behavioral_match: 0
  };

  if (event.device_ip && !event.device_ip.startsWith('10.0.0.')) {
    factors.known_device = 20;
    score += 20;
  }
  if (event.location && !event.location.includes('Unknown')) {
    factors.known_network = 20;
    score += 20;
  }
  if (!event.is_off_hours) {
    factors.normal_hours = 20;
    score += 20;
  }
  if (event.location === knownProfile.location) {
    factors.known_location = 20;
    score += 20;
  }
  const standardActions = ['Login', 'File_Access', 'Transaction'];
  if (standardActions.includes(event.action)) {
    factors.behavioral_match = 20;
    score += 20;
  }
  
  return { score, factors };
};

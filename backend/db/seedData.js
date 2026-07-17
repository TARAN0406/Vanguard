import db from '../config/db.js';
import crypto from 'crypto';

// Encryption helper (AES-256-GCM)
const ALGORITHM = 'aes-256-gcm';
const KEY = crypto.randomBytes(32);

function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Return combined buffer: iv + authTag + encrypted
  const result = Buffer.concat([iv, Buffer.from(authTag, 'hex'), Buffer.from(encrypted, 'hex')]);
  return result;
}

const runAsync = (query, params = []) => new Promise((resolve, reject) => {
  db.run(query, params, function (err) {
    if (err) reject(err);
    else resolve(this);
  });
});

const seedDatabase = async () => {
  console.log('Starting database seeding...');

  try {
    // 1. Clear existing data
    await runAsync(`DROP TABLE IF EXISTS Audit_Log`);
    await runAsync(`DROP TABLE IF EXISTS Honeypots`);
    await runAsync(`DROP TABLE IF EXISTS Access_Events`);
    await runAsync(`DROP TABLE IF EXISTS Employees`);

    // 2. Create Tables
    await runAsync(`
      CREATE TABLE IF NOT EXISTS Employees (
        id TEXT PRIMARY KEY,
        name TEXT,
        role TEXT,
        department TEXT,
        location TEXT,
        current_risk_score INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Active',
        is_resigned BOOLEAN DEFAULT 0,
        on_pip BOOLEAN DEFAULT 0,
        performance_rating INTEGER DEFAULT 3
      )
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS Access_Events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        emp_id TEXT,
        timestamp TEXT,
        action TEXT,
        device_ip TEXT,
        location TEXT,
        is_off_hours BOOLEAN,
        file_name TEXT NULL,
        FOREIGN KEY (emp_id) REFERENCES Employees (id)
      )
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS Honeypots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_name TEXT,
        file_path TEXT,
        encrypted_payload BLOB
      )
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS Audit_Log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        actor_id TEXT,
        action_taken TEXT,
        target_emp_id TEXT,
        details TEXT
      )
    `);



    // 3. Seed Employees
    const employees = [
      ['EMP1001', 'Anil Mehta', 'Employee', 'Loan Officer', 'Mumbai Main', 12, 'Active', 0, 0, 4],
      ['EMP1002', 'Priya Sharma', 'Employee', 'Branch Manager', 'Delhi CP', 34, 'Active', 0, 0, 5],
      ['EMP1003', 'Raj Kumar', 'Employee', 'IT Admin', 'Pune Main', 94, 'Active', 1, 0, 3], // Resigned
      ['EMP1004', 'Sunita Patel', 'Employee', 'Teller', 'Jaipur Tonk Road', 8, 'Active', 0, 0, 3],
      ['EMP1005', 'Vikram Singh', 'Employee', 'SWIFT Operator', 'Mumbai Main', 67, 'Active', 0, 0, 2],
      ['EMP1006', 'Deepa Nair', 'Employee', 'Database Admin', 'Chennai Anna Salai', 19, 'Active', 0, 0, 4],
      ['EMP1007', 'Arjun Reddy', 'Employee', 'Loan Officer', 'Hyderabad Banjara Hills', 58, 'Active', 0, 1, 1], // On PIP, Bad Rating
      ['EMP1008', 'Meera Krishnan', 'Employee', 'Compliance Officer', 'Bangalore MG Road', 5, 'Active', 0, 0, 5],
      ['EMP1010', 'Kavya Menon', 'CISO', 'Security', 'HQ Mumbai', 11, 'Active', 0, 0, 5],
      ['EMP1011', 'Rajesh Sharma', 'MD', 'Executive', 'HQ Mumbai', 0, 'Active', 0, 0, 5],
      ['EMP1012', 'A. Verma', 'Employee', 'Clerk', 'Pune Main', 10, 'Active', 0, 0, 3],
      ['EMP1013', 'M. Khan', 'Employee', 'Auditor', 'Delhi CP', 15, 'Active', 0, 0, 4],
      ['EMP1014', 'S. Iyer', 'Employee', 'Accountant', 'Chennai Anna Salai', 5, 'Active', 0, 0, 3],
    ];

    for (const emp of employees) {
      await runAsync(
        `INSERT INTO Employees (id, name, role, department, location, current_risk_score, status, is_resigned, on_pip, performance_rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        emp
      );
    }
    console.log('Seeded Employees');

    // 4. Seed Access Events
    const actions = ['Login', 'File_Access', 'Transaction'];
    
    // Normal events for all
    for (let i = 0; i < 40; i++) {
       const emp = employees[Math.floor(Math.random() * employees.length)];
       const action = actions[Math.floor(Math.random() * actions.length)];
       const timestamp = `2026-07-15T0${Math.floor(Math.random() * 8 + 1)}:${Math.floor(Math.random() * 50 + 10)}:00Z`;
       await runAsync(
         `INSERT INTO Access_Events (emp_id, timestamp, action, device_ip, location, is_off_hours, file_name) VALUES (?, ?, ?, ?, ?, ?, ?)`,
         [emp[0], timestamp, action, '192.168.1.' + Math.floor(Math.random()*255), emp[4], false, null]
       );
    }
    
    // Anomaly events for Raj Kumar (EMP1003)
    const rajAnomalies = [
      ['EMP1003', '2026-07-15T02:14:00Z', 'VPN_Login', '10.0.0.99', 'Unknown/VPN', true, null],
      ['EMP1003', '2026-07-15T02:17:00Z', 'Bulk_Export', '10.0.0.99', 'Unknown/VPN', true, 'customer_records_847.csv'],
      ['EMP1003', '2026-07-15T02:31:00Z', 'USB_Connection', '10.0.0.99', 'Unknown/VPN', true, null],
      ['EMP1003', '2026-07-15T02:47:00Z', 'File_Access', '10.0.0.99', 'Unknown/VPN', true, 'BOM_CEO_Salary_2026.xlsx'],
    ];
    for (const ev of rajAnomalies) {
      await runAsync(
         `INSERT INTO Access_Events (emp_id, timestamp, action, device_ip, location, is_off_hours, file_name) VALUES (?, ?, ?, ?, ?, ?, ?)`,
         ev
      );
    }

    // Anomaly events for Arjun Reddy (EMP1007)
    const arjunAnomalies = [
      ['EMP1007', 'File_Access', 'Q2_Financials.xlsx', '192.168.1.55', 'VPN/EXT', false, new Date(Date.now() - 3600000).toISOString()],
      ['EMP1007', 'Bulk_Export', '847_customer_records', '192.168.1.55', 'VPN/EXT', false, new Date(Date.now() - 1800000).toISOString()],
      // Collusion Events
      ['EMP1007', 'File_Access', 'VIP_Client_List_Confidential.pdf', '192.168.1.55', 'VPN/EXT', false, new Date(Date.now() - 900000).toISOString()],
      ['EMP1005', 'File_Access', 'VIP_Client_List_Confidential.pdf', '45.22.11.90', 'Offshore', true, new Date(Date.now() - 850000).toISOString()]
    ];
    for (const ev of arjunAnomalies) {
      await runAsync(
         `INSERT INTO Access_Events (emp_id, action, file_name, device_ip, location, is_off_hours, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)`,
         ev
      );
    }

    // Honeypot and SWIFT access for Vikram Singh (EMP1005)
    const vikramAnomalies = [
      ['EMP1005', '2026-07-16T12:00:00Z', 'File_Access', '10.0.0.105', 'Unknown/VPN', false, 'Merger_Confidential_Draft.pdf'],
      ['EMP1005', '2026-07-16T23:45:00Z', 'SWIFT_Wire_Transfer', '103.45.67.89', 'Offshore/Unknown', true, 'MT103_CrossBorder_Wire']
    ];
    for (const ev of vikramAnomalies) {
      await runAsync(
         `INSERT INTO Access_Events (emp_id, timestamp, action, device_ip, location, is_off_hours, file_name) VALUES (?, ?, ?, ?, ?, ?, ?)`,
         ev
      );
    }
    console.log('Seeded Access Events');

    // 5. Seed Honeypots
    const honeypots = [
      { name: 'BOM_CEO_Salary_2026.xlsx', path: '/privileged/hr/BOM_CEO_Salary_2026.xlsx', payload: 'CONFIDENTIAL: CEO SALARY DATA...' },
      { name: 'SWIFT_Admin_Credentials.pdf', path: '/privileged/sys/SWIFT_Admin_Credentials.pdf', payload: 'SWIFT ADMIN CREDENTIALS...' },
      { name: 'Merger_Confidential_Draft.pdf', path: '/privileged/legal/Merger_Confidential_Draft.pdf', payload: 'MERGER DRAFT ACQUISITION...' }
    ];

    for (const hp of honeypots) {
      await runAsync(
         `INSERT INTO Honeypots (file_name, file_path, encrypted_payload) VALUES (?, ?, ?)`,
         [hp.name, hp.path, encrypt(hp.payload)]
      );
    }
    console.log('Seeded Honeypots with AES-256-GCM');

    // 6. Seed Audit Log
    await runAsync(
      `INSERT INTO Audit_Log (timestamp, actor_id, action_taken, target_emp_id, details) VALUES (?, ?, ?, ?, ?)`,
      [new Date().toISOString(), 'SYSTEM', 'System Startup', 'ALL', 'Database initialized and seeded successfully.']
    );
    console.log('Seeded Audit Log');

    console.log('Database seeded successfully!');
    db.close();

  } catch (err) {
    console.error('Error during seeding:', err);
    db.close();
  }
};

seedDatabase();

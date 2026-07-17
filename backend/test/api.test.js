import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { getEmployees, getEmployeeById, freezeEmployee, investigateEmployee } from '../controllers/vanguardController.js';

// Setup Mock Express App routing directly to our controllers for integration testing
const app = express();
app.use(express.json());
app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.get('/api/employees', getEmployees);
app.get('/api/employees/:id', getEmployeeById);
app.post('/api/freeze/:id', freezeEmployee);
app.post('/api/investigate', investigateEmployee);

describe('Backend API Integration', () => {
  it('GET /api/health should respond securely', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/employees should return dynamic calculated threats', async () => {
    const res = await request(app).get('/api/employees');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    
    // Ensure data is parsed and Raj Kumar has anomaly tags (based on our seedData)
    const raj = res.body.find(e => e.name === 'Raj Kumar');
    expect(raj).toBeDefined();
    
    // Because Raj hit the honeypot in the seed data, his score should be 100
    expect(raj.riskScore).toBe(100);
    expect(raj.severity).toBe('CRITICAL');
    expect(raj.touchedHoneypot).toBe(true);
  });
  
  it('POST /api/freeze/:id should suspend employee and enforce least privilege', async () => {
    // 1. Send Freeze Action
    const res = await request(app)
      .post('/api/freeze/EMP1012')
      .send({ frozen_by: 'CISO' });
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    
    // 2. Verify Database State Change
    const verifyRes = await request(app).get('/api/employees/EMP1012');
    expect(verifyRes.body.status).toBe('Suspended');
  });

  it('POST /api/investigate should return structured AI LLM response (or fallback)', async () => {
    const res = await request(app)
      .post('/api/investigate')
      .send({ emp_id: 'EMP1001' });

    expect(res.status).toBe(200);
    expect(res.body.report).toBeDefined();
    
    // Validate strict formatting: Exactly 3 sections output rule
    expect(res.body.report).toContain('### 1. What Happened');
    expect(res.body.report).toContain('### 2. Why it is Suspicious');
    expect(res.body.report).toContain('### 3. Recommended Actions');
  });
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  getEmployees, getEmployeeById, investigateEmployee, freezeEmployee, getAuditLogs, getClientAlerts, getClientById
} from './controllers/vanguardController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'VANGUARD Backend is running' });
});

// Mounted Routes
app.get('/api/employees', getEmployees);
app.get('/api/employees/:id', getEmployeeById);
app.post('/api/investigate', investigateEmployee);
app.post('/api/freeze/:id', freezeEmployee);
app.get('/api/audit', getAuditLogs);
app.get('/api/client-alerts', getClientAlerts);
app.get('/api/client/:id', getClientById);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

import { describe, it, expect } from 'vitest';
import { encryptPayload, decryptPayload } from '../services/qpcCrypto.js';
import { calculateRiskScore, calculateZeroTrustConfidence } from '../services/scoringEngine.js';

describe('QPC Crypto Service', () => {
  it('should encrypt and decrypt a payload securely simulating QPC', () => {
    const originalText = "CONFIDENTIAL_SWIFT_KEY_1234";
    const encryptedBuffer = encryptPayload(originalText);
    
    // Validate output is obfuscated
    expect(encryptedBuffer.toString('utf8')).not.toContain(originalText);
    
    // Validate decapsulation restores exactly the original payload
    const decryptedText = decryptPayload(encryptedBuffer);
    expect(decryptedText).toBe(originalText);
  });
});

describe('Scoring Engine Service', () => {
  it('should calculate base risk correctly from anomalous events', () => {
    const events = [
      { action: 'Login', is_off_hours: true, location: 'HQ Mumbai' }, 
      { action: 'VPN_Login', location: 'Unknown/VPN', is_off_hours: false }, 
    ];
    
    const result = calculateRiskScore(events, []);
    
    // Off hours = 20, VPN_Login (Structural) = 10, Unknown location = 15
    // Total = 45
    expect(result.score).toBe(45);
    expect(result.breakdown.night_login).toBe(20);
    expect(result.breakdown.unknown_location).toBe(15);
    expect(result.breakdown.structural_anomaly).toBe(10);
  });

  it('should apply strict honeypot override and set risk score to exactly 100', () => {
    const events = [
      { action: 'File_Access', file_name: 'BOM_CEO_Salary_2026.xlsx', location: 'Mumbai Main' }
    ];
    const honeypots = ['BOM_CEO_Salary_2026.xlsx', 'SWIFT_Admin_Credentials.pdf'];
    
    const result = calculateRiskScore(events, honeypots);
    expect(result.score).toBe(100);
    expect(result.touchedHoneypot).toBe(true);
  });

  it('should calculate zero trust confidence properly', () => {
    // Normal expected event
    const event = { 
      action: 'File_Access', 
      is_off_hours: false, 
      device_ip: '192.168.1.55', 
      location: 'Pune Main' 
    };
    const knownProfile = { location: 'Pune Main' };
    
    const result = calculateZeroTrustConfidence(event, knownProfile);
    expect(result.score).toBe(100); // 5 factors * 20
  });
});

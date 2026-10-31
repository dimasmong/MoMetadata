import { describe, it, expect } from 'vitest';
import { analyzePrivacyRisks } from '../engines/privacy/analyzer';

describe('Privacy Risk Analyzer', () => {
  it('classifies GPS coordinates as high risk', () => {
    const findings = analyzePrivacyRisks(
      {
        hasGps: true,
        latitude: 37.7749,
        longitude: -122.4194,
        altitude: 15
      },
      undefined,
      undefined,
      []
    );

    const gpsFinding = findings.find(f => f.id === 'gps-coordinates');
    expect(gpsFinding).toBeDefined();
    expect(gpsFinding?.risk).toBe('high');
    expect(gpsFinding?.explanation.en).toContain('exact physical location');
    expect(gpsFinding?.explanation.id).toContain('lokasi fisik');
  });

  it('classifies device serial numbers as high risk', () => {
    const findings = analyzePrivacyRisks(
      undefined,
      { serialNumber: 'CANON-5DMK4-8849201' },
      undefined,
      []
    );

    const serialFinding = findings.find(f => f.id === 'device-serial');
    expect(serialFinding).toBeDefined();
    expect(serialFinding?.risk).toBe('high');
  });

  it('classifies author and timestamp as moderate risk', () => {
    const findings = analyzePrivacyRisks(
      undefined,
      undefined,
      { artist: 'Dimas Mong' },
      [{ id: 't1', category: 'EXIF', tag: 'DateTimeOriginal', description: 'Date', value: '2026:10:31 12:00:00' }]
    );

    const creatorFinding = findings.find(f => f.id === 'creator-name');
    const timeFinding = findings.find(f => f.id === 'creation-timestamp');

    expect(creatorFinding?.risk).toBe('moderate');
    expect(timeFinding?.risk).toBe('moderate');
  });

  it('returns empty findings for fully sanitized files', () => {
    const findings = analyzePrivacyRisks(
      { hasGps: false },
      undefined,
      undefined,
      []
    );

    expect(findings.length).toBe(0);
  });
});

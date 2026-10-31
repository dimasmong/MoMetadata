import { describe, it, expect } from 'vitest';
import { verifyProcessedOutput } from '../engines/verification/verifier';
import { ParsedMetadata } from '../types/metadata';

function createMockMetadata(): ParsedMetadata {
  return {
    fileInfo: {
      name: 'photo.jpg',
      size: 10000,
      sizeFormatted: '9.77 KB',
      type: 'image/jpeg',
      extension: 'jpg',
      category: 'image',
      lastModified: Date.now(),
      dimensions: { width: 1920, height: 1080 }
    },
    camera: {
      make: 'Canon',
      model: 'EOS 5D'
    },
    location: {
      hasGps: true,
      latitude: 37.7749,
      longitude: -122.4194,
      latitudeFormatted: '37° 46\' 29.64" N',
      longitudeFormatted: '122° 25\' 9.84" W'
    },
    creator: {
      title: 'Original Title',
      artist: 'Dimas Mong'
    },
    rawTags: [],
    capabilities: {
      canInspect: true,
      canEdit: true,
      canRemoveGps: true,
      canRemoveAll: true,
      canExport: true,
      canVerify: true,
      editableFields: ['title', 'artist']
    },
    sensitiveFindings: [
      {
        id: 'gps-coordinates',
        field: 'GPS Coordinates',
        value: '37.7749, -122.4194',
        category: 'location',
        risk: 'high',
        explanation: { en: 'Location leak', id: 'Bocor lokasi' },
        canRemove: true
      }
    ],
    hasMetadata: true
  };
}

describe('Verification Engine', () => {
  it('correctly tracks size difference and removed sensitive tags', async () => {
    const orig = createMockMetadata();
    // Simulate output file
    const file = new File([new Uint8Array(5000)], 'photo.jpg', { type: 'image/jpeg' });

    const { verification } = await verifyProcessedOutput(orig, file, {
      operationType: 'remove_all'
    });

    expect(verification.beforeSize).toBe(10000);
    expect(verification.afterSize).toBe(5000);
    expect(verification.sizeDifference).toBe(-5000);
    expect(verification.beforeSensitiveCount).toBe(1);
    expect(verification.afterSensitiveCount).toBe(0);
    expect(verification.sensitiveRemovedCount).toBe(1);
  });
});

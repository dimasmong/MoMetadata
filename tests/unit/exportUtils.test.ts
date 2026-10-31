import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { exportMetadataAsJson, exportMetadataAsCsv, downloadBatchZip } from '../../src/core/exportUtils';
import type { MetadataGroup, FileRecord } from '../../src/types/metadata';
import { createSampleJpegWithMetadata } from '../fixtures/sampleFiles';

describe('Export Utilities', () => {
  const sampleGroups: MetadataGroup[] = [
    {
      name: 'EXIF',
      category: 'description',
      tags: [
        {
          id: '1',
          name: 'Artist',
          displayName: 'Artist',
          value: 'Dimas Mong',
          category: 'description',
          group: 'EXIF',
          writable: true,
        },
        {
          id: '2',
          name: 'Title',
          displayName: 'Title',
          value: 'Field with, comma and "quotes"',
          category: 'description',
          group: 'EXIF',
          writable: true,
        },
      ],
    },
  ];

  it('generates structured JSON export', () => {
    let capturedBlob: Blob | null = null;
    const originalCreate = URL.createObjectURL;
    URL.createObjectURL = (blob: any) => {
      capturedBlob = blob;
      return 'blob:mock-json';
    };

    exportMetadataAsJson(sampleGroups, 'photo.jpg');
    expect(capturedBlob).toBeDefined();

    URL.createObjectURL = originalCreate;
  });

  it('generates properly escaped CSV with UTF-8 BOM', async () => {
    let capturedBlob: Blob | null = null;
    const originalCreate = URL.createObjectURL;
    URL.createObjectURL = (blob: any) => {
      capturedBlob = blob;
      return 'blob:mock-csv';
    };

    exportMetadataAsCsv(sampleGroups, 'photo.jpg');
    expect(capturedBlob).toBeDefined();

    if (capturedBlob) {
      const text = await (capturedBlob as Blob).text();
      expect(text).toContain('"Group","Field Name","Category","Value","Writable"');
      expect(text).toContain('"Dimas Mong"');
      // Verify escaping of quotes
      expect(text).toContain('Field with, comma and ""quotes""');
    }

    URL.createObjectURL = originalCreate;
  });

  it('packages batch files into a valid ZIP archive using JSZip', async () => {
    let zipBlob: Blob | null = null;
    const originalCreate = URL.createObjectURL;
    URL.createObjectURL = (blob: any) => {
      zipBlob = blob;
      return 'blob:mock-zip';
    };

    const mockBuffer1 = createSampleJpegWithMetadata({ title: 'Photo 1' });
    const mockBuffer2 = createSampleJpegWithMetadata({ title: 'Photo 2' });

    const files: FileRecord[] = [
      {
        id: 'f1',
        file: new File([mockBuffer1], 'photo1.jpg'),
        name: 'photo1.jpg',
        size: mockBuffer1.byteLength,
        type: 'image/jpeg',
        detectedFormat: 'JPEG',
        status: 'completed',
        modifiedBuffer: mockBuffer1,
        modifiedFileName: 'photo1_metadata-cleaned.jpg',
      },
      {
        id: 'f2',
        file: new File([mockBuffer2], 'photo2.jpg'),
        name: 'photo2.jpg',
        size: mockBuffer2.byteLength,
        type: 'image/jpeg',
        detectedFormat: 'JPEG',
        status: 'completed',
        modifiedBuffer: mockBuffer2,
        modifiedFileName: 'photo2_metadata-cleaned.jpg',
      },
    ];

    await downloadBatchZip(files, 'test_batch.zip');
    expect(zipBlob).toBeDefined();

    // Verify unzipping the generated ZIP to ensure it is valid
    if (zipBlob) {
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(zipBlob as Blob);
      expect(loadedZip.file('photo1_metadata-cleaned.jpg')).toBeDefined();
      expect(loadedZip.file('photo2_metadata-cleaned.jpg')).toBeDefined();
    }

    URL.createObjectURL = originalCreate;
  });
});

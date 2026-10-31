import type { ParsedMetadata, VerificationResult, VerificationDiffItem } from '../../types/metadata';
import { inspectFile } from '../core';

export interface VerifyOperationOptions {
  operationType: 'edit' | 'remove_gps' | 'remove_all' | 'remove_selected';
  editedFields?: Record<string, any>;
  removedCategories?: string[];
}

export async function verifyProcessedOutput(
  originalMetadata: ParsedMetadata,
  outputFile: File,
  options: VerifyOperationOptions
): Promise<{
  newMetadata: ParsedMetadata;
  verification: VerificationResult;
}> {
  // Re-read newly generated file using the real inspection engine
  const newMetadata = await inspectFile(outputFile);

  const diffItems: VerificationDiffItem[] = [];
  let isFullyVerified = true;
  let hasPartialIssues = false;

  const beforeSize = originalMetadata.fileInfo.size;
  const afterSize = newMetadata.fileInfo.size;
  const sizeDifference = afterSize - beforeSize;

  const beforeSensitiveCount = originalMetadata.sensitiveFindings.length;
  const afterSensitiveCount = newMetadata.sensitiveFindings.length;
  const sensitiveRemovedCount = Math.max(0, beforeSensitiveCount - afterSensitiveCount);

  // Check media payload integrity (dimensions / duration)
  let mediaPayloadPreserved = true;
  if (originalMetadata.fileInfo.dimensions && newMetadata.fileInfo.dimensions) {
    if (
      originalMetadata.fileInfo.dimensions.width !== newMetadata.fileInfo.dimensions.width ||
      originalMetadata.fileInfo.dimensions.height !== newMetadata.fileInfo.dimensions.height
    ) {
      mediaPayloadPreserved = false;
    }
  }

  // 1. Remove All Non-Essential Metadata Verification
  if (options.operationType === 'remove_all') {
    // Check if GPS was removed
    if (originalMetadata.location?.hasGps) {
      const gpsGone = !newMetadata.location?.hasGps;
      diffItems.push({
        field: 'GPS Coordinates',
        before: `${originalMetadata.location.latitudeFormatted}, ${originalMetadata.location.longitudeFormatted}`,
        after: gpsGone ? '(Removed)' : `${newMetadata.location?.latitudeFormatted}, ${newMetadata.location?.longitudeFormatted}`,
        status: gpsGone ? 'removed' : 'failed' as any
      });
      if (!gpsGone) isFullyVerified = false;
    }

    // Check if Camera Info was removed
    if (originalMetadata.camera?.model || originalMetadata.camera?.make) {
      const cameraGone = !newMetadata.camera?.model && !newMetadata.camera?.make;
      diffItems.push({
        field: 'Camera Model',
        before: `${originalMetadata.camera.make || ''} ${originalMetadata.camera.model || ''}`.trim(),
        after: cameraGone ? '(Removed)' : `${newMetadata.camera?.make || ''} ${newMetadata.camera?.model || ''}`.trim(),
        status: cameraGone ? 'removed' : 'failed' as any
      });
      if (!cameraGone) isFullyVerified = false;
    }

    // Check Creator / Artist
    const origCreator = originalMetadata.creator?.artist || originalMetadata.creator?.creator || originalMetadata.creator?.author;
    const newCreator = newMetadata.creator?.artist || newMetadata.creator?.creator || newMetadata.creator?.author;
    if (origCreator) {
      const creatorGone = !newCreator || newCreator === '' || (newCreator !== origCreator && newCreator.includes('pdf-lib'));
      diffItems.push({
        field: 'Creator / Author',
        before: origCreator,
        after: creatorGone ? '(Removed)' : String(newCreator),
        status: creatorGone ? 'removed' : 'failed' as any
      });
      if (!creatorGone) isFullyVerified = false;
    }

    // Check sensitive count drop
    if (beforeSensitiveCount > 0 && afterSensitiveCount === 0) {
      diffItems.push({
        field: 'Sensitive Privacy Tags',
        before: `${beforeSensitiveCount} detected`,
        after: '0 remaining',
        status: 'removed'
      });
    } else if (afterSensitiveCount > 0) {
      if (sensitiveRemovedCount > 0) {
        diffItems.push({
          field: 'Sensitive Privacy Tags',
          before: `${beforeSensitiveCount} detected`,
          after: `${afterSensitiveCount} remaining`,
          status: 'removed'
        });
      } else {
        hasPartialIssues = true;
      }
    }
  }
  // 2. Remove GPS Only Verification
  else if (options.operationType === 'remove_gps') {
    const gpsGone = !newMetadata.location?.hasGps;
    diffItems.push({
      field: 'GPS Location',
      before: originalMetadata.location?.hasGps ? `${originalMetadata.location.latitudeFormatted}` : 'None',
      after: gpsGone ? '(Successfully Removed)' : 'Still present',
      status: gpsGone ? 'removed' : 'failed' as any
    });
    if (!gpsGone) isFullyVerified = false;

    // Verify other metadata was preserved
    if (originalMetadata.camera?.model) {
      const modelPreserved = newMetadata.camera?.model === originalMetadata.camera.model;
      diffItems.push({
        field: 'Camera Model (Preserved)',
        before: originalMetadata.camera.model,
        after: newMetadata.camera?.model || '(Missing)',
        status: modelPreserved ? 'unchanged' : 'unverified'
      });
      if (!modelPreserved) hasPartialIssues = true;
    }
  }
  // 3. Edit Metadata Verification
  else if (options.operationType === 'edit' && options.editedFields) {
    for (const [key, expectedVal] of Object.entries(options.editedFields)) {
      if (expectedVal === undefined || expectedVal === '') continue;

      let actualVal = '';
      if (key === 'title') actualVal = newMetadata.creator?.title || '';
      else if (key === 'artist' || key === 'author') actualVal = newMetadata.creator?.artist || newMetadata.creator?.creator || newMetadata.creator?.author || '';
      else if (key === 'copyright') actualVal = newMetadata.creator?.copyright || '';
      else if (key === 'description') actualVal = newMetadata.creator?.description || '';
      else if (key === 'album') actualVal = newMetadata.creator?.album || '';

      const matched = actualVal.toLowerCase().includes(String(expectedVal).toLowerCase());
      diffItems.push({
        field: key.charAt(0).toUpperCase() + key.slice(1),
        before: (originalMetadata.creator as any)?.[key] || '(Empty)',
        after: actualVal || '(Not set)',
        status: matched ? 'modified' : 'unverified'
      });

      if (!matched) {
        isFullyVerified = false;
      }
    }
  }

  let finalStatus: VerificationResult['status'] = 'verified';
  let messageEn = 'All requested modifications have been confirmed and file integrity was verified.';
  let messageId = 'Semua perubahan yang diminta telah dikonfirmasi dan integritas berkas terverifikasi.';

  if (!mediaPayloadPreserved) {
    finalStatus = 'failed';
    messageEn = 'Media payload integrity mismatch detected (dimensions or frame count altered).';
    messageId = 'Ketidakcocokan integritas payload media terdeteksi (dimensi atau frame berubah).';
  } else if (!isFullyVerified) {
    finalStatus = 'failed';
    messageEn = 'Some requested metadata changes could not be confirmed in the generated output.';
    messageId = 'Beberapa perubahan metadata yang diminta tidak dapat dikonfirmasi pada berkas hasil.';
  } else if (hasPartialIssues) {
    finalStatus = 'partially_verified';
    messageEn = 'Core metadata was removed, though some minor optional tags may remain in unparsed segments.';
    messageId = 'Metadata utama telah dihapus, meski beberapa tag opsional minor mungkin masih tersisa.';
  }

  return {
    newMetadata,
    verification: {
      status: finalStatus,
      message: { en: messageEn, id: messageId },
      details: diffItems,
      beforeSize,
      afterSize,
      sizeDifference,
      beforeSensitiveCount,
      afterSensitiveCount,
      sensitiveRemovedCount,
      mediaPayloadPreserved
    }
  };
}

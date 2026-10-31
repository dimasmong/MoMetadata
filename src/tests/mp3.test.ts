import { describe, it, expect } from 'vitest';
import { stripMp3Metadata } from '../engines/audio/mp3';

function createMockMp3(): Uint8Array {
  // 10 bytes ID3v2 header: 'ID3', v2.3, flags 0, synchsafe size 10 bytes -> total tag size = 20 bytes
  const id3v2Header = new Uint8Array([
    0x49, 0x44, 0x33, // 'ID3'
    0x03, 0x00,       // v2.3
    0x00,             // flags
    0x00, 0x00, 0x00, 0x0a // synchsafe 10 bytes
  ]);
  const id3v2Body = new Uint8Array(10); // dummy tag data

  // MPEG Audio Frame Sync: 0xFF, 0xFB (MPEG-1 Layer III, 128kbps, 44.1kHz, no padding)
  const mpegFrame = new Uint8Array([0xff, 0xfb, 0x90, 0x64, 0x00, 0x00, 0x00, 0x00]);

  // ID3v1 tag at the end: 128 bytes starting with 'TAG'
  const id3v1 = new Uint8Array(128);
  id3v1[0] = 0x54; id3v1[1] = 0x41; id3v1[2] = 0x47; // 'TAG'

  const total = new Uint8Array(id3v2Header.length + id3v2Body.length + mpegFrame.length + id3v1.length);
  let pos = 0;
  total.set(id3v2Header, pos); pos += id3v2Header.length;
  total.set(id3v2Body, pos); pos += id3v2Body.length;
  total.set(mpegFrame, pos); pos += mpegFrame.length;
  total.set(id3v1, pos); pos += id3v1.length;

  return total;
}

describe('MP3 Metadata Engine', () => {
  it('strips both ID3v2 and ID3v1 while preserving MPEG audio frames', () => {
    const mockMp3 = createMockMp3();
    const stripped = stripMp3Metadata(mockMp3);

    // Should only contain the mpegFrame (8 bytes)
    expect(stripped.length).toBe(8);
    // Sync word 0xFF, 0xFB preserved!
    expect(stripped[0]).toBe(0xff);
    expect(stripped[1]).toBe(0xfb);
  });
});

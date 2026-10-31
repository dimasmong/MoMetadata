declare module 'piexifjs' {
  const piexif: any;
  export default piexif;
}

declare module 'mp3tag.js' {
  export default class MP3Tag {
    constructor(buffer: ArrayBuffer | Uint8Array);
    read(): void;
    save(options?: any): boolean;
    tags: any;
    error: string;
    buffer: ArrayBuffer;
  }
}

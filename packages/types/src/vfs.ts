/**
 * VFS (Virtual File System) types
 */

export interface VFSPath {
  collection: string;
  doc: string;
  field?: string;
}

export interface VFS {
  // Read data
  read(path: string): Promise<any>;

  // Write data
  write(path: string, data: any): Promise<void>;

  // List items
  list(path: string): Promise<string[]>;

  // Delete
  delete(path: string): Promise<void>;

  // Check existence
  exists(path: string): Promise<boolean>;
}

export interface VFSOptions {
  userId: string;
  encrypt?: boolean;
  cache?: boolean;
}

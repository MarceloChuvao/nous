/**
 * Firestore VFS adapter
 */

import { BaseVFS, parsePath } from './vfs';
import type { VFSOptions } from '@nous/types';

export class FirestoreVFS extends BaseVFS {
  private db: any; // FirebaseFirestore.Firestore

  constructor(options: VFSOptions, db: any) {
    super(options);
    this.db = db;
  }

  async read(path: string): Promise<any> {
    const { collection, doc, field } = parsePath(path);

    const snapshot = await this.db
      .collection(`users/${this.userId}/${collection}`)
      .doc(doc)
      .get();

    if (!snapshot.exists) {
      throw new Error(`Path not found: ${path}`);
    }

    const data = snapshot.data();
    await this.logAccess('read', path);

    return field ? this.getNestedField(data, field) : data;
  }

  async write(path: string, data: any): Promise<void> {
    const { collection, doc, field } = parsePath(path);

    const encrypted = await this.encryptIfNeeded(path, data);

    await this.db
      .collection(`users/${this.userId}/${collection}`)
      .doc(doc)
      .set(field ? { [field]: encrypted } : encrypted, { merge: true });

    await this.logAccess('write', path);
  }

  async list(path: string): Promise<string[]> {
    const { collection } = parsePath(path);

    const snapshot = await this.db
      .collection(`users/${this.userId}/${collection}`)
      .get();

    return snapshot.docs.map((doc: any) => doc.id);
  }

  async delete(path: string): Promise<void> {
    const { collection, doc } = parsePath(path);

    await this.db
      .collection(`users/${this.userId}/${collection}`)
      .doc(doc)
      .delete();

    await this.logAccess('delete', path);
  }

  async exists(path: string): Promise<boolean> {
    try {
      await this.read(path);
      return true;
    } catch {
      return false;
    }
  }

  private getNestedField(obj: any, field: string): any {
    const keys = field.split('.');
    let result = obj;

    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        return undefined;
      }
    }

    return result;
  }
}

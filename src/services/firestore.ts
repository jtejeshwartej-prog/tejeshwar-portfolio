import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  setDoc,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

// A small generic wrapper so every "manager" (projects, skills,
// gallery, achievements, ...) shares one implementation instead of
// hand-rolling CRUD per collection.
export function collectionService<T extends { id: string }>(collectionName: string) {
  const colRef = collection(db, collectionName)

  return {
    async list(constraints: QueryConstraint[] = []): Promise<T[]> {
      const q = constraints.length ? query(colRef, ...constraints) : query(colRef, orderBy('order', 'asc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) })) as T[]
    },

    async listPublished(extra: QueryConstraint[] = []): Promise<T[]> {
      const q = query(colRef, where('published', '==', true), ...extra)
      const snap = await getDocs(q)
      const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) })) as T[]
      // Sort client-side by `order` to avoid requiring a composite
      // index for every filter combination admins might add.
      return items.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
    },

    async get(id: string): Promise<T | null> {
      const snap = await getDoc(doc(db, collectionName, id))
      return snap.exists() ? ({ id: snap.id, ...(snap.data() as DocumentData) } as T) : null
    },

    async create(data: Omit<T, 'id'>): Promise<string> {
      const ref = await addDoc(colRef, data as DocumentData)
      return ref.id
    },

    async update(id: string, data: Partial<T>): Promise<void> {
      await updateDoc(doc(db, collectionName, id), data as DocumentData)
    },

    async upsertWithId(id: string, data: Partial<T>): Promise<void> {
      await setDoc(doc(db, collectionName, id), data as DocumentData, { merge: true })
    },

    async remove(id: string): Promise<void> {
      await deleteDoc(doc(db, collectionName, id))
    },

    subscribe(cb: (items: T[]) => void, constraints: QueryConstraint[] = []) {
      const q = constraints.length ? query(colRef, ...constraints) : query(colRef, orderBy('order', 'asc'))
      return onSnapshot(q, (snap) => {
        cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) })) as T[])
      })
    },
  }
}

export { where, orderBy }

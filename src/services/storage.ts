import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '@/lib/firebase'

export interface UploadRule {
  folder: string
  acceptedTypes: string[] // MIME prefixes or exact types, e.g. 'image/', 'application/pdf'
  acceptedExtensions?: string[] // fallback check by filename, e.g. ['.glb', '.gltf', '.obj']
  maxSizeMB: number
}

export const UPLOAD_RULES: Record<string, UploadRule> = {
  gallery: { folder: 'gallery', acceptedTypes: ['image/'], maxSizeMB: 15 },
  projectMedia: { folder: 'projects', acceptedTypes: ['image/', 'video/'], maxSizeMB: 300 },
  video: { folder: 'videos', acceptedTypes: ['video/'], maxSizeMB: 300 },
  document: {
    folder: 'documents',
    acceptedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument', 'text/plain'],
    maxSizeMB: 40,
  },
  presentation: {
    folder: 'presentations',
    acceptedTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml', 'application/vnd.ms-powerpoint'],
    maxSizeMB: 40,
  },
  model: {
    folder: 'models',
    acceptedTypes: ['model/', 'application/octet-stream'],
    acceptedExtensions: ['.glb', '.gltf', '.obj', '.bin'],
    maxSizeMB: 100,
  },
  animation: { folder: 'animations', acceptedTypes: ['image/gif', 'video/mp4', 'video/webm'], maxSizeMB: 100 },
  resume: { folder: 'resume', acceptedTypes: ['application/pdf'], maxSizeMB: 15 },
  achievement: { folder: 'achievements', acceptedTypes: ['image/', 'application/pdf'], maxSizeMB: 40 },
  profile: { folder: 'profile', acceptedTypes: ['image/'], maxSizeMB: 15 },
}

export function validateFile(file: File, ruleKey: keyof typeof UPLOAD_RULES): string | null {
  const rule = UPLOAD_RULES[ruleKey]
  const sizeOk = file.size <= rule.maxSizeMB * 1024 * 1024
  if (!sizeOk) return `File is larger than the ${rule.maxSizeMB}MB limit for this upload type.`

  const typeOk = rule.acceptedTypes.some((t) => file.type.startsWith(t) || file.type === t)
  const extOk = rule.acceptedExtensions?.some((ext) => file.name.toLowerCase().endsWith(ext))

  if (!typeOk && !extOk) {
    return `"${file.type || 'unknown type'}" is not accepted here. Allowed: ${rule.acceptedTypes.join(', ')}${
      rule.acceptedExtensions ? ' or ' + rule.acceptedExtensions.join(', ') : ''
    }.`
  }
  return null
}

export function uploadFile(
  file: File,
  ruleKey: keyof typeof UPLOAD_RULES,
  onProgress?: (pct: number) => void,
  pathPrefix?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const error = validateFile(file, ruleKey)
    if (error) {
      reject(new Error(error))
      return
    }
    const rule = UPLOAD_RULES[ruleKey]
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`
    const path = pathPrefix ? `${rule.folder}/${pathPrefix}/${safeName}` : `${rule.folder}/${safeName}`
    const storageRef = ref(storage, path)
    const task = uploadBytesResumable(storageRef, file, { contentType: file.type })

    task.on(
      'state_changed',
      (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      (err) => reject(err),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        resolve(url)
      }
    )
  })
}

export async function deleteFileByUrl(url: string): Promise<void> {
  try {
    const fileRef = ref(storage, url)
    await deleteObject(fileRef)
  } catch {
    // File may already be gone, or URL wasn't a storage ref — non-fatal.
  }
}

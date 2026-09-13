export type ProjectCategory =
  | 'Programming'
  | 'Web Development'
  | 'Cybersecurity'
  | 'Electronics'
  | '3D'
  | 'Design'
  | 'Creative'
  | 'Other'

export interface ProjectLink {
  github?: string
  live?: string
  docs?: string
}

export interface Project {
  id: string
  title: string
  description: string
  longDescription?: string
  category: ProjectCategory
  thumbnail: string
  images: string[]
  videos: string[]
  technologies: string[]
  tags: string[]
  links: ProjectLink
  presentationId?: string
  model3dId?: string
  date: string // ISO date
  featured: boolean
  published: boolean
  order: number
  createdAt: number
  updatedAt: number
}

export interface VideoItem {
  id: string
  title: string
  description?: string
  category: string
  url: string
  thumbnail: string
  projectId?: string
  published: boolean
  order: number
  createdAt: number
}

export type DocKind = 'pdf' | 'word' | 'text' | 'other'

export interface DocumentItem {
  id: string
  title: string
  description?: string
  kind: DocKind
  url: string
  fileName: string
  sizeBytes?: number
  projectId?: string
  published: boolean
  order: number
  createdAt: number
}

export interface PresentationItem {
  id: string
  title: string
  description?: string
  url: string
  thumbnail?: string
  projectId?: string
  published: boolean
  order: number
  createdAt: number
}

export type Model3DFormat = 'glb' | 'gltf' | 'obj'

export interface Model3DItem {
  id: string
  title: string
  description?: string
  format: Model3DFormat
  url: string
  thumbnail?: string
  projectId?: string
  published: boolean
  order: number
  createdAt: number
}

export interface AnimationItem {
  id: string
  title: string
  description?: string
  kind: 'gif' | 'mp4' | 'webm'
  url: string
  thumbnail?: string
  published: boolean
  order: number
  createdAt: number
}

export interface GalleryItem {
  id: string
  title: string
  url: string
  category: string
  tags: string[]
  published: boolean
  order: number
  createdAt: number
}

export type SkillCategory =
  | 'Programming'
  | 'Web Development'
  | 'Python'
  | 'C/C++'
  | 'JavaScript'
  | 'React'
  | 'Backend'
  | 'Database'
  | 'Cybersecurity'
  | 'Electronics'
  | '3D'
  | 'Tools'

export interface Skill {
  id: string
  name: string
  category: SkillCategory
  level: number // 0-100
  icon?: string
  published: boolean
  order: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  date: string
  image?: string
  fileUrl?: string
  published: boolean
  order: number
  createdAt: number
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: number
  read: boolean
}

export interface SocialLinks {
  github?: string
  linkedin?: string
  twitter?: string
  instagram?: string
  youtube?: string
  email?: string
}

export interface TimelineEntry {
  id: string
  year: string
  title: string
  description: string
}

export interface HomeContent {
  heroName: string
  heroTagline: string
  heroIntro: string
  profilePhoto?: string
}

export interface AboutContent {
  intro: string
  education: string
  interests: string
  goals: string
  techInterests: string
  timeline: TimelineEntry[]
}

export interface SiteSettings {
  socialLinks: SocialLinks
  resumeUrl?: string
  maintenanceMode: boolean
}

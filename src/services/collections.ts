import { collectionService } from './firestore'
import type {
  Project,
  VideoItem,
  DocumentItem,
  PresentationItem,
  Model3DItem,
  AnimationItem,
  GalleryItem,
  Skill,
  Achievement,
  ContactMessage,
} from '@/types'

export const projectsCol = collectionService<Project>('projects')
export const videosCol = collectionService<VideoItem>('videos')
export const documentsCol = collectionService<DocumentItem>('documents')
export const presentationsCol = collectionService<PresentationItem>('presentations')
export const models3dCol = collectionService<Model3DItem>('models3d')
export const animationsCol = collectionService<AnimationItem>('animations')
export const galleryCol = collectionService<GalleryItem>('gallery')
export const skillsCol = collectionService<Skill>('skills')
export const achievementsCol = collectionService<Achievement>('achievements')
export const messagesCol = collectionService<ContactMessage>('messages')

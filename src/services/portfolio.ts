import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { HomeContent, AboutContent, SiteSettings } from '@/types'

async function getDocData<T>(path: string, id: string, fallback: T): Promise<T> {
  const snap = await getDoc(doc(db, path, id))
  return snap.exists() ? ({ ...fallback, ...(snap.data() as Partial<T>) }) : fallback
}

export const DEFAULT_HOME: HomeContent = {
  heroName: 'TEJESHWAR',
  heroTagline: 'Building. Creating. Exploring.',
  heroIntro:
    'I design and build software, hardware, and creative projects — from full-stack applications to electronics and 3D experiments. This is where all of it lives.',
}

export const DEFAULT_ABOUT: AboutContent = {
  intro: 'A short introduction goes here — set from the admin dashboard.',
  education: '',
  interests: '',
  goals: '',
  techInterests: '',
  timeline: [],
}

export const DEFAULT_SETTINGS: SiteSettings = {
  socialLinks: {},
  maintenanceMode: false,
}

export const portfolioService = {
  getHome: () => getDocData<HomeContent>('portfolio', 'home', DEFAULT_HOME),
  setHome: (data: Partial<HomeContent>) => setDoc(doc(db, 'portfolio', 'home'), data, { merge: true }),

  getAbout: () => getDocData<AboutContent>('portfolio', 'about', DEFAULT_ABOUT),
  setAbout: (data: Partial<AboutContent>) => setDoc(doc(db, 'portfolio', 'about'), data, { merge: true }),

  getSettings: () => getDocData<SiteSettings>('settings', 'general', DEFAULT_SETTINGS),
  setSettings: (data: Partial<SiteSettings>) => setDoc(doc(db, 'settings', 'general'), data, { merge: true }),
}

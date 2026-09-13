import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AmbientBackground from '@/components/layout/AmbientBackground'
import CinematicLoader from '@/components/layout/CinematicLoader'
import PageTransition from '@/components/layout/PageTransition'
import ScrollToTop from '@/components/layout/ScrollToTop'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import ConfigBanner from '@/components/layout/ConfigBanner'

import Home from '@/pages/Home'
import About from '@/pages/About'
import Resume from '@/pages/Resume'
import Projects from '@/pages/Projects'
import ProjectDetail from '@/pages/ProjectDetail'
import Videos from '@/pages/Videos'
import Documents from '@/pages/Documents'
import Presentations from '@/pages/Presentations'
import ThreeDShowcase from '@/pages/ThreeDShowcase'
import Animations from '@/pages/Animations'
import Gallery from '@/pages/Gallery'
import Skills from '@/pages/Skills'
import Achievements from '@/pages/Achievements'
import Contact from '@/pages/Contact'
import NotFound from '@/pages/NotFound'

import AdminLayout from '@/pages/admin/AdminLayout'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminProjects from '@/pages/admin/AdminProjects'
import AdminProjectEditor from '@/pages/admin/AdminProjectEditor'
import AdminHomeAbout from '@/pages/admin/AdminHomeAbout'
import AdminSkills from '@/pages/admin/AdminSkills'
import AdminAchievements from '@/pages/admin/AdminAchievements'
import AdminGallery from '@/pages/admin/AdminGallery'
import AdminVideos from '@/pages/admin/AdminVideos'
import AdminDocuments from '@/pages/admin/AdminDocuments'
import AdminPresentations from '@/pages/admin/AdminPresentations'
import AdminModels from '@/pages/admin/AdminModels'
import AdminAnimations from '@/pages/admin/AdminAnimations'
import AdminResume from '@/pages/admin/AdminResume'
import AdminMessages from '@/pages/admin/AdminMessages'
import AdminSettings from '@/pages/admin/AdminSettings'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/resume" element={<PageTransition><Resume /></PageTransition>} />
        <Route path="/projects" element={<PageTransition><Projects /></PageTransition>} />
        <Route path="/projects/:id" element={<PageTransition><ProjectDetail /></PageTransition>} />
        <Route path="/videos" element={<PageTransition><Videos /></PageTransition>} />
        <Route path="/documents" element={<PageTransition><Documents /></PageTransition>} />
        <Route path="/presentations" element={<PageTransition><Presentations /></PageTransition>} />
        <Route path="/3d" element={<PageTransition><ThreeDShowcase /></PageTransition>} />
        <Route path="/animations" element={<PageTransition><Animations /></PageTransition>} />
        <Route path="/gallery" element={<PageTransition><Gallery /></PageTransition>} />
        <Route path="/skills" element={<PageTransition><Skills /></PageTransition>} />
        <Route path="/achievements" element={<PageTransition><Achievements /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="content" element={<AdminHomeAbout />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="projects/new" element={<AdminProjectEditor />} />
          <Route path="projects/:id" element={<AdminProjectEditor />} />
          <Route path="skills" element={<AdminSkills />} />
          <Route path="achievements" element={<AdminAchievements />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="videos" element={<AdminVideos />} />
          <Route path="documents" element={<AdminDocuments />} />
          <Route path="presentations" element={<AdminPresentations />} />
          <Route path="models" element={<AdminModels />} />
          <Route path="animations" element={<AdminAnimations />} />
          <Route path="resume" element={<AdminResume />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1400)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <CinematicLoader show={loading} />
      <AmbientBackground />
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}
      <AnimatedRoutes />
      {!isAdminRoute && <Footer />}
      <ConfigBanner />
    </>
  )
}

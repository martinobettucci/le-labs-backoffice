import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Project = {
  id: string
  title: string
  slug: string
  status: string
  featured: boolean
  hash: string
  description: string
  summary: string
  tags: string[]
  last_updated: string
  image: string
  tile_styles: Record<string, any>
  links: Record<string, string>
  updates: Array<{
    date: string
    hash: string
    title: string
    content: string
  }>
  last_modified: string
}

type ProjectContextType = {
  projects: Project[]
  loading: boolean
  error: string | null
  fetchProjects: () => void
  addProject: (project: Partial<Project>) => Promise<void>
  updateProject: (id: string, project: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.from('le_labs_project').select('*').order('last_modified', { ascending: false })
    if (error) {
      setError(error.message)
      setProjects([])
    } else {
      setProjects(
        (data || []).map((p) => ({
          ...p,
          tags: parseJsonArray(p.tags),
          tile_styles: parseJson(p.tile_styles),
          links: parseJson(p.links),
          updates: parseJsonArray(p.updates),
        }))
      )
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const addProject = async (project: Partial<Project>) => {
    setLoading(true)
    setError(null)
    // Convert complex fields to JSON strings
    const payload = {
      ...project,
      tags: JSON.stringify(project.tags || []),
      tile_styles: JSON.stringify(project.tile_styles || {}),
      links: JSON.stringify(project.links || {}),
      updates: JSON.stringify(project.updates || []),
    }
    const { error } = await supabase.from('le_labs_project').insert([payload])
    if (error) setError(error.message)
    await fetchProjects()
    setLoading(false)
  }

  const updateProject = async (id: string, project: Partial<Project>) => {
    setLoading(true)
    setError(null)
    const payload = {
      ...project,
      tags: project.tags ? JSON.stringify(project.tags) : undefined,
      tile_styles: project.tile_styles ? JSON.stringify(project.tile_styles) : undefined,
      links: project.links ? JSON.stringify(project.links) : undefined,
      updates: project.updates ? JSON.stringify(project.updates) : undefined,
    }
    const { error } = await supabase.from('le_labs_project').update(payload).eq('id', id)
    if (error) setError(error.message)
    await fetchProjects()
    setLoading(false)
  }

  const deleteProject = async (id: string) => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.from('le_labs_project').delete().eq('id', id)
    if (error) setError(error.message)
    await fetchProjects()
    setLoading(false)
  }

  return (
    <ProjectContext.Provider value={{ projects, loading, error, fetchProjects, addProject, updateProject, deleteProject }}>
      {children}
    </ProjectContext.Provider>
  )
}

export const useProjects = () => {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider')
  return ctx
}

// Helpers
function parseJson(val: any) {
  if (!val) return {}
  if (typeof val === 'object') return val
  try {
    return JSON.parse(val)
  } catch {
    return {}
  }
}
function parseJsonArray(val: any) {
  if (!val) return []
  if (Array.isArray(val)) return val
  try {
    return JSON.parse(val)
  } catch {
    return []
  }
}

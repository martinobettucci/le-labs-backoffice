import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type ProjectUpdate = {
  date: string
  hash: string
  title: string
  content: string
}

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
  tile_styles: Record<string, unknown>
  links: Record<string, string>
  updates: ProjectUpdate[]
  last_modified: string
}

type ProjectContextType = {
  projects: Project[]
  loading: boolean
  error: string | null
  session: Session | null
  requestOtp: (email: string) => Promise<void>
  verifyOtp: (email: string, token: string) => Promise<void>
  signOut: () => Promise<void>
  fetchProjects: () => void
  addProject: (project: Partial<Project>) => Promise<void>
  updateProject: (id: string, project: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

const errMessage = (err: unknown) => (err instanceof Error ? err.message : 'Unknown error')

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (!data.session) setLoading(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => subscription.unsubscribe()
  }, [])

  // --- Auth: magic-link / OTP ------------------------------------------------
  const requestOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
        shouldCreateUser: true,
      },
    })
    if (error) throw error
  }

  const verifyOtp = async (email: string, token: string) => {
    // New users get a "signup" OTP, returning users an "email" OTP — try both.
    let res = await supabase.auth.verifyOtp({ email, token, type: 'email' })
    if (res.error) res = await supabase.auth.verifyOtp({ email, token, type: 'signup' })
    if (res.error) throw res.error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // --- Projects CRUD ---------------------------------------------------------
  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('le_labs_project')
        .select('*')
        .order('last_modified', { ascending: false })

      if (error) {
        setError(`Database error: ${error.message}`)
        setProjects([])
      } else {
        const rows = (data ?? []) as Array<Record<string, unknown>>
        setProjects(
          rows.map((p) => ({
            ...(p as unknown as Project),
            tags: parseJsonArray<string>(p.tags),
            tile_styles: parseJson(p.tile_styles),
            links: parseJson(p.links) as Record<string, string>,
            updates: parseJsonArray<ProjectUpdate>(p.updates),
          })),
        )
      }
    } catch (err) {
      setError(`Network error: ${errMessage(err)}`)
      setProjects([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (session) fetchProjects()
  }, [fetchProjects, session])

  // JSONB / array columns: send native JS values (no stringify).
  const toPayload = (project: Partial<Project>): Partial<Project> => ({
    ...project,
    ...(project.tags !== undefined ? { tags: project.tags } : {}),
    ...(project.tile_styles !== undefined ? { tile_styles: project.tile_styles } : {}),
    ...(project.links !== undefined ? { links: project.links } : {}),
    ...(project.updates !== undefined ? { updates: project.updates } : {}),
  })

  const addProject = async (project: Partial<Project>) => {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.from('le_labs_project').insert([toPayload(project)])
      if (error) setError(`Failed to add project: ${error.message}`)
      else await fetchProjects()
    } catch (err) {
      setError(`Network error: ${errMessage(err)}`)
    }
    setLoading(false)
  }

  const updateProject = async (id: string, project: Partial<Project>) => {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.from('le_labs_project').update(toPayload(project)).eq('id', id)
      if (error) setError(`Failed to update project: ${error.message}`)
      else await fetchProjects()
    } catch (err) {
      setError(`Network error: ${errMessage(err)}`)
    }
    setLoading(false)
  }

  const deleteProject = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.from('le_labs_project').delete().eq('id', id)
      if (error) setError(`Failed to delete project: ${error.message}`)
      else await fetchProjects()
    } catch (err) {
      setError(`Network error: ${errMessage(err)}`)
    }
    setLoading(false)
  }

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        error,
        session,
        requestOtp,
        verifyOtp,
        signOut,
        fetchProjects,
        addProject,
        updateProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export const useProjects = () => {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider')
  return ctx
}

// --- Helpers -----------------------------------------------------------------
function parseJson(val: unknown): Record<string, unknown> {
  if (!val) return {}
  if (typeof val === 'object') return val as Record<string, unknown>
  try {
    return JSON.parse(val as string)
  } catch {
    return {}
  }
}

function parseJsonArray<T = unknown>(val: unknown): T[] {
  if (!val) return []
  if (Array.isArray(val)) return val as T[]
  try {
    return JSON.parse(val as string) as T[]
  } catch {
    return []
  }
}

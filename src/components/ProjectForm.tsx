import { useState, useEffect } from 'react'
import type { ChangeEvent, FormEvent, SyntheticEvent } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Typography,
  Chip,
  Autocomplete,
  CircularProgress,
  Alert,
} from '@mui/material'
import { CloudUpload as UploadIcon } from '@mui/icons-material'
import { useProjects } from '../context/ProjectContext'
import type { Project, ProjectUpdate } from '../context/ProjectContext'
import LinksEditor from './LinksEditor'
import UpdatesEditor from './UpdatesEditor'
import { hashObject, md5 } from '../lib/hash'
import { supabase } from '../lib/supabase'

const BUCKET = 'project-images'

interface ProjectFormProps {
  open: boolean
  onClose: () => void
  initialData?: Project | null
  onSuccess?: (message: string) => void
}

const emptyProject: Partial<Project> = {
  id: '',
  title: '',
  slug: '',
  status: '',
  featured: false,
  hash: '',
  description: '',
  summary: '',
  tags: [],
  last_updated: '',
  image: '',
  tile_styles: { color: '#FFFFFF', background: '#8C5223' },
  links: {},
  updates: [],
  last_modified: '',
}

// Format an ISO date for a datetime-local input.
function formatDateForInput(dateStr?: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`
}

// Deterministic chip color from a label.
function labelToColor(label: string) {
  if (!label) return '#CCCCCC'
  return `#${md5(label).slice(0, 6)}`
}

export default function ProjectForm({ open, onClose, initialData, onSuccess }: ProjectFormProps) {
  const { addProject, updateProject, loading } = useProjects()
  const [form, setForm] = useState<Partial<Project>>(emptyProject)
  const [linksEditorOpen, setLinksEditorOpen] = useState(false)
  const [updatesEditorOpen, setUpdatesEditorOpen] = useState(false)
  const [statusOptions, setStatusOptions] = useState<string[]>([])
  const [tagOptions, setTagOptions] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const isEdit = Boolean(initialData && initialData.id)

  // Suggest existing statuses / tags.
  useEffect(() => {
    if (!open) return
    let active = true
    ;(async () => {
      const { data } = await supabase.from('le_labs_project').select('status, tags')
      if (!active || !data) return
      const rows = data as Array<{ status?: string | null; tags?: unknown }>
      setStatusOptions(Array.from(new Set(rows.map((r) => r.status).filter(Boolean) as string[])))
      const allTags = rows
        .flatMap((r) => (Array.isArray(r.tags) ? (r.tags as string[]) : []))
        .filter(Boolean)
      setTagOptions(Array.from(new Set(allTags)))
    })()
    return () => {
      active = false
    }
  }, [open])

  useEffect(() => {
    if (initialData) {
      setForm({
        ...emptyProject,
        ...initialData,
        tile_styles: {
          color: (initialData.tile_styles?.color as string) || '#FFFFFF',
          background: (initialData.tile_styles?.background as string) || '#8C5223',
        },
        tags: Array.isArray(initialData.tags) ? initialData.tags : [],
        updates: Array.isArray(initialData.updates) ? initialData.updates : [],
        last_updated: formatDateForInput(initialData.last_updated),
        last_modified: formatDateForInput(initialData.last_modified),
      })
    } else {
      setForm(emptyProject)
    }
  }, [initialData, open])

  const handleText = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleFeatured = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, featured: e.target.checked }))
  }

  const handleStyleColorChange = (field: 'color' | 'background', value: string) => {
    setForm((f) => ({ ...f, tile_styles: { ...(f.tile_styles ?? {}), [field]: value } }))
  }

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError('')
    try {
      const ext = file.name.split('.').pop() || 'png'
      const base = (form.slug || form.id || 'project').toString().replace(/[^a-z0-9-]/gi, '-')
      const path = `${base}-${Date.now()}.${ext}`
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type || 'image/png' })
      if (error) throw error
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
      // Store a same-origin-relative URL when possible so BOTH the website and
      // the back-office can render the image through their own /supabase proxy.
      let publicUrl = data.publicUrl
      try {
        const u = new URL(publicUrl)
        if (u.origin === window.location.origin) publicUrl = u.pathname + u.search
      } catch {
        /* keep absolute */
      }
      setForm((f) => ({ ...f, image: publicUrl }))
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const nowIso = new Date().toISOString()
    const payload: Partial<Project> = {
      ...form,
      tags: Array.isArray(form.tags) ? form.tags.map((t) => t.trim()).filter(Boolean) : [],
      tile_styles: form.tile_styles ?? {},
      links: form.links ?? {},
      updates: form.updates ?? [],
      last_updated: form.last_updated ? new Date(form.last_updated).toISOString() : nowIso,
    }
    if (form.last_modified) payload.last_modified = new Date(form.last_modified).toISOString()
    else delete payload.last_modified
    payload.hash = hashObject(payload, 'hash')

    if (isEdit && form.id) await updateProject(form.id, payload)
    else await addProject(payload)
    onSuccess?.(isEdit ? 'Project updated' : 'Project created')
    onClose()
  }

  const hashPreview = hashObject(
    {
      ...form,
      last_updated: form.last_updated ? new Date(form.last_updated).toISOString() : '',
      last_modified: form.last_modified ? new Date(form.last_modified).toISOString() : '',
    },
    'hash',
  )

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Project' : 'Add Project'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="ID" name="id" value={form.id} onChange={handleText} fullWidth
                  required={!isEdit} disabled={isEdit}
                  inputProps={{ 'data-testid': 'pf-id' }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Title" name="title" value={form.title} onChange={handleText} fullWidth required
                  inputProps={{ 'data-testid': 'pf-title' }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Slug" name="slug" value={form.slug} onChange={handleText} fullWidth required
                  inputProps={{ 'data-testid': 'pf-slug' }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  freeSolo
                  options={statusOptions}
                  inputValue={form.status || ''}
                  onInputChange={(_e: SyntheticEvent, val: string) =>
                    setForm((f) => ({ ...f, status: val }))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Status"
                      required
                      inputProps={{ ...params.inputProps, 'data-testid': 'pf-status' }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={<Switch checked={!!form.featured} onChange={handleFeatured} name="featured" />}
                  label="Featured"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Hash" value={hashPreview} fullWidth InputProps={{ readOnly: true }}
                  helperText="Automatically calculated from project content" />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Description" name="description" value={form.description} onChange={handleText}
                  fullWidth multiline minRows={2} inputProps={{ 'data-testid': 'pf-description' }} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Summary" name="summary" value={form.summary} onChange={handleText}
                  fullWidth multiline minRows={2} inputProps={{ 'data-testid': 'pf-summary' }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={tagOptions}
                  value={Array.isArray(form.tags) ? form.tags : []}
                  onChange={(_e: SyntheticEvent, val: string[]) =>
                    setForm((f) => ({ ...f, tags: val }))
                  }
                  renderTags={(value: readonly string[], getTagProps) =>
                    value.map((option: string, index: number) => {
                      const { key, ...tagProps } = getTagProps({ index })
                      return (
                        <Chip
                          key={key}
                          label={option}
                          {...tagProps}
                          sx={{ background: labelToColor(option), color: '#fff', fontWeight: 500 }}
                        />
                      )
                    })
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Tags" placeholder="Add or select tags"
                      inputProps={{ ...params.inputProps, 'data-testid': 'pf-tags' }} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Last Updated" name="last_updated" value={form.last_updated} onChange={handleText}
                  fullWidth type="datetime-local" InputLabelProps={{ shrink: true }}
                  inputProps={{ 'data-testid': 'pf-last-updated' }} />
              </Grid>

              {/* Image: URL + upload to sovereign Storage (MinIO / S3) */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <TextField label="Image URL" name="image" value={form.image} onChange={handleText}
                    sx={{ flex: 1, minWidth: 240 }} inputProps={{ 'data-testid': 'pf-image-url' }}
                    helperText="Paste a URL or upload a file to sovereign storage" />
                  <Button component="label" variant="outlined" startIcon={uploading ? <CircularProgress size={18} /> : <UploadIcon />}
                    disabled={uploading} sx={{ mt: 1, whiteSpace: 'nowrap' }}>
                    {uploading ? 'Uploading…' : 'Upload image'}
                    <input data-testid="pf-image-file" type="file" accept="image/*" hidden onChange={handleImageUpload} />
                  </Button>
                  {form.image && (
                    <Box mt={1}>
                      <img src={form.image} alt="preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }} />
                    </Box>
                  )}
                </Box>
                {uploadError && <Alert severity="error" sx={{ mt: 1 }}>{uploadError}</Alert>}
              </Grid>

              {/* tile_styles colors */}
              <Grid item xs={6} sm={3}>
                <Typography variant="subtitle2" gutterBottom>Color</Typography>
                <input type="color" value={(form.tile_styles?.color as string) || '#FFFFFF'}
                  onChange={(e) => handleStyleColorChange('color', e.target.value)}
                  style={{ width: 48, height: 32, border: 'none', background: 'none', cursor: 'pointer' }} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="subtitle2" gutterBottom>Background</Typography>
                <input type="color" value={(form.tile_styles?.background as string) || '#8C5223'}
                  onChange={(e) => handleStyleColorChange('background', e.target.value)}
                  style={{ width: 48, height: 32, border: 'none', background: 'none', cursor: 'pointer' }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Button variant="outlined" size="small" onClick={() => setLinksEditorOpen(true)}>Edit Links</Button>
                <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                  {form.links && Object.keys(form.links).length > 0 ? `${Object.keys(form.links).length} links` : 'No links'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button variant="outlined" size="small" onClick={() => setUpdatesEditorOpen(true)}>Edit Updates</Button>
                <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                  {form.updates && form.updates.length > 0 ? `${form.updates.length} updates` : 'No updates'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Last Modified" name="last_modified" value={form.last_modified} onChange={handleText}
                  fullWidth type="datetime-local" InputLabelProps={{ shrink: true }} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} color="secondary" variant="outlined">Cancel</Button>
            <Button data-testid="pf-submit" type="submit" color="primary" variant="contained" disabled={loading || uploading}>
              {isEdit ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <LinksEditor
        open={linksEditorOpen}
        onClose={() => setLinksEditorOpen(false)}
        value={form.links ?? {}}
        onSave={(linksObj: Record<string, string>) => setForm((f) => ({ ...f, links: linksObj }))}
      />
      <UpdatesEditor
        open={updatesEditorOpen}
        onClose={() => setUpdatesEditorOpen(false)}
        value={Array.isArray(form.updates) ? form.updates : []}
        onSave={(updatesArr: ProjectUpdate[]) => setForm((f) => ({ ...f, updates: updatesArr }))}
      />
    </>
  )
}

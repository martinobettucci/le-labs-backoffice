import React from 'react'
import { Box, Typography, Chip, Divider, Grid, Paper, Link } from '@mui/material'
import { Project } from '../context/ProjectContext'
import dayjs from 'dayjs'

export default function ProjectDetails({ project }: { project: Project }) {
  if (!project) return null
  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <img src={project.image} alt={project.title} style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }} />
        </Grid>
        <Grid item xs={12} sm={8}>
          <Typography variant="h4">{project.title}</Typography>
          <Typography variant="subtitle1" color="text.secondary">{project.slug}</Typography>
          <Box sx={{ mt: 1, mb: 1 }}>
            {project.tags && project.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
            ))}
          </Box>
          <Typography variant="body1" sx={{ mb: 1 }}>{project.summary}</Typography>
          <Typography variant="body2" color="text.secondary">{project.description}</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2"><b>Status:</b> {project.status} | <b>Featured:</b> {project.featured ? 'Yes' : 'No'}</Typography>
          <Typography variant="body2"><b>Last Updated:</b> {dayjs(project.last_updated).format('YYYY-MM-DD HH:mm')}</Typography>
          <Typography variant="body2"><b>Last Modified:</b> {dayjs(project.last_modified).format('YYYY-MM-DD HH:mm')}</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2"><b>Hash:</b> {project.hash}</Typography>
          <Typography variant="body2"><b>Tile Styles:</b> <code>{JSON.stringify(project.tile_styles, null, 2)}</code></Typography>
          <Typography variant="body2"><b>Links:</b></Typography>
          <Box sx={{ ml: 2 }}>
            {project.links && Object.entries(project.links).map(([k, v]) => (
              <div key={k}><b>{k}:</b> <Link href={v} target="_blank" rel="noopener">{v}</Link></div>
            ))}
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2"><b>Updates:</b></Typography>
          <Box sx={{ ml: 2 }}>
            {Array.isArray(project.updates) && project.updates.map((upd, idx) => (
              <Paper key={upd.hash || idx} sx={{ p: 1, mb: 1, bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle2">{upd.title} <span style={{ color: '#888' }}>({dayjs(upd.date).format('YYYY-MM-DD')})</span></Typography>
                <Typography variant="body2">{upd.content}</Typography>
              </Paper>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  )
}

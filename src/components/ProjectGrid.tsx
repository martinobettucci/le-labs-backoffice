import React, { useState } from 'react'
import { 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Chip, 
  IconButton, 
  Menu, 
  MenuItem, 
  Avatar, 
  Stack,
  Skeleton,
  InputBase,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Fade,
  Zoom
} from '@mui/material'
import { 
  MoreVert as MoreIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Search as SearchIcon,
  GridView as GridIcon,
  List as ListIcon,
  CalendarToday as DateIcon
} from '@mui/icons-material'
import { useProjects } from '../context/ProjectContext'
import dayjs from 'dayjs'

export default function ProjectGrid({ onEdit, onSelect, selectedProject }) {
  const { projects, loading, deleteProject } = useProjects()
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid')

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleMenuOpen = (event, projectId) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
    setSelectedProjectId(projectId)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedProjectId(null)
  }

  const handleEdit = () => {
    const project = projects.find(p => p.id === selectedProjectId)
    onEdit(project)
    handleMenuClose()
  }

  const handleDelete = () => {
    const project = projects.find(p => p.id === selectedProjectId)
    if (window.confirm(`Delete "${project?.title}"?`)) {
      deleteProject(selectedProjectId)
    }
    handleMenuClose()
  }

  const getStatusColor = (status) => {
    const colors = {
      'active': '#10B981',
      'completed': '#6366F1',
      'on-hold': '#F59E0B',
      'cancelled': '#EF4444',
      'draft': '#6B7280'
    }
    return colors[status?.toLowerCase()] || '#8B5CF6'
  }

  if (loading) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Skeleton height={60} sx={{ borderRadius: 3 }} />
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)'
            },
            gap: 3
          }}
        >
          {[...Array(8)].map((_, i) => (
            <Card key={i} sx={{ borderRadius: 4 }}>
              <Skeleton variant="rectangular" height={200} />
              <CardContent>
                <Skeleton height={32} sx={{ mb: 1 }} />
                <Skeleton height={20} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Skeleton width={60} height={24} sx={{ borderRadius: 3 }} />
                  <Skeleton width={80} height={24} sx={{ borderRadius: 3 }} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      {/* Search and Controls */}
      <Box sx={{ mb: 4 }}>
        <Paper
          sx={{
            p: 2,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 2 }}>
              <SearchIcon sx={{ color: 'grey.500' }} />
              <InputBase
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  flex: 1,
                  fontSize: '1rem',
                  '& ::placeholder': {
                    color: 'grey.500'
                  }
                }}
              />
            </Box>
            
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newView) => newView && setViewMode(newView)}
              size="small"
            >
              <ToggleButton value="grid">
                <GridIcon />
              </ToggleButton>
              <ToggleButton value="list">
                <ListIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Paper>
      </Box>

      {/* Projects Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: viewMode === 'grid' ? {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
            xl: 'repeat(3, 1fr)'
          } : '1fr',
          gap: 3
        }}
      >
        {filteredProjects.map((project, index) => (
          <Zoom 
            key={project.id} 
            in 
            timeout={300} 
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <Card
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: selectedProject?.id === project.id 
                  ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))'
                  : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: selectedProject?.id === project.id 
                  ? '2px solid rgba(102, 126, 234, 0.3)'
                  : '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: selectedProject?.id === project.id
                  ? '0 20px 40px rgba(102, 126, 234, 0.2)'
                  : '0 10px 30px rgba(0,0,0,0.1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                  '& .project-image': {
                    transform: 'scale(1.05)'
                  }
                }
              }}
              onClick={() => onSelect(project)}
            >
              {/* Project Image */}
              <Box sx={{ position: 'relative', overflow: 'hidden', height: 200 }}>
                {project.image ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={project.image}
                    alt={project.title}
                    className="project-image"
                    sx={{
                      transition: 'transform 0.3s ease',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <Box
                    className="project-image"
                    sx={{
                      height: '100%',
                      background: `linear-gradient(135deg, ${getStatusColor(project.status)}40, ${getStatusColor(project.status)}80)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.3s ease'
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        color: 'white',
                        fontWeight: 700,
                        textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                      }}
                    >
                      {project.title.charAt(0).toUpperCase()}
                    </Typography>
                  </Box>
                )}

                {/* Featured Badge */}
                {project.featured && (
                  <Chip
                    icon={<StarIcon />}
                    label="Featured"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                      color: 'white',
                      fontWeight: 600,
                      '& .MuiChip-icon': {
                        color: 'white'
                      }
                    }}
                  />
                )}

                {/* Menu Button */}
                <IconButton
                  onClick={(e) => handleMenuOpen(e, project.id)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 1)'
                    }
                  }}
                >
                  <MoreIcon />
                </IconButton>
              </Box>

              {/* Project Content */}
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 0.5,
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {project.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'grey.600',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.5
                    }}
                  >
                    {project.summary || project.description}
                  </Typography>
                </Box>

                {/* Status and Date */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Chip
                    label={project.status}
                    size="small"
                    sx={{
                      background: `${getStatusColor(project.status)}20`,
                      color: getStatusColor(project.status),
                      fontWeight: 600,
                      border: `1px solid ${getStatusColor(project.status)}40`
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <DateIcon sx={{ fontSize: 14, color: 'grey.500' }} />
                    <Typography variant="caption" sx={{ color: 'grey.500' }}>
                      {dayjs(project.last_updated).format('MMM DD')}
                    </Typography>
                  </Box>
                </Box>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    {project.tags.slice(0, 3).map((tag, i) => (
                      <Chip
                        key={i}
                        label={tag}
                        size="small"
                        sx={{
                          fontSize: '0.75rem',
                          height: 24,
                          background: `hsl(${tag.charCodeAt(0) * 137.5 % 360}, 60%, 95%)`,
                          color: `hsl(${tag.charCodeAt(0) * 137.5 % 360}, 60%, 30%)`,
                          border: `1px solid hsl(${tag.charCodeAt(0) * 137.5 % 360}, 60%, 80%)`
                        }}
                      />
                    ))}
                    {project.tags.length > 3 && (
                      <Chip
                        label={`+${project.tags.length - 3}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem', height: 24 }}
                      />
                    )}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Zoom>
        ))}
      </Box>

      {/* Empty State */}
      {filteredProjects.length === 0 && !loading && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            background: 'rgba(255, 255, 255, 0.5)',
            borderRadius: 4,
            border: '2px dashed rgba(0,0,0,0.1)'
          }}
        >
          <Typography variant="h6" sx={{ color: 'grey.500', mb: 1 }}>
            {searchTerm ? 'No projects found' : 'No projects yet'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'grey.400' }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first project to get started'}
          </Typography>
        </Box>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }
        }}
      >
        <MenuItem onClick={handleEdit} sx={{ gap: 2 }}>
          <EditIcon fontSize="small" />
          Edit Project
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ gap: 2, color: 'error.main' }}>
          <DeleteIcon fontSize="small" />
          Delete Project
        </MenuItem>
      </Menu>
    </Box>
  )
}
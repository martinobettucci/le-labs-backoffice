import React from 'react'
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Divider, 
  Stack,
  Avatar,
  IconButton,
  Link,
  Paper
} from '@mui/material'
import { 
  Close as CloseIcon,
  Star as StarIcon,
  CalendarToday as DateIcon,
  Link as LinkIcon,
  Update as UpdateIcon
} from '@mui/icons-material'
import { Project } from '../context/ProjectContext'
import dayjs from 'dayjs'

interface ProjectDetailsProps {
  project: Project
  onClose: () => void
}

export default function ProjectDetails({ project, onClose }: ProjectDetailsProps) {
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

  return (
    <Card
      sx={{
        borderRadius: 4,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        height: 'fit-content',
        maxHeight: '80vh',
        overflow: 'auto'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          position: 'relative',
          height: 200,
          backgroundImage: project.image ? `url(${project.image})` : 'none',
          backgroundColor: project.image ? 'transparent' : `${getStatusColor(project.status)}20`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: project.image 
              ? 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))'
              : 'transparent'
          }}
        />
        
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              background: 'rgba(255, 255, 255, 1)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Featured Badge */}
        {project.featured && (
          <Chip
            icon={<StarIcon />}
            label="Featured"
            size="small"
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              color: 'white',
              fontWeight: 600,
              '& .MuiChip-icon': {
                color: 'white'
              }
            }}
          />
        )}

        {/* Title Overlay */}
        {!project.image && (
          <Typography
            variant="h2"
            sx={{
              color: getStatusColor(project.status),
              fontWeight: 800,
              opacity: 0.3,
              textAlign: 'center',
              zIndex: 1
            }}
          >
            {project.title.charAt(0).toUpperCase()}
          </Typography>
        )}
      </Box>

      <CardContent sx={{ p: 4 }}>
        {/* Title and Status */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 1,
              color: 'grey.900'
            }}
          >
            {project.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
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
            <Typography variant="caption" sx={{ color: 'grey.500' }}>
              ID: {project.id}
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: 'grey.600',
              fontFamily: 'monospace',
              fontSize: '0.85rem'
            }}
          >
            /{project.slug}
          </Typography>
        </Box>

        {/* Summary */}
        {project.summary && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="body1"
              sx={{
                color: 'grey.700',
                lineHeight: 1.6,
                fontStyle: 'italic'
              }}
            >
              {project.summary}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Description */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              mb: 1,
              color: 'grey.800',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.75rem'
            }}
          >
            Description
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'grey.600',
              lineHeight: 1.6
            }}
          >
            {project.description}
          </Typography>
        </Box>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: 'grey.800',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem'
              }}
            >
              Tags
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              {project.tags.map((tag, i) => (
                <Chip
                  key={i}
                  label={tag}
                  size="small"
                  sx={{
                    background: `hsl(${tag.charCodeAt(0) * 137.5 % 360}, 60%, 95%)`,
                    color: `hsl(${tag.charCodeAt(0) * 137.5 % 360}, 60%, 30%)`,
                    border: `1px solid hsl(${tag.charCodeAt(0) * 137.5 % 360}, 60%, 80%)`,
                    fontWeight: 500,
                    mb: 1
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Dates */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: 'grey.800',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.75rem'
            }}
          >
            Timeline
          </Typography>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DateIcon sx={{ fontSize: 16, color: 'grey.500' }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Last Updated
                </Typography>
                <Typography variant="caption" sx={{ color: 'grey.500' }}>
                  {dayjs(project.last_updated).format('MMMM DD, YYYY [at] HH:mm')}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <UpdateIcon sx={{ fontSize: 16, color: 'grey.500' }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Last Modified
                </Typography>
                <Typography variant="caption" sx={{ color: 'grey.500' }}>
                  {dayjs(project.last_modified).format('MMMM DD, YYYY [at] HH:mm')}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* Links */}
        {project.links && Object.keys(project.links).length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: 'grey.800',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem'
              }}
            >
              Links
            </Typography>
            <Stack spacing={1}>
              {Object.entries(project.links).map(([key, url]) => (
                <Paper
                  key={key}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: 'rgba(0,0,0,0.02)',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        background: `hsl(${key.charCodeAt(0) * 137.5 % 360}, 60%, 90%)`,
                        color: `hsl(${key.charCodeAt(0) * 137.5 % 360}, 60%, 30%)`
                      }}
                    >
                      <LinkIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          mb: 0.5
                        }}
                      >
                        {key}
                      </Typography>
                      <Link
                        href={url}
                        target="_blank"
                        rel="noopener"
                        sx={{
                          fontSize: '0.8rem',
                          color: 'primary.main',
                          textDecoration: 'none',
                          wordBreak: 'break-all',
                          '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        {url}
                      </Link>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}

        {/* Updates */}
        {project.updates && project.updates.length > 0 && (
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: 'grey.800',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem'
              }}
            >
              Recent Updates
            </Typography>
            <Stack spacing={2}>
              {project.updates.slice(0, 3).map((update, i) => (
                <Paper
                  key={update.hash || i}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: 'rgba(0,0,0,0.02)',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      mb: 1
                    }}
                  >
                    {update.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'grey.600',
                      mb: 1,
                      lineHeight: 1.5
                    }}
                  >
                    {update.content}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'grey.500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <DateIcon sx={{ fontSize: 12 }} />
                    {dayjs(update.date).format('MMM DD, YYYY')}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
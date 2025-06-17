import React from 'react'
import { Box, Card, CardContent, Typography, Avatar, Stack, LinearProgress } from '@mui/material'
import { 
  Folder as ProjectIcon,
  Star as FeaturedIcon, 
  TrendingUp as ActiveIcon,
  Schedule as DraftIcon
} from '@mui/icons-material'
import { useProjects } from '../context/ProjectContext'

export default function DashboardStats() {
  const { projects, loading } = useProjects()

  const stats = React.useMemo(() => {
    if (loading || !projects.length) return null

    const total = projects.length
    const featured = projects.filter(p => p.featured).length
    const active = projects.filter(p => p.status?.toLowerCase() === 'active').length
    const draft = projects.filter(p => p.status?.toLowerCase() === 'draft').length

    return { total, featured, active, draft }
  }, [projects, loading])

  if (loading || !stats) {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3
        }}
      >
        {[...Array(4)].map((_, i) => (
          <Card key={i} sx={{ borderRadius: 4, p: 2 }}>
            <LinearProgress sx={{ borderRadius: 2 }} />
          </Card>
        ))}
      </Box>
    )
  }

  const statCards = [
    {
      title: 'Total Projects',
      value: stats.total,
      icon: ProjectIcon,
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Featured',
      value: stats.featured,
      icon: FeaturedIcon,
      color: '#f093fb',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      title: 'Active',
      value: stats.active,
      icon: ActiveIcon,
      color: '#4facfe',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      title: 'Draft',
      value: stats.draft,
      icon: DraftIcon,
      color: '#43e97b',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    }
  ]

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3
      }}
    >
      {statCards.map((stat, index) => (
        <Card
          key={stat.title}
          sx={{
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            position: 'relative',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 15px 40px rgba(0,0,0,0.15)'
            }
          }}
        >
          {/* Background Gradient */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: stat.gradient
            }}
          />
          
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    background: stat.gradient,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 0.5
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'grey.600',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '0.75rem'
                  }}
                >
                  {stat.title}
                </Typography>
              </Box>
              
              <Avatar
                sx={{
                  background: stat.gradient,
                  width: 48,
                  height: 48,
                  boxShadow: `0 8px 20px ${stat.color}30`
                }}
              >
                <stat.icon sx={{ color: 'white' }} />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}
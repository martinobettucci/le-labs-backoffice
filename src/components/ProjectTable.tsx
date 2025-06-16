import * as React from 'react'
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useProjects } from '../context/ProjectContext'
import { Box, Chip, Typography, Paper, Alert } from '@mui/material'
import dayjs from 'dayjs'

export default function ProjectTable({ onEdit, onViewDetails }) {
  const { projects, loading, deleteProject, error } = useProjects()

  const columns: GridColDef[] = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'title', 
      headerName: 'Title', 
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'slug', 
      headerName: 'Slug', 
      width: 160,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          sx={{
            bgcolor: `hsl(${params.value?.charCodeAt(0) * 137.5 % 360}, 70%, 90%)`,
            color: `hsl(${params.value?.charCodeAt(0) * 137.5 % 360}, 70%, 30%)`,
            fontWeight: 600,
            borderRadius: 2
          }}
        />
      )
    },
    { 
      field: 'featured', 
      headerName: 'Featured', 
      width: 90, 
      type: 'boolean',
      renderCell: (params) => (
        <Chip 
          label={params.value ? 'Yes' : 'No'} 
          size="small"
          color={params.value ? 'primary' : 'default'}
          variant={params.value ? 'filled' : 'outlined'}
        />
      )
    },
    { 
      field: 'tags', 
      headerName: 'Tags', 
      width: 200, 
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, py: 0.5 }}>
          {(params.value || []).slice(0, 2).map((tag: string) => (
            <Chip 
              key={tag} 
              label={tag} 
              size="small" 
              sx={{
                bgcolor: `hsl(${tag.charCodeAt(0) * 137.5 % 360}, 60%, 90%)`,
                color: `hsl(${tag.charCodeAt(0) * 137.5 % 360}, 60%, 30%)`,
                fontSize: '0.7rem',
                height: 20
              }}
            />
          ))}
          {(params.value || []).length > 2 && (
            <Chip 
              label={`+${(params.value || []).length - 2}`} 
              size="small" 
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
        </Box>
      )
    },
    { 
      field: 'last_updated', 
      headerName: 'Last Updated', 
      width: 140, 
      valueFormatter: (params) => dayjs(params.value).format('MMM DD, YYYY'),
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {dayjs(params.value).format('MMM DD, YYYY')}
        </Typography>
      )
    },
    { 
      field: 'image', 
      headerName: 'Image', 
      width: 80, 
      renderCell: (params) => (
        params.value ? (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: 1
            }}
          >
            <img 
              src={params.value} 
              alt="img" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover' 
              }} 
            />
          </Box>
        ) : (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: 'grey.200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="caption" sx={{ color: 'grey.500' }}>
              No img
            </Typography>
          </Box>
        )
      )
    },
    { 
      field: 'actions', 
      type: 'actions', 
      headerName: 'Actions', 
      width: 120, 
      getActions: (params) => [
        <GridActionsCellItem
          icon={<VisibilityIcon />}
          label="View Details"
          onClick={() => onViewDetails?.(params.row)}
          showInMenu={false}
        />,
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => onEdit(params.row)}
          showInMenu={false}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => {
            if (window.confirm(`Delete project "${params.row.title}"?`)) {
              deleteProject(params.row.id)
            }
          }}
          showInMenu={false}
        />
      ]
    }
  ]

  return (
    <Paper
      sx={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        borderRadius: 3,
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        Projects Overview
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      
      <div style={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        overflow: 'auto'
      }}>
        <DataGrid
          rows={projects}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 }
            }
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          autoHeight={false}
          sx={{
            minHeight: 400,
            height: '100%',
            borderRadius: 2,
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderColor: 'rgba(0,0,0,0.05)'
            },
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: 'grey.50',
              fontWeight: 600,
              fontSize: '0.9rem'
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: 'rgba(103, 126, 234, 0.05)'
            },
            '& .MuiDataGrid-virtualScroller': {
              overflowX: 'auto',
              scrollbarWidth: 'thin'
            }
          }}
        />
      </div>
    </Paper>
  )
}
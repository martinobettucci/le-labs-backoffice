import * as React from 'react'
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useProjects } from '../context/ProjectContext'
import { Box, Chip, Typography } from '@mui/material'
import dayjs from 'dayjs'

export default function ProjectTable({ onEdit }) {
  const { projects, loading, deleteProject, error } = useProjects()

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 120 },
    { field: 'title', headerName: 'Title', width: 200 },
    { field: 'slug', headerName: 'Slug', width: 160 },
    { field: 'status', headerName: 'Status', width: 110 },
    { field: 'featured', headerName: 'Featured', width: 90, type: 'boolean' },
    { field: 'tags', headerName: 'Tags', width: 180, renderCell: (params) => (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {(params.value || []).map((tag: string) => (
          <Chip key={tag} label={tag} size="small" />
        ))}
      </Box>
    ) },
    { field: 'last_updated', headerName: 'Last Updated', width: 140, valueFormatter: (params) => dayjs(params.value).format('YYYY-MM-DD') },
    { field: 'image', headerName: 'Image', width: 80, renderCell: (params) => (
      params.value ? <img src={params.value} alt="img" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} /> : null
    ) },
    { field: 'actions', type: 'actions', headerName: 'Actions', width: 100, getActions: (params) => [
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
          if (window.confirm('Delete this project?')) deleteProject(params.row.id)
        }}
        showInMenu={false}
      />
    ] }
  ]

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 2,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <Typography variant="h5" sx={{ mb: 2 }}>Projects</Typography>
      {error && <Typography color="error">{error}</Typography>}
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
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          autoHeight={false}
          sx={{
            minHeight: 400,
            height: '100%',
            borderRadius: 2,
            background: '#fff',
            '& .MuiDataGrid-virtualScroller': {
              overflowX: 'auto',
              scrollbarWidth: 'thin'
            }
          }}
        />
      </div>
    </Box>
  )
}

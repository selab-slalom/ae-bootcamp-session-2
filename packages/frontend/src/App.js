import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  CssBaseline,
  IconButton,
  TextField,
  ThemeProvider,
  Tooltip,
  Typography,
  createTheme,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import './App.css';

const theme = createTheme({
  palette: {
    primary: { main: '#FF7034', dark: '#E65B24', contrastText: '#202927' },
    secondary: { main: '#17635A', dark: '#104D46', contrastText: '#FFFFFF' },
    background: { default: '#F3F7F5', paper: '#FFFFFF' },
    text: { primary: '#202927', secondary: '#5F6C68' },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
    h1: { fontFamily: 'Georgia, serif', fontWeight: 700 },
    h2: { fontFamily: 'Georgia, serif', fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, textTransform: 'none', fontWeight: 700 },
        containedPrimary: { '&:hover': { backgroundColor: '#E65B24' } },
        containedSecondary: { '&:hover': { backgroundColor: '#104D46' } },
      },
    },
  },
});

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || 'The request could not be completed');
  }

  return result;
};

const formatDueDate = dueDate => new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
}).format(new Date(`${dueDate}T00:00:00.000Z`));

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ name: '', due_date: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingItemId, setPendingItemId] = useState(null);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const result = await requestJson('/api/items');
        setItems(result);
      } catch (requestError) {
        setError(`Failed to load tasks: ${requestError.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  const handleSubmit = async event => {
    event.preventDefault();
    if (!newName.trim()) return;

    setIsSubmitting(true);
    setError('');
    try {
      const item = await requestJson('/api/items', {
        method: 'POST',
        body: JSON.stringify({
          name: newName.trim(),
          due_date: newDueDate || null,
        }),
      });
      setItems(currentItems => [item, ...currentItems]);
      setNewName('');
      setNewDueDate('');
    } catch (requestError) {
      setError(`Could not add task: ${requestError.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = item => {
    setEditingId(item.id);
    setEditValues({ name: item.name, due_date: item.due_date || '' });
    setError('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({ name: '', due_date: '' });
  };

  const handleSaveEdit = async event => {
    event.preventDefault();
    const name = editValues.name.trim();
    if (!name || editingId === null) return;

    const itemId = editingId;
    setPendingItemId(itemId);
    setError('');
    try {
      const item = await requestJson(`/api/items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          due_date: editValues.due_date || null,
        }),
      });
      setItems(currentItems => currentItems.map(existingItem => (
        existingItem.id === itemId ? item : existingItem
      )));
      cancelEditing();
    } catch (requestError) {
      setError(`Could not save task: ${requestError.message}`);
    } finally {
      setPendingItemId(null);
    }
  };

  const handleDelete = async itemId => {
    setPendingItemId(itemId);
    setError('');
    try {
      await requestJson(`/api/items/${itemId}`, { method: 'DELETE' });
      setItems(currentItems => currentItems.filter(item => item.id !== itemId));
      if (editingId === itemId) cancelEditing();
    } catch (requestError) {
      setError(`Could not delete task: ${requestError.message}`);
    } finally {
      setPendingItemId(null);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-shell">
        <header className="app-header">
          <span className="app-kicker">TASKS / 01</span>
          <Typography component="h1" variant="h1">To do</Typography>
        </header>

        <main className="app-content">
          {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

          <Box
            component="form"
            className="task-create"
            aria-label="Add task"
            onSubmit={handleSubmit}
          >
            <div className="section-heading">
              <Typography component="h2" variant="h2">New task</Typography>
            </div>
            <div className="create-fields">
              <TextField
                label="Task name"
                value={newName}
                onChange={event => setNewName(event.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Due date"
                type="date"
                value={newDueDate}
                onChange={event => setNewDueDate(event.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<AddRoundedIcon />}
                disabled={!newName.trim() || isSubmitting}
              >
                Add task
              </Button>
            </div>
          </Box>

          <section className="task-list-section" aria-labelledby="task-list-title">
            <div className="section-heading task-list-heading">
              <Typography id="task-list-title" component="h2" variant="h2">Tasks</Typography>
              <span className="task-count">{items.length} {items.length === 1 ? 'task' : 'tasks'}</span>
            </div>

            {loading ? (
              <div className="loading-state" role="status">
                <CircularProgress size={24} />
                <span>Loading tasks</span>
              </div>
            ) : items.length === 0 ? (
              <p className="empty-state">No tasks yet</p>
            ) : (
              <ul className="task-list">
                {items.map(item => (
                  <li className="task-row" key={item.id}>
                    {editingId === item.id ? (
                      <Box
                        component="form"
                        className="task-edit-form"
                        aria-label={`Edit ${item.name}`}
                        onSubmit={handleSaveEdit}
                      >
                        <TextField
                          label="Task name"
                          value={editValues.name}
                          onChange={event => setEditValues(values => ({
                            ...values,
                            name: event.target.value,
                          }))}
                          required
                          autoFocus
                          fullWidth
                        />
                        <TextField
                          label="Due date"
                          type="date"
                          value={editValues.due_date}
                          onChange={event => setEditValues(values => ({
                            ...values,
                            due_date: event.target.value,
                          }))}
                          InputLabelProps={{ shrink: true }}
                        />
                        <Tooltip title="Save task">
                          <span>
                            <IconButton
                              type="submit"
                              aria-label={`Save ${item.name}`}
                              color="secondary"
                              disabled={!editValues.name.trim() || pendingItemId === item.id}
                            >
                              <SaveOutlinedIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Cancel editing">
                          <IconButton
                            type="button"
                            aria-label={`Cancel editing ${item.name}`}
                            onClick={cancelEditing}
                            disabled={pendingItemId === item.id}
                          >
                            <CloseRoundedIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <>
                        <div className="task-details">
                          <Typography component="p" className="task-name">{item.name}</Typography>
                          <span className="task-due-date">
                            <CalendarMonthOutlinedIcon fontSize="small" />
                            {item.due_date ? formatDueDate(item.due_date) : 'No due date'}
                          </span>
                        </div>
                        <div className="task-actions">
                          <Tooltip title="Edit task">
                            <IconButton
                              type="button"
                              aria-label={`Edit ${item.name}`}
                              onClick={() => startEditing(item)}
                              disabled={pendingItemId === item.id}
                            >
                              <EditOutlinedIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete task">
                            <IconButton
                              type="button"
                              aria-label={`Delete ${item.name}`}
                              onClick={() => handleDelete(item.id)}
                              disabled={pendingItemId === item.id}
                              className="delete-action"
                            >
                              <DeleteOutlineRoundedIcon />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
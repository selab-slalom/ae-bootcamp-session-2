import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

let mockItems;
let nextItemId;
let postRequests;
let patchRequests;

const server = setupServer(
  rest.get('/api/items', (req, res, ctx) => res(ctx.json(mockItems))),
  rest.post('/api/items', (req, res, ctx) => {
    postRequests += 1;
    const item = {
      id: nextItemId++,
      name: req.body.name,
      due_date: req.body.due_date || null,
      created_at: new Date().toISOString(),
    };
    mockItems.unshift(item);
    return res(ctx.status(201), ctx.json(item));
  }),
  rest.patch('/api/items/:id', (req, res, ctx) => {
    patchRequests += 1;
    const item = mockItems.find(candidate => String(candidate.id) === req.params.id);
    if (!item) return res(ctx.status(404), ctx.json({ error: 'Item not found' }));

    Object.assign(item, req.body);
    return res(ctx.json(item));
  }),
  rest.delete('/api/items/:id', (req, res, ctx) => {
    mockItems = mockItems.filter(item => String(item.id) !== req.params.id);
    return res(ctx.json({ message: 'Item deleted successfully' }));
  })
);

beforeAll(() => server.listen());
beforeEach(() => {
  mockItems = [
    {
      id: 2,
      name: 'Test Item 2',
      due_date: '2026-10-20',
      created_at: '2026-01-02T00:00:00.000Z',
    },
    {
      id: 1,
      name: 'Test Item 1',
      due_date: null,
      created_at: '2026-01-01T00:00:00.000Z',
    },
  ];
  nextItemId = 3;
  postRequests = 0;
  patchRequests = 0;
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component', () => {
  test('renders the app title', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'To do' })).toBeInTheDocument();
  });

  test('loads and displays items', async () => {
    render(<App />);

    expect(await screen.findByText('Test Item 1')).toBeInTheDocument();
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    expect(screen.getByText('Oct 20, 2026')).toBeInTheDocument();
  });

  test('adds a task with a due date at the top of the list', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('textbox', { name: 'Task name' }), 'New Test Item');
    fireEvent.change(screen.getByLabelText('Due date'), { target: { value: '2026-11-05' } });
    await user.click(screen.getByRole('button', { name: 'Add task' }));

    await waitFor(() => {
      expect(screen.getByText('New Test Item')).toBeInTheDocument();
    });
    expect(mockItems[0]).toMatchObject({
      name: 'New Test Item',
      due_date: '2026-11-05',
    });
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('New Test Item');
  });

  test('does not submit a task with an empty name', async () => {
    render(<App />);
    await screen.findByText('Test Item 1');

    fireEvent.submit(screen.getByRole('form', { name: 'Add task' }));

    expect(postRequests).toBe(0);
  });

  test('shows an error and re-enables the form when task creation fails', async () => {
    const user = userEvent.setup();
    server.use(
      rest.post('/api/items', (req, res, ctx) => (
        res(ctx.status(500), ctx.json({ error: 'create failed' }))
      ))
    );
    render(<App />);

    await user.type(screen.getByRole('textbox', { name: 'Task name' }), 'Failed task');
    await user.click(screen.getByRole('button', { name: 'Add task' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not add task: create failed');
    expect(screen.getByRole('button', { name: 'Add task' })).toBeEnabled();
  });

  test('edits a task name and due date', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Test Item 2');

    await user.click(screen.getByRole('button', { name: 'Edit Test Item 2' }));
    const taskNameFields = screen.getAllByRole('textbox', { name: 'Task name' });
    await user.clear(taskNameFields[1]);
    await user.type(taskNameFields[1], 'Updated Task');
    const dueDateFields = screen.getAllByLabelText('Due date');
    fireEvent.change(dueDateFields[1], { target: { value: '2026-11-12' } });
    await user.click(screen.getByRole('button', { name: 'Save Test Item 2' }));

    expect(await screen.findByText('Updated Task')).toBeInTheDocument();
    expect(screen.getByText('Nov 12, 2026')).toBeInTheDocument();
  });

  test('does not save a blank edit and can cancel editing', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Test Item 2');

    await user.click(screen.getByRole('button', { name: 'Edit Test Item 2' }));
    const nameField = screen.getAllByRole('textbox', { name: 'Task name' })[1];
    await user.clear(nameField);
    fireEvent.submit(screen.getByRole('form', { name: 'Edit Test Item 2' }));

    expect(patchRequests).toBe(0);
    expect(screen.getByRole('button', { name: 'Save Test Item 2' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Cancel editing Test Item 2' }));
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();
  });

  test('keeps edit mode and shows an error when saving fails', async () => {
    const user = userEvent.setup();
    server.use(
      rest.patch('/api/items/:id', (req, res, ctx) => (
        res(ctx.status(500), ctx.json({ error: 'save failed' }))
      ))
    );
    render(<App />);
    await screen.findByText('Test Item 2');

    await user.click(screen.getByRole('button', { name: 'Edit Test Item 2' }));
    await user.click(screen.getByRole('button', { name: 'Save Test Item 2' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not save task: save failed');
    expect(screen.getByRole('button', { name: 'Save Test Item 2' })).toBeInTheDocument();
  });

  test('deletes a task', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Test Item 1');

    await user.click(screen.getByRole('button', { name: 'Delete Test Item 1' }));

    await waitFor(() => {
      expect(screen.queryByText('Test Item 1')).not.toBeInTheDocument();
    });
    expect(mockItems.map(item => item.name)).not.toContain('Test Item 1');
  });

  test('keeps a task and shows an error when deletion fails', async () => {
    const user = userEvent.setup();
    server.use(
      rest.delete('/api/items/:id', (req, res, ctx) => (
        res(ctx.status(500), ctx.json({ error: 'delete failed' }))
      ))
    );
    render(<App />);
    await screen.findByText('Test Item 1');

    await user.click(screen.getByRole('button', { name: 'Delete Test Item 1' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not delete task: delete failed');
    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
  });

  test('handles API error', async () => {
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load tasks/)).toBeInTheDocument();
    });
  });

  test('shows empty state when no items', async () => {
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    });
  });
});
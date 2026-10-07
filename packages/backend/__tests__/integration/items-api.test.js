const request = require('supertest');
const { app, db } = require('../../src/app');

const clearItems = () => db.prepare('DELETE FROM items').run();

const createItem = async (name, dueDate) => request(app)
  .post('/api/items')
  .send({ name, due_date: dueDate });

const triggerNames = ['fail_insert', 'fail_update', 'fail_delete', 'ignore_delete'];

beforeEach(clearItems);
afterEach(() => {
  triggerNames.forEach(name => db.exec(`DROP TRIGGER IF EXISTS ${name}`));
  clearItems();
});
afterAll(() => db.close());

describe('Items API integration', () => {
  test('returns a successful health check', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      message: 'Backend server is running',
    });
  });

  test('creates items with a due date', async () => {
    const response = await createItem('Submit report', '2026-10-15');

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      name: 'Submit report',
      due_date: '2026-10-15',
    });
  });

  test('rejects invalid due dates when creating items', async () => {
    const response = await createItem('Submit report', '2026-02-30');

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/valid YYYY-MM-DD date/);
  });

  test('rejects non-string due dates and non-string task names', async () => {
    const invalidDueDate = await createItem('Submit report', 42);
    const invalidName = await request(app).post('/api/items').send({ name: 42 });

    expect(invalidDueDate.status).toBe(400);
    expect(invalidDueDate.body.error).toMatch(/valid YYYY-MM-DD date/);
    expect(invalidName.status).toBe(400);
    expect(invalidName.body.error).toBe('Item name is required');
  });

  test('rejects invalid and unsafe task IDs when updating', async () => {
    const invalidId = await request(app).patch('/api/items/not-an-id').send({ name: 'Task' });
    const unsafeId = await request(app).patch('/api/items/9007199254740992').send({ name: 'Task' });

    expect(invalidId.status).toBe(400);
    expect(unsafeId.status).toBe(400);
  });

  test('updates an item name and due date', async () => {
    const created = await createItem('Draft report', null);
    const response = await request(app)
      .patch(`/api/items/${created.body.id}`)
      .send({ name: 'Review report', due_date: '2026-10-20' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: created.body.id,
      name: 'Review report',
      due_date: '2026-10-20',
    });
  });

  test('allows clearing an item due date', async () => {
    const created = await createItem('Draft report', '2026-10-15');
    const response = await request(app)
      .patch(`/api/items/${created.body.id}`)
      .send({ due_date: null });

    expect(response.status).toBe(200);
    expect(response.body.due_date).toBeNull();
  });

  test('rejects updates with no fields and updates to missing items', async () => {
    const emptyUpdate = await request(app).patch('/api/items/1').send({});
    expect(emptyUpdate.status).toBe(404);

    const created = await createItem('Draft report', null);
    const missingFieldUpdate = await request(app)
      .patch(`/api/items/${created.body.id}`)
      .send({});

    expect(missingFieldUpdate.status).toBe(400);
  });

  test('lists the newest item first with deterministic tie ordering', async () => {
    await createItem('Earlier task', null);
    const newest = await createItem('Newest task', null);

    const response = await request(app).get('/api/items');

    expect(response.status).toBe(200);
    expect(response.body.map(item => item.name)).toEqual([
      'Newest task',
      'Earlier task',
    ]);
    expect(response.body[0].id).toBe(newest.body.id);
  });

  test('returns server errors when database operations fail', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const item = await createItem('Temporary task', null);
    try {
      db.exec(`CREATE TRIGGER fail_insert BEFORE INSERT ON items
        BEGIN SELECT RAISE(ABORT, 'forced insert error'); END`);
      const createResponse = await createItem('Cannot be created', null);
      expect(createResponse.status).toBe(500);
      db.exec('DROP TRIGGER fail_insert');

      db.exec(`CREATE TRIGGER fail_update BEFORE UPDATE ON items
        BEGIN SELECT RAISE(ABORT, 'forced update error'); END`);
      const updateResponse = await request(app)
        .patch(`/api/items/${item.body.id}`)
        .send({ name: 'Cannot be updated' });
      expect(updateResponse.status).toBe(500);
      db.exec('DROP TRIGGER fail_update');

      db.exec(`CREATE TRIGGER fail_delete BEFORE DELETE ON items
        BEGIN SELECT RAISE(ABORT, 'forced delete error'); END`);
      const deleteResponse = await request(app).delete(`/api/items/${item.body.id}`);
      expect(deleteResponse.status).toBe(500);
      db.exec('DROP TRIGGER fail_delete');

      db.exec('ALTER TABLE items RENAME TO temporarily_unavailable_items');
      try {
        const listResponse = await request(app).get('/api/items');
        expect(listResponse.status).toBe(500);
      } finally {
        db.exec('ALTER TABLE temporarily_unavailable_items RENAME TO items');
      }
    } finally {
      errorSpy.mockRestore();
    }
  });

  test('returns not found when a delete changes no rows', async () => {
    const item = await createItem('Protected task', null);
    db.exec(`CREATE TRIGGER ignore_delete BEFORE DELETE ON items
      BEGIN SELECT RAISE(IGNORE); END`);

    const response = await request(app).delete(`/api/items/${item.body.id}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Item not found');
  });
});
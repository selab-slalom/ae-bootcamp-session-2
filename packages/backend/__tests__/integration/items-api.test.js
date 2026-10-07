const request = require('supertest');
const { app, db } = require('../../src/app');

const clearItems = () => db.prepare('DELETE FROM items').run();

const createItem = async (name, dueDate) => request(app)
  .post('/api/items')
  .send({ name, due_date: dueDate });

beforeEach(clearItems);
afterEach(clearItems);
afterAll(() => db.close());

describe('Items API integration', () => {
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
});
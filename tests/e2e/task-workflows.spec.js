const { test, expect } = require('@playwright/test');
const { TasksPage } = require('./pages/tasks-page');

let tasksPage;

test.beforeEach(async ({ page }) => {
  tasksPage = new TasksPage(page);
  await tasksPage.goto();
});

test('creates a task with a due date at the top of the list', async () => {
  const name = `e2e-add-${Date.now()}`;
  try {
    await tasksPage.addTask(name, '2026-10-15');
    await expect(tasksPage.taskRow(name)).toContainText('Oct 15, 2026');
    expect(await tasksPage.firstTaskName()).toBe(name);
  } finally {
    await tasksPage.deleteIfPresent(name);
  }
});

test('edits a task name and due date', async () => {
  const name = `e2e-edit-${Date.now()}`;
  const updatedName = `${name}-updated`;
  try {
    await tasksPage.addTask(name, '2026-10-16');
    await tasksPage.editTask(name, updatedName, '2026-10-22');
    await expect(tasksPage.taskRow(updatedName)).toContainText('Oct 22, 2026');
  } finally {
    await tasksPage.deleteIfPresent(updatedName);
    await tasksPage.deleteIfPresent(name);
  }
});

test('deletes a task', async () => {
  const name = `e2e-delete-${Date.now()}`;
  try {
    await tasksPage.addTask(name);
    await tasksPage.deleteTask(name);
    await expect(tasksPage.taskRow(name)).toHaveCount(0);
  } finally {
    await tasksPage.deleteIfPresent(name);
  }
});

test('shows tasks in newest-created-first order', async () => {
  const earlierName = `e2e-order-earlier-${Date.now()}`;
  const newerName = `e2e-order-newer-${Date.now()}`;
  try {
    await tasksPage.addTask(earlierName);
    await tasksPage.addTask(newerName);
    expect(await tasksPage.firstTaskName()).toBe(newerName);
  } finally {
    await tasksPage.deleteIfPresent(newerName);
    await tasksPage.deleteIfPresent(earlierName);
  }
});

test('clears a due date while editing a task', async () => {
  const name = `e2e-clear-date-${Date.now()}`;
  const updatedName = `${name}-updated`;
  try {
    await tasksPage.addTask(name, '2026-10-18');
    await tasksPage.editTask(name, updatedName, '');
    await expect(tasksPage.taskRow(updatedName)).toContainText('No due date');
  } finally {
    await tasksPage.deleteIfPresent(updatedName);
    await tasksPage.deleteIfPresent(name);
  }
});
const { expect } = require('@playwright/test');

class TasksPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.page.getByRole('heading', { name: 'Tasks' })).toBeVisible();
  }

  taskRow(name) {
    return this.page.locator('.task-row').filter({ hasText: name });
  }

  async addTask(name, dueDate = '') {
    await this.page.getByRole('textbox', { name: 'Task name' }).fill(name);
    if (dueDate) {
      await this.page.getByLabel('Due date').fill(dueDate);
    }
    await this.page.getByRole('button', { name: 'Add task' }).click();
    await expect(this.taskRow(name)).toBeVisible();
  }

  async editTask(name, updatedName, dueDate) {
    const row = this.taskRow(name);
    await row.getByRole('button', { name: `Edit ${name}` }).click();
    await this.page.getByRole('textbox', { name: 'Task name' }).last().fill(updatedName);
    await this.page.getByLabel('Due date').last().fill(dueDate);
    await this.page.getByRole('button', { name: `Save ${name}` }).click();
    await expect(this.taskRow(updatedName)).toBeVisible();
  }

  async deleteTask(name) {
    const row = this.taskRow(name);
    await row.getByRole('button', { name: `Delete ${name}` }).click();
    await expect(row).toHaveCount(0);
  }

  async deleteIfPresent(name) {
    const row = this.taskRow(name);
    if (await row.count()) {
      await this.deleteTask(name);
    }
  }

  async firstTaskName() {
    return this.page.locator('.task-name').first().textContent();
  }
}

module.exports = { TasksPage };
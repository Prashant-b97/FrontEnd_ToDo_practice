import { test, expect } from '@playwright/test';

const NEW_TASK_TITLE = 'Automate UI checks with Playwright';
const NEW_TASK_NOTES = 'Ensure add, toggle, edit, export flows stay stable.';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto('/');
});

test('renders seeded tasks and allows creating a new one', async ({ page }) => {
  const seededTasks = page.locator('.task-item');
  await expect(seededTasks).toHaveCount(2);

  await page.fill('#task-title', NEW_TASK_TITLE);
  await page.fill('#task-notes', NEW_TASK_NOTES);
  await page.click('button:has-text("Add Task")');

  const createdTask = page.locator('.task-item').filter({ hasText: NEW_TASK_TITLE });
  await expect(createdTask).toBeVisible();
  await expect(createdTask.locator('.task-notes')).toHaveText(NEW_TASK_NOTES);
});

test('supports completing and editing a task', async ({ page }) => {
  await page.fill('#task-title', 'Complete-and-edit flow');
  await page.click('button:has-text("Add Task")');

  const target = page.locator('.task-item').filter({ hasText: 'Complete-and-edit flow' }).first();
  const taskId = await target.getAttribute('data-id');
  if (!taskId) {
    throw new Error('Expected the newly created task to expose a data-id attribute.');
  }

  const checkbox = target.locator('input[type="checkbox"]');
  await checkbox.check();
  await expect(target).toHaveClass(/completed/);

  await target.locator('.edit').click();
  const dialog = page.locator('#edit-dialog');
  await expect(dialog).toBeVisible();
  await page.fill('#edit-title', 'Edited focus item');
  await page.click('#edit-form button:has-text("Save changes")');

  const updatedTask = page.locator(`.task-item[data-id="${taskId}"]`);
  await expect(updatedTask.locator('.task-title')).toHaveText('Edited focus item');
});

test('theme toggle updates the label and body data attribute', async ({ page }) => {
  const toggle = page.locator('#theme-toggle');
  const initialLabel = await toggle.textContent();
  const initialTheme = await page.locator('body').getAttribute('data-theme');

  await toggle.click();
  await expect(toggle).not.toHaveText(initialLabel ?? '');

  const updatedTheme = await page.locator('body').getAttribute('data-theme');
  expect(updatedTheme).not.toBe(initialTheme);
});

test('export produces a downloadable JSON snapshot', async ({ page }) => {
  await page.fill('#task-title', 'Export validation task');
  await page.click('button:has-text("Add Task")');

  const downloadPromise = page.waitForEvent('download');
  await page.click('#export-tasks');
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/focusflow-tasks/);
  await expect(page.locator('#summary-meta')).toContainText('Export ready');

  await download.delete();
});

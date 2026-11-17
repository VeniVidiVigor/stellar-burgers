import { expect, test } from '@playwright/test';

import type { Locator, Page } from '@playwright/test';

const BUN_NAME = 'Краторная булка N-200i';
const SECOND_BUN_NAME = 'Флюоресцентная булка R2-D3';
const MAIN_NAME = 'Биокотлета из марсианской Магнолии';
const SAUCE_NAME = 'Соус Spicy-X';

const getIngredientsSection = (page: Page): Locator => page.locator('section').first();

const getConstructorSection = (page: Page): Locator => page.locator('section').last();

const addIngredient = async (page: Page, name: string): Promise<void> => {
  await getIngredientsSection(page)
    .getByRole('listitem')
    .filter({ hasText: name })
    .getByText('Добавить')
    .click();
};

test.describe('add ingredients to constructor works correctly', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR('tests/mocks/ingredients.har', {
      url: '**/api/ingredients',
      notFound: 'abort',
    });

    await page.goto('/');

    await expect(getIngredientsSection(page).getByText(BUN_NAME)).toBeVisible();
  });

  test('constructor is empty before adding ingredients', async ({ page }) => {
    const burgerConstructor = getConstructorSection(page);

    await expect(burgerConstructor.getByText('Выберите булки')).toHaveCount(2);
    await expect(burgerConstructor.getByText('Выберите начинку')).toBeVisible();
  });

  test('adds a bun to the constructor', async ({ page }) => {
    await addIngredient(page, BUN_NAME);

    const burgerConstructor = getConstructorSection(page);

    await expect(burgerConstructor.getByText(`${BUN_NAME} (верх)`)).toBeVisible();
    await expect(burgerConstructor.getByText(`${BUN_NAME} (низ)`)).toBeVisible();
    await expect(burgerConstructor.getByText('Выберите булки')).toHaveCount(0);
  });

  test('replaces the bun when another bun is added', async ({ page }) => {
    await addIngredient(page, BUN_NAME);
    await addIngredient(page, SECOND_BUN_NAME);

    const burgerConstructor = getConstructorSection(page);

    await expect(burgerConstructor.getByText(`${SECOND_BUN_NAME} (верх)`)).toBeVisible();
    await expect(burgerConstructor.getByText(`${SECOND_BUN_NAME} (низ)`)).toBeVisible();
    await expect(burgerConstructor.getByText(`${BUN_NAME} (верх)`)).toHaveCount(0);
  });

  test('adds a filling to the constructor', async ({ page }) => {
    await addIngredient(page, MAIN_NAME);

    const burgerConstructor = getConstructorSection(page);

    await expect(burgerConstructor.getByText(MAIN_NAME)).toBeVisible();
    await expect(burgerConstructor.getByText('Выберите начинку')).toHaveCount(0);
  });

  test('adds a filling and a sauce to the constructor', async ({ page }) => {
    await addIngredient(page, MAIN_NAME);
    await addIngredient(page, SAUCE_NAME);

    const burgerConstructor = getConstructorSection(page);

    await expect(burgerConstructor.getByText(MAIN_NAME)).toBeVisible();
    await expect(burgerConstructor.getByText(SAUCE_NAME)).toBeVisible();
  });
});

import { expect, test } from '@playwright/test';

import type { Locator, Page } from '@playwright/test';

const BUN_NAME = 'Краторная булка N-200i';
const SECOND_BUN_NAME = 'Флюоресцентная булка R2-D3';
const MAIN_NAME = 'Биокотлета из марсианской Магнолии';
const MAIN_ID = '643d69a5c3f7b9001cfa0941';
const MAIN_CALORIES = '4242';
const SAUCE_NAME = 'Соус Spicy-X';
const MODAL_TITLE = 'Детали ингредиента';

const getIngredientsSection = (page: Page): Locator => page.locator('section').first();

const getConstructorSection = (page: Page): Locator => page.locator('section').last();

const getModalRoot = (page: Page): Locator => page.locator('#modals');

const getModalTitle = (page: Page): Locator =>
  getModalRoot(page).getByRole('heading', { name: MODAL_TITLE });

const getModalOverlay = (page: Page): Locator =>
  page.locator('[class*="modal-overlay__overlay"]');

const addIngredient = async (page: Page, name: string): Promise<void> => {
  await getIngredientsSection(page)
    .getByRole('listitem')
    .filter({ hasText: name })
    .getByText('Добавить')
    .click();
};

const openIngredientModal = async (page: Page, name: string): Promise<void> => {
  await getIngredientsSection(page).getByText(name).click();
};

test.beforeEach(async ({ page }) => {
  await page.routeFromHAR('tests/mocks/ingredients.har', {
    url: '**/api/ingredients',
    notFound: 'abort',
  });

  await page.goto('/');

  await expect(getIngredientsSection(page).getByText(BUN_NAME)).toBeVisible();
});

test.describe('add ingredients to constructor works correctly', () => {
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

test.describe('ingredient modal works correctly', () => {
  test('opens the modal with details of the chosen ingredient', async ({ page }) => {
    await expect(getModalTitle(page)).toHaveCount(0);

    await openIngredientModal(page, MAIN_NAME);

    const modalRoot = getModalRoot(page);

    await expect(getModalTitle(page)).toBeVisible();
    await expect(modalRoot.getByRole('heading', { name: MAIN_NAME })).toBeVisible();
    await expect(modalRoot.getByText(MAIN_CALORIES, { exact: true })).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/ingredients/${MAIN_ID}$`));
  });

  test('closes the modal by click on the close button', async ({ page }) => {
    await openIngredientModal(page, MAIN_NAME);
    await expect(getModalTitle(page)).toBeVisible();

    await getModalRoot(page).getByRole('button', { name: 'Закрыть' }).click();

    await expect(getModalTitle(page)).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });

  test('closes the modal by click on the overlay', async ({ page }) => {
    await openIngredientModal(page, MAIN_NAME);
    await expect(getModalTitle(page)).toBeVisible();

    await getModalOverlay(page).click({ position: { x: 10, y: 10 } });

    await expect(getModalTitle(page)).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });
});

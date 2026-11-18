import { expect, test } from '@playwright/test';

import type { Locator, Page } from '@playwright/test';

const BUN_NAME = 'Краторная булка N-200i';
const BUN_ID = '643d69a5c3f7b9001cfa093c';
const SECOND_BUN_NAME = 'Флюоресцентная булка R2-D3';
const MAIN_NAME = 'Биокотлета из марсианской Магнолии';
const MAIN_ID = '643d69a5c3f7b9001cfa0941';
const MAIN_CALORIES = '4242';
const SAUCE_NAME = 'Соус Spicy-X';
const SAUCE_ID = '643d69a5c3f7b9001cfa0942';
const MODAL_TITLE = 'Детали ингредиента';

const ACCESS_TOKEN = 'mock-access-token';
const REFRESH_TOKEN = 'mock-refresh-token';
const USER_NAME = 'Тестовый пользователь';
const ORDER_NUMBER = 98765;

const USER_RESPONSE = {
  success: true,
  user: {
    email: 'test@example.com',
    name: USER_NAME,
  },
};

const ORDER_RESPONSE = {
  success: true,
  name: 'Тестовый бургер',
  order: {
    _id: 'mock-order-id',
    status: 'done',
    name: 'Тестовый бургер',
    createdAt: '2026-11-17T10:00:00.000Z',
    updatedAt: '2026-11-17T10:00:00.000Z',
    number: ORDER_NUMBER,
    ingredients: [BUN_ID, MAIN_ID, SAUCE_ID, BUN_ID],
  },
};

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, content-type',
  'access-control-allow-methods': 'GET, POST, PATCH, OPTIONS',
};

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

const mockApiResponse = async (
  page: Page,
  url: string,
  body: unknown
): Promise<void> => {
  await page.route(url, async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: CORS_HEADERS });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: CORS_HEADERS,
      body: JSON.stringify(body),
    });
  });
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

test.describe('create order works correctly', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      { name: 'accessToken', value: ACCESS_TOKEN, url: 'http://localhost:4000' },
    ]);
    await page.addInitScript((token) => {
      window.localStorage.setItem('refreshToken', token);
    }, REFRESH_TOKEN);
    await mockApiResponse(page, '**/api/auth/user', USER_RESPONSE);
    await mockApiResponse(page, '**/api/orders', ORDER_RESPONSE);

    await page.reload();

    await expect(page.locator('header').getByText(USER_NAME)).toBeVisible();
    await expect(getIngredientsSection(page).getByText(BUN_NAME)).toBeVisible();
  });

  test('creates an order and clears the constructor after closing the modal', async ({
    page,
  }) => {
    await addIngredient(page, BUN_NAME);
    await addIngredient(page, MAIN_NAME);
    await addIngredient(page, SAUCE_NAME);

    const burgerConstructor = getConstructorSection(page);
    const modalRoot = getModalRoot(page);
    const orderNumber = modalRoot.getByText(String(ORDER_NUMBER), { exact: true });
    const orderRequest = page.waitForRequest(
      (request) => request.url().endsWith('/api/orders') && request.method() === 'POST'
    );

    await burgerConstructor.getByRole('button', { name: 'Оформить заказ' }).click();

    const request = await orderRequest;

    expect(request.postDataJSON()).toEqual({
      ingredients: [BUN_ID, MAIN_ID, SAUCE_ID, BUN_ID],
    });
    expect(request.headers().authorization).toBe(ACCESS_TOKEN);

    await expect(orderNumber).toBeVisible();
    await expect(modalRoot.getByText('идентификатор заказа')).toBeVisible();

    await modalRoot.getByRole('button', { name: 'Закрыть' }).click();

    await expect(orderNumber).toHaveCount(0);
    await expect(burgerConstructor.getByText('Выберите булки')).toHaveCount(2);
    await expect(burgerConstructor.getByText('Выберите начинку')).toBeVisible();
    await expect(burgerConstructor.getByText(MAIN_NAME)).toHaveCount(0);
  });
});

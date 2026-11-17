import { fetchIngredients, ingredientsReducer } from '@slices/ingredients-slice';

import type { TIngredient } from '@utils-types';

const initialState = {
  ingredients: [],
  isLoading: true,
  error: null,
};

const mockIngredients: TIngredient[] = [
  {
    _id: 'bun-1',
    name: 'Тестовая булка',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'https://example.com/bun.png',
    image_large: 'https://example.com/bun-large.png',
    image_mobile: 'https://example.com/bun-mobile.png',
  },
  {
    _id: 'main-1',
    name: 'Тестовая начинка',
    type: 'main',
    proteins: 44,
    fat: 26,
    carbohydrates: 85,
    calories: 643,
    price: 988,
    image: 'https://example.com/main.png',
    image_large: 'https://example.com/main-large.png',
    image_mobile: 'https://example.com/main-mobile.png',
  },
];

describe('ingredientsReducer', () => {
  it('возвращает начальное состояние при неизвестном экшене', () => {
    const result = ingredientsReducer(undefined, { type: 'UNKNOWN' });

    expect(result).toEqual(initialState);
  });

  it('fetchIngredients.pending включает загрузку и сбрасывает ошибку', () => {
    const state = {
      ingredients: [],
      isLoading: false,
      error: { message: 'Старая ошибка' },
    };

    const result = ingredientsReducer(state, fetchIngredients.pending('request-id'));

    expect(result).toEqual({
      ingredients: [],
      isLoading: true,
      error: null,
    });
  });

  it('fetchIngredients.fulfilled сохраняет ингредиенты и выключает загрузку', () => {
    const result = ingredientsReducer(
      initialState,
      fetchIngredients.fulfilled(mockIngredients, 'request-id')
    );

    expect(result).toEqual({
      ingredients: mockIngredients,
      isLoading: false,
      error: null,
    });
  });

  it('fetchIngredients.rejected сохраняет ошибку и выключает загрузку', () => {
    const result = ingredientsReducer(
      initialState,
      fetchIngredients.rejected(new Error('Ошибка загрузки'), 'request-id')
    );

    expect(result.isLoading).toBe(false);
    expect(result.ingredients).toEqual([]);
    expect(result.error).toMatchObject({ message: 'Ошибка загрузки' });
  });
});

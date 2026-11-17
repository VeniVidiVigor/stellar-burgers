import {
  addIngredient,
  burgerConstructorReducer,
  moveIngredientDown,
  moveIngredientUp,
  removeIngredient,
  resetConstructor,
} from '@slices/burger-constructor-slice';

import type {
  TConstructorIngredient,
  TConstructorState,
  TIngredient,
} from '@utils-types';

const emptyState: TConstructorState = {
  bun: null,
  ingredients: [],
};

const makeIngredient = (_id: string, type = 'main'): TIngredient => ({
  _id,
  name: `Ингредиент ${_id}`,
  type,
  proteins: 10,
  fat: 10,
  carbohydrates: 10,
  calories: 100,
  price: 50,
  image: 'https://example.com/image.png',
  image_large: 'https://example.com/image-large.png',
  image_mobile: 'https://example.com/image-mobile.png',
});

const makeConstructorIngredient = (
  id: string,
  type = 'main'
): TConstructorIngredient => ({
  ...makeIngredient(`ingredient-${id}`, type),
  id,
});

const stateWithThreeItems: TConstructorState = {
  bun: null,
  ingredients: [
    makeConstructorIngredient('id-1'),
    makeConstructorIngredient('id-2'),
    makeConstructorIngredient('id-3'),
  ],
};

const getIds = (state: TConstructorState): string[] =>
  state.ingredients.map((item) => item.id);

describe('burgerConstructorReducer', () => {
  it('возвращает начальное состояние при неизвестном экшене', () => {
    const result = burgerConstructorReducer(undefined, { type: 'UNKNOWN' });

    expect(result).toEqual(emptyState);
  });

  describe('addIngredient', () => {
    it('добавляет булку в bun и не трогает начинки', () => {
      const action = addIngredient(makeIngredient('bun-1', 'bun'));

      const result = burgerConstructorReducer(emptyState, action);

      expect(result.bun).toEqual(action.payload);
      expect(result.bun?._id).toBe('bun-1');
      expect(result.ingredients).toEqual([]);
    });

    it('заменяет булку, если она уже была выбрана', () => {
      const first = addIngredient(makeIngredient('bun-1', 'bun'));
      const second = addIngredient(makeIngredient('bun-2', 'bun'));

      const withFirst = burgerConstructorReducer(emptyState, first);
      const result = burgerConstructorReducer(withFirst, second);

      expect(result.bun?._id).toBe('bun-2');
      expect(result.ingredients).toEqual([]);
    });

    it('добавляет начинку в список и не трогает булку', () => {
      const action = addIngredient(makeIngredient('main-1', 'main'));

      const result = burgerConstructorReducer(emptyState, action);

      expect(result.bun).toBeNull();
      expect(result.ingredients).toEqual([action.payload]);
    });

    it('присваивает каждому добавленному ингредиенту уникальный id', () => {
      const first = addIngredient(makeIngredient('main-1'));
      const second = addIngredient(makeIngredient('main-1'));

      expect(typeof first.payload.id).toBe('string');
      expect(first.payload.id).not.toBe(second.payload.id);
    });
  });

  describe('removeIngredient', () => {
    it('удаляет ингредиент по id', () => {
      const result = burgerConstructorReducer(
        stateWithThreeItems,
        removeIngredient('id-2')
      );

      expect(getIds(result)).toEqual(['id-1', 'id-3']);
    });

    it('не меняет список, если такого id нет', () => {
      const result = burgerConstructorReducer(
        stateWithThreeItems,
        removeIngredient('unknown-id')
      );

      expect(getIds(result)).toEqual(['id-1', 'id-2', 'id-3']);
    });
  });

  describe('moveIngredientUp', () => {
    it('поднимает ингредиент на одну позицию вверх', () => {
      const result = burgerConstructorReducer(stateWithThreeItems, moveIngredientUp(2));

      expect(getIds(result)).toEqual(['id-1', 'id-3', 'id-2']);
    });

    it('не меняет порядок, если ингредиент уже первый', () => {
      const result = burgerConstructorReducer(stateWithThreeItems, moveIngredientUp(0));

      expect(getIds(result)).toEqual(['id-1', 'id-2', 'id-3']);
    });
  });

  describe('moveIngredientDown', () => {
    it('опускает ингредиент на одну позицию вниз', () => {
      const result = burgerConstructorReducer(
        stateWithThreeItems,
        moveIngredientDown(0)
      );

      expect(getIds(result)).toEqual(['id-2', 'id-1', 'id-3']);
    });

    it('не меняет порядок, если ингредиент уже последний', () => {
      const result = burgerConstructorReducer(
        stateWithThreeItems,
        moveIngredientDown(2)
      );

      expect(getIds(result)).toEqual(['id-1', 'id-2', 'id-3']);
    });
  });

  describe('resetConstructor', () => {
    it('возвращает конструктор в пустое состояние', () => {
      const filledState: TConstructorState = {
        bun: makeConstructorIngredient('bun-id', 'bun'),
        ingredients: stateWithThreeItems.ingredients,
      };

      const result = burgerConstructorReducer(filledState, resetConstructor());

      expect(result).toEqual(emptyState);
    });
  });
});

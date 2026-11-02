import type { SerializedError } from '@reduxjs/toolkit';
import type { RootState } from '@services/store';
import type { TIngredient } from '@utils-types';

export const selectIngredients = (state: RootState): TIngredient[] =>
  state.ingredients.ingredients;

export const selectIngredientsLoading = (state: RootState): boolean =>
  state.ingredients.isLoading;

export const selectIngredientsError = (state: RootState): SerializedError | null =>
  state.ingredients.error;

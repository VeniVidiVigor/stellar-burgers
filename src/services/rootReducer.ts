import { combineReducers } from '@reduxjs/toolkit';
import { burgerConstructorReducer } from '@slices/burger-constructor-slice';
import { ingredientsReducer } from '@slices/ingredients-slice';

export const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  burgerConstructor: burgerConstructorReducer,
});

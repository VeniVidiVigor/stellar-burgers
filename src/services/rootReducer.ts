import { combineReducers } from '@reduxjs/toolkit';
import { burgerConstructorReducer } from '@slices/burger-constructor-slice';
import { feedReducer } from '@slices/feed-slice';
import { ingredientsReducer } from '@slices/ingredients-slice';
import { ordersReducer } from '@slices/orders-slice';

export const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  burgerConstructor: burgerConstructorReducer,
  feed: feedReducer,
  orders: ordersReducer,
});

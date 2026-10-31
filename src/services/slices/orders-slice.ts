import { getOrderByNumberApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { TOrder } from '@utils-types';

type TOrdersState = {
  currentOrder: TOrder | null;
  isOrderLoading: boolean;
};

const initialState: TOrdersState = {
  currentOrder: null,
  isOrderLoading: false,
};

export const fetchOrderByNumber = createAsyncThunk(
  'orders/fetchOrderByNumber',
  async (number: number) => {
    const data = await getOrderByNumberApi(number);
    // Сервер возвращает массив, но нужный заказ в нём один
    return data.orders[0];
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderByNumber.pending, (state) => {
        state.isOrderLoading = true;
        // Сбрасываем, чтобы не мелькал предыдущий заказ
        state.currentOrder = null;
      })
      .addCase(fetchOrderByNumber.fulfilled, (state, action) => {
        state.isOrderLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderByNumber.rejected, (state) => {
        state.isOrderLoading = false;
      });
  },
});

export const ordersReducer = ordersSlice.reducer;

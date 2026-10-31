import { getOrderByNumberApi, getOrdersApi, orderBurgerApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { logoutUser } from '@slices/user-slice';

import type { TOrder } from '@utils-types';

type TOrdersState = {
  currentOrder: TOrder | null;
  isOrderLoading: boolean;
  userOrders: TOrder[];
  newOrder: TOrder | null;
  orderRequest: boolean;
};

const initialState: TOrdersState = {
  currentOrder: null,
  isOrderLoading: false,
  userOrders: [],
  newOrder: null,
  orderRequest: false,
};

export const fetchOrderByNumber = createAsyncThunk(
  'orders/fetchOrderByNumber',
  async (number: number) => {
    const data = await getOrderByNumberApi(number);
    return data.orders[0];
  }
);

export const fetchUserOrders = createAsyncThunk('orders/fetchUserOrders', () =>
  getOrdersApi()
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (ingredientIds: string[]) => {
    const res = await orderBurgerApi(ingredientIds);
    return res.order;
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearNewOrder: (state) => {
      state.newOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderByNumber.pending, (state) => {
        state.isOrderLoading = true;
        state.currentOrder = null;
      })
      .addCase(fetchOrderByNumber.fulfilled, (state, action) => {
        state.isOrderLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderByNumber.rejected, (state) => {
        state.isOrderLoading = false;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.userOrders = action.payload;
      })
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.newOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state) => {
        state.orderRequest = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.userOrders = [];
      });
  },
});

export const { clearNewOrder } = ordersSlice.actions;

export const ordersReducer = ordersSlice.reducer;

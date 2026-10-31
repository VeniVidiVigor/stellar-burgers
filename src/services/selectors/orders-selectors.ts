import type { RootState } from '@services/store';
import type { TOrder } from '@utils-types';

export const selectCurrentOrder = (state: RootState): TOrder | null =>
  state.orders.currentOrder;

export const selectUserOrders = (state: RootState): TOrder[] => state.orders.userOrders;

export const selectNewOrder = (state: RootState): TOrder | null => state.orders.newOrder;

export const selectOrderRequest = (state: RootState): boolean =>
  state.orders.orderRequest;

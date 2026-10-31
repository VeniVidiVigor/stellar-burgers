import type { RootState } from '@services/store';
import type { TOrder } from '@utils-types';

export const selectCurrentOrder = (state: RootState): TOrder | null =>
  state.orders.currentOrder;

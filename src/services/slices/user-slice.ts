import {
  getUserApi,
  loginUserApi,
  logoutApi,
  registerUserApi,
  updateUserApi,
} from '@api';
import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';

import { deleteCookie, getCookie, setCookie } from '@utils/cookie';

import type { TLoginData, TRegisterData } from '@api';
import type { TUser } from '@utils-types';

type TUserState = {
  user: TUser | null;
  isAuthChecked: boolean;
  isLoading: boolean;
  error: string | null;
};

const initialState: TUserState = {
  user: null,
  isAuthChecked: false,
  isLoading: false,
  error: null,
};

const saveTokens = (accessToken: string, refreshToken: string): void => {
  setCookie('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

const clearTokens = (): void => {
  deleteCookie('accessToken');
  localStorage.removeItem('refreshToken');
};

export const registerUser = createAsyncThunk(
  'user/register',
  async (data: TRegisterData) => {
    const res = await registerUserApi(data);
    saveTokens(res.accessToken, res.refreshToken);
    return res.user;
  }
);

export const loginUser = createAsyncThunk('user/login', async (data: TLoginData) => {
  const res = await loginUserApi(data);
  saveTokens(res.accessToken, res.refreshToken);
  return res.user;
});

export const logoutUser = createAsyncThunk('user/logout', async () => {
  await logoutApi();
  clearTokens();
});

export const checkUserAuth = createAsyncThunk('user/checkAuth', async () => {
  if (!getCookie('accessToken')) return null;
  const res = await getUserApi();
  return res.user;
});

export const updateUser = createAsyncThunk(
  'user/update',
  async (data: Partial<TRegisterData>) => {
    const res = await updateUserApi(data);
    return res.user;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(checkUserAuth.rejected, (state) => {
        state.user = null;
        state.isAuthChecked = true;
      })
      .addMatcher(
        isAnyOf(registerUser.pending, loginUser.pending, updateUser.pending),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        isAnyOf(registerUser.fulfilled, loginUser.fulfilled, updateUser.fulfilled),
        (state, action) => {
          state.isLoading = false;
          state.user = action.payload;
        }
      )
      .addMatcher(
        isAnyOf(registerUser.rejected, loginUser.rejected, updateUser.rejected),
        (state, action) => {
          state.isLoading = false;
          state.error = action.error.message ?? null;
        }
      );
  },
});

export const userReducer = userSlice.reducer;

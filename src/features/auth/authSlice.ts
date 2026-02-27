import { client } from '@/api/client'
import { RootState } from '@/app/store'
import { createAppAsyncThunk } from '@/app/withTypes'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  userId: string | null
  //   username: string | null
}

export const login = createAppAsyncThunk('auth/login', async (userId: string) => {
  await client.post('/fakeApi/login', { username: userId })
  return userId
})

export const logout = createAppAsyncThunk('auth/logout', async () => {
  await client.post('/fakeApi/logout', {})
})

const initialState: AuthState = {
  userId: null,
  //   username: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      //login and logout logic
      .addCase(login.fulfilled, (state, action) => {
        state.userId = action.payload
      })
      .addCase(logout.fulfilled, (state) => {
        state.userId = null
      })
  },
})

export const selectCurrentUserId = (state: RootState) => state.auth.userId
// export const selectCurrentUsername = (state: RootState) => state.auth.userId

export default authSlice.reducer

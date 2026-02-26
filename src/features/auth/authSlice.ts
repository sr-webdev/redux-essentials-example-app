import { RootState } from '@/app/store'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  userId: string | null
  //   username: string | null
}

const initialState: AuthState = {
  userId: null,
  //   username: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    userLoggedIn(state, action: PayloadAction<string>) {
      console.log(action)
      state.userId = action.payload
    },
    userLoggedOut(state) {
      state.userId = null
    },
  },
})

export const { userLoggedIn, userLoggedOut } = authSlice.actions

export const selectCurrentUserId = (state: RootState) => state.auth.userId
// export const selectCurrentUsername = (state: RootState) => state.auth.userId

export default authSlice.reducer

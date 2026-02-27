import { createSlice } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store'
import { selectCurrentUserId } from '../auth/authSlice'
import { createAppAsyncThunk } from '@/app/withTypes'
import { client } from '@/api/client'

interface User {
  id: string
  name: string
}

export const fetchUsers = createAppAsyncThunk('users/fetchUsers', async () => {
  const response = await client.get<User[]>('/fakeApi/users')
  return response.data
})

const initialState: User[] = []

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(fetchUsers.fulfilled, (_, action) => {
      return action.payload
    })
  },
})

export default usersSlice.reducer

export const selectAllUsers = (state: RootState) => state.users

export const selectUserById = (state: RootState, userId: string | null) =>
  state.users.find((user) => user.id === userId)

// export const selectUserByName = (state: RootState, username: string | null) =>
//   state.users.find((user) => user.name === username)

export const selectCurrentUser = (state: RootState) => {
  const currentUserId = selectCurrentUserId(state)
  // const currentUsername = selectCurrentUsername(state)
  return selectUserById(state, currentUserId)
}

import { createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store'
import { selectCurrentUserId } from '../auth/authSlice'
import { apiSlice } from '../api/apiSlice'
// import { createAppAsyncThunk } from '@/app/withTypes'
// import { client } from '@/api/client'

export interface User {
  id: string
  name: string
}

// export const fetchUsers = createAppAsyncThunk('users/fetchUsers', async () => {
//   const response = await client.get<User[]>('/fakeApi/users')
//   return response.data
// })

// const usersAdapter = createEntityAdapter<User>()

// const initialState = usersAdapter.getInitialState()

// const usersSlice = createSlice({
//   name: 'users',
//   initialState,
//   reducers: {},
//   // extraReducers(builder) {
//   //   builder.addCase(fetchUsers.fulfilled, usersAdapter.setAll)
//   // },
// })

// export default usersSlice.reducer

const emptyUsers: User[] = []

export const selectUsersResult = apiSlice.endpoints.getUsers.select()

export const selectAllUsers = createSelector(selectUsersResult, (usersResult) => usersResult?.data ?? emptyUsers)

export const selectUserById = createSelector(
  selectAllUsers,
  (state: RootState, userId: string) => userId,
  (users, userId) => users.find((user) => user.id === userId),
)

// export const { selectAll: selectAllUsers, selectById: selectUserById } = usersAdapter.getSelectors(
//   (state: RootState) => state.users,
// )

export const selectCurrentUser = (state: RootState) => {
  const currentUserId = selectCurrentUserId(state)

  if (!currentUserId) return

  return selectUserById(state, currentUserId)
}

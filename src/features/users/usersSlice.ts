import { createSelector } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store'
import { selectCurrentUserId } from '../auth/authSlice'
import { apiSlice } from '../api/apiSlice'
export interface User {
  id: string
  name: string
}
const emptyUsers: User[] = []

export const apiSliceWithUsers = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => '/users',
    }),
  }),
})

export const { useGetUsersQuery } = apiSliceWithUsers

export const selectUsersResult = apiSliceWithUsers.endpoints.getUsers.select()

export const selectAllUsers = createSelector(selectUsersResult, (usersResult) => usersResult?.data ?? emptyUsers)

export const selectUserById = createSelector(
  selectAllUsers,
  (state: RootState, userId: string) => userId,
  (users, userId) => users.find((user) => user.id === userId),
)

export const selectCurrentUser = (state: RootState) => {
  const currentUserId = selectCurrentUserId(state)

  if (!currentUserId) return

  return selectUserById(state, currentUserId)
}

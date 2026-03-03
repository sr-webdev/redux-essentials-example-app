import { createEntityAdapter, createSelector, EntityState } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store'
import { selectCurrentUserId } from '../auth/authSlice'
import { apiSlice } from '../api/apiSlice'
export interface User {
  id: string
  name: string
}

const usersAdapter = createEntityAdapter<User>()
const initialState = usersAdapter.getInitialState()

export const apiSliceWithUsers = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<EntityState<User, string>, void>({
      query: () => '/users',
      transformResponse(res: User[]) {
        //Create normalized state object with all the users
        return usersAdapter.setAll(initialState, res)
      },
    }),
  }),
})

export const { useGetUsersQuery } = apiSliceWithUsers

export const selectUsersResult = apiSliceWithUsers.endpoints.getUsers.select()

export const selectUsersData = createSelector(selectUsersResult, (usersResult) => usersResult.data ?? initialState)

export const selectCurrentUser = (state: RootState) => {
  const currentUserId = selectCurrentUserId(state)

  if (!currentUserId) return

  return selectUserById(state, currentUserId)
}

export const { selectById: selectUserById, selectAll: selectAllUsers } = usersAdapter.getSelectors(selectUsersData)

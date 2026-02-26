import { createSlice } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store'
import { selectCurrentUserId } from '../auth/authSlice'
// import { selectCurrentUsername } from '../auth/authSlice'

interface User {
  id: string
  name: string
}

const initialState: User[] = [
  { id: '0', name: 'Tianna Jenkins' },
  { id: '1', name: 'Kevin Grant' },
  { id: '2', name: 'Madison Price' },
]

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
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

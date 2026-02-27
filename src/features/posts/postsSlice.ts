import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'

import { createAppAsyncThunk } from '@/app/withTypes'
import { client } from '@/api/client'
import { RootState } from '@/app/store'
import { logout } from '../auth/authSlice'

export interface Reactions {
  thumbsUp: number
  tada: number
  heart: number
  rocket: number
  eyes: number
}

export type ReactionName = keyof Reactions

export interface Post {
  id: string
  title: string
  content: string
  user: string
  date: string
  reactions: Reactions
}

type PostUpdate = Pick<Post, 'id' | 'title' | 'content'>
type NewPost = Pick<Post, 'title' | 'content' | 'user'>

// const initialReactions: Reactions = {
//   thumbsUp: 0,
//   tada: 0,
//   heart: 0,
//   rocket: 0,
//   eyes: 0,
// }

interface PostsState {
  posts: Post[]
  status: 'idle' | 'pending' | 'succeeded' | 'failed'
  error: string | null
}

export const fetchPosts = createAppAsyncThunk(
  'posts/fetchPosts',
  async () => {
    const response = await client.get<Post[]>('/fakeApi/posts')
    return response.data
  },
  {
    condition(_, thunkApi) {
      const postsStatus = selectPostsStatus(thunkApi.getState())
      if (postsStatus !== 'idle') return false
    },
  },
)

export const addNewPost = createAppAsyncThunk('posts/addNewPost', async (newPost: NewPost) => {
  const response = await client.post<Post>('/fakeApi/posts', newPost)
  return response.data
})

export const updatePost = createAppAsyncThunk('posts/updatePost', async (postUpdate: PostUpdate) => {
  const response = await client.patch<Post>(`/fakeApi/posts/${postUpdate.id}`, postUpdate)
  return response.data
})

const initialState: PostsState = {
  posts: [],
  status: 'idle',
  error: null,
}

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    reactionAdded(state, action: PayloadAction<{ postId: string; reaction: ReactionName }>) {
      const { postId, reaction } = action.payload
      const existingPost = state.posts.find((post) => post.id === postId)
      if (existingPost) {
        existingPost.reactions[reaction]++
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, () => {
        //Reset state when user logs out
        return initialState
      })
      //Handle fetchPosts different status
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'pending'
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.posts.push(...action.payload)
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Unknown Error'
      })
      //Handle Add new post
      .addCase(addNewPost.fulfilled, (state, action) => {
        state.posts.push(action.payload)
      })
      //Handle update post
      .addCase(updatePost.fulfilled, (state, action) => {
        const { id, title, content } = action.payload
        const existingPost = state.posts.find((post) => post.id === id)
        if (existingPost) {
          existingPost.title = title
          existingPost.content = content
        }
      })
  },
  selectors: {
    selectAllPosts: (postsState) => postsState.posts,
    selectPostById: (postsState, id: string) => postsState.posts.find((post) => post.id === id),
    selectPostsStatus: (postsState) => postsState.status,
    selectPostsError: (postsState) => postsState.error,
  },
})

export const { reactionAdded } = postsSlice.actions

export const { selectAllPosts, selectPostById, selectPostsStatus, selectPostsError } = postsSlice.selectors

export default postsSlice.reducer

export const selectPostsByUser = createSelector(
  //Array of input selectors
  [
    // we can pass in an existing selector function that
    // reads something from the root `state` and returns it
    selectAllPosts,
    // and another function that extracts one of the arguments
    // and passes that onward
    (state: RootState, userId: string) => userId,
  ],
  // the output function gets those values as its arguments,
  // and will run when either input value changes
  (posts, userId) => posts.filter((post) => post.user === userId),
)

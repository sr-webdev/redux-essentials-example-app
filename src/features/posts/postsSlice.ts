import { createEntityAdapter, createSelector, createSlice, EntityState, isAnyOf, PayloadAction } from '@reduxjs/toolkit'

import { createAppAsyncThunk } from '@/app/withTypes'
import { client } from '@/api/client'
import { RootState } from '@/app/store'
import { logout } from '../auth/authSlice'
import { AppStartListening, startAppListening } from '@/app/listenerMiddleware'

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

interface PostsState extends EntityState<Post, string> {
  status: 'idle' | 'pending' | 'succeeded' | 'failed'
  error: string | null
}

const postsAdapter = createEntityAdapter<Post>({
  //Sort in desc order
  sortComparer: (a, b) => b.date.localeCompare(a.date),
})

const initialState: PostsState = postsAdapter.getInitialState({
  status: 'idle',
  error: null,
})

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

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    reactionAdded(state, action: PayloadAction<{ postId: string; reaction: ReactionName }>) {
      const { postId, reaction } = action.payload
      const existingPost = state.entities[postId]
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
        postsAdapter.setAll(state, action.payload)
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Unknown Error'
      })
      //Handle Add new post
      .addCase(addNewPost.fulfilled, postsAdapter.addOne)
      //Handle update post
      .addCase(updatePost.fulfilled, (state, action) => {
        const { id, title, content } = action.payload
        postsAdapter.updateOne(state, { id, changes: { title, content } })
      })
  },
  selectors: {
    selectPostsStatus: (postsState) => postsState.status,
    selectPostsError: (postsState) => postsState.error,
  },
})

export const { reactionAdded } = postsSlice.actions

export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
} = postsAdapter.getSelectors((state: RootState) => state.posts)

export const { selectPostsStatus, selectPostsError } = postsSlice.selectors

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

export const addPostsListeners = (startAppListening: AppStartListening) => {
  startAppListening({
    matcher: isAnyOf(addNewPost.fulfilled, updatePost.fulfilled),
    // actionCreator: addNewPost.fulfilled,
    effect: async (action, listenerApi) => {
      const { toast } = await import('react-tiny-toast')

      let toastText: string
      if (action.type === 'posts/addNewPost/fulfilled') {
        toastText = 'New post added!'
      } else {
        toastText = 'Post updated!'
      }

      const toastId = toast.show(toastText, {
        variant: 'success',
        position: 'bottom-right',
        pause: true,
      })

      await listenerApi.delay(5000)
      toast.remove(toastId)
    },
  })
}

export default postsSlice.reducer

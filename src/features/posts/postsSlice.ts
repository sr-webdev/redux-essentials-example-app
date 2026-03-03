import { AppStartListening } from '@/app/listenerMiddleware'
import { apiSlice } from '../api/apiSlice'
import { createSelector, isAnyOf } from '@reduxjs/toolkit'
import { RootState } from '@/app/store'

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

export type PostUpdate = Pick<Post, 'id' | 'title' | 'content'>
export type NewPost = Pick<Post, 'title' | 'content' | 'user'>

export type Reacting = {
  postId: string
  reactionName: ReactionName
}

export const selectPostsResult = apiSlice.endpoints.getPosts.select()

export const selectAllPosts = createSelector(selectPostsResult, (postsResult) => postsResult?.data ?? [])

export const selectPostsByUser = createSelector(
  selectAllPosts,
  (state: RootState, userId: string) => userId,
  (posts, userId) => posts.filter((post) => post.user === userId),
)

export const addPostsListeners = (startAppListening: AppStartListening) => {
  startAppListening({
    matcher: isAnyOf(apiSlice.endpoints.addNewPost.matchFulfilled, apiSlice.endpoints.editPost.matchFulfilled),
    effect: async (action, listenerApi) => {
      const { toast } = await import('react-tiny-toast')

      let toastText: string

      if (apiSlice.endpoints.addNewPost.matchFulfilled(action)) {
        toastText = 'New post added!'
      } else if (apiSlice.endpoints.editPost.matchFulfilled(action)) {
        toastText = 'Post updated!'
      } else {
        toastText = 'Unknown action.'
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

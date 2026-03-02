import { useAppDispatch, useAppSelector } from '@/app/hooks'
import React, { useState } from 'react'
import { selectCurrentUserId } from '../auth/authSlice'
import { addNewPost } from './postsSlice'
import { useAddNewPostMutation } from '../api/apiSlice'

// TS types for the input fields
// See: https://epicreact.dev/how-to-type-a-react-form-on-submit-handler/
interface AddPostFormFields extends HTMLFormControlsCollection {
  postTitle: HTMLInputElement
  postContent: HTMLTextAreaElement
}
interface AddPostFormElements extends HTMLFormElement {
  readonly elements: AddPostFormFields
}

export const AddPostForm = () => {
  const userId = useAppSelector(selectCurrentUserId)!
  const [addNewPost, { isLoading }] = useAddNewPostMutation()

  const handleSubmit = async (e: React.FormEvent<AddPostFormElements>) => {
    // Prevent server submission
    e.preventDefault()

    const form = e.currentTarget

    const { elements } = form
    const title = elements.postTitle.value
    const content = elements.postContent.value

    try {
      //The unwrap() method returns the action.payload value from a fulfilled action or throws and error if rejected. It allows us to handle success and failure inside a try/catch logic
      await addNewPost({ title, content, user: userId })
      form.reset()
    } catch (err) {
      console.error('Failed to save the post: ', err)
    }
  }

  return (
    <section>
      <h2>Add a New Post</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="postTitle">Post Title:</label>
        <input type="text" id="postTitle" defaultValue="" required />
        <label htmlFor="postContent">Content:</label>
        <textarea id="postContent" name="postContent" defaultValue="" required />
        <button disabled={isLoading}>Save Post</button>
      </form>
    </section>
  )
}

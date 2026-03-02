import { Link, useParams } from 'react-router-dom'

import { useAppSelector } from '@/app/hooks'
import { PostAuthor } from './PostAuthor'
import { TimeAgo } from '@/components/TimeAgo'
import { ReactionButtons } from './ReactionButtons'
import { selectCurrentUserId } from '../auth/authSlice'
import { useGetPostQuery } from '../api/apiSlice'
import { Spinner } from '@/components/Spinner'

export const SinglePostPage = () => {
  const { postId } = useParams()

  const { data: post, isFetching, isSuccess, isError, error } = useGetPostQuery(postId!)

  const currentUser = useAppSelector(selectCurrentUserId)

  let content: React.ReactNode

  const canEdit = post?.user === currentUser

  if (isFetching) {
    content = <Spinner text="Loading..." />
  } else if (isSuccess) {
    content = (
      <article className="post">
        <h2>{post.title}</h2>
        <p className="post-content">{post.content}</p>
        {canEdit && (
          <Link to={`/editPost/${post.id}`} className="button">
            Edit Post
          </Link>
        )}
        <PostAuthor userId={post.user} />
        <TimeAgo timestamp={post.date} />
        <ReactionButtons post={post} />
      </article>
    )
  } else if (isError) {
    content = <div>{error.toString()}</div>
  }

  return <section>{content}</section>
}

import type { Post, ReactionName } from './postsSlice'
import { useAddReactionMutation } from '../api/apiSlice'

const reactionEmoji: Record<ReactionName, string> = {
  thumbsUp: '👍',
  tada: '🎉',
  heart: '❤️',
  rocket: '🚀',
  eyes: '👀',
}

interface ReactionButtonsProps {
  post: Post
}

export const ReactionButtons = ({ post }: ReactionButtonsProps) => {
  const [addReaction, { isLoading }] = useAddReactionMutation()

  const reactionButtons = Object.entries(reactionEmoji).map(([stringName, emoji]) => {
    // Ensure TS knows this is a _specific_ string type
    const reaction = stringName as ReactionName
    return (
      <button
        key={reaction}
        type="button"
        className="muted-button reaction-button"
        disabled={isLoading}
        onClick={() => addReaction({ postId: post.id, reactionName: reaction })}
      >
        {emoji} {post.reactions[reaction]}
      </button>
    )
  })

  return <div>{reactionButtons}</div>
}

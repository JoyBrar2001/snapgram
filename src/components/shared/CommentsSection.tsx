import { useUserContext } from '@/context/AuthContext';
import { useDeleteComment, useGetCommentsForPost, usePostComment } from '@/lib/react-query/queriesMutations';
import React, { useState } from 'react'
import Loader from './Loader';
import { Send, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { multiFormatDateString } from '@/lib/utils';
import CustomAlertDialog from './CustomAlertDialog';

const CommentsSection = ({ postId }: { postId: string }) => {
  const [comment, setComment] = useState<string>('');

  const { user } = useUserContext();
  const { mutate: postComment, isPending: isPostingComment } = usePostComment();
  const { mutate: deleteComment } = useDeleteComment();
  const { data: comments, isLoading: isLoadingComments } = useGetCommentsForPost(postId);

  console.log(comments);


  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (comment.trim()) {
      postComment({
        postId,
        userId: user.id,
        comment,
      });
      setComment('');
    }
  };

  if (isLoadingComments) {
    return (
      <Loader />
    );
  }

  return (
    <div className="comments-section_wrapper px-4 pb-4">
      <form onSubmit={handleCommentSubmit} className="comment-form mt-4 flex justify-center items-center gap-2">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full border border-dark-4 p-2 rounded bg-dark-3"
          rows={1}
        />
        <Button
          type="submit"
          className="shad-button_primary whitespace-nowrap h-full"
          disabled={isLoadingComments}
        >
          {isLoadingComments || isPostingComment ? (
            <Loader />
          ) : (
            <Send />
          )}
        </Button>
      </form>

      <div className="flex flex-col gap-2 mt-4 divide-y-2 divide-dark-4">
        {comments && comments.map((commentData: any) => (
          <div key={commentData.$id} className="flex flex-col pt-2 relative">
            <div className="flex flex-row justify-start items-center gap-2">
              <img
                src={
                  commentData?.user?.imageUrl ||
                  "/assets/icons/profile-placeholder.svg"
                }
                alt="creator"
                className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
              />

              <div className="flex flex-col">
                <p className="base-medium lg:body-bold text-light-1">
                  {commentData?.user?.name}
                </p>
                <div className="flex-center gap-2 text-light-3">
                  <p className="subtle-semibold lg:small-regular ">
                    {multiFormatDateString(commentData?.$createdAt)}
                  </p>
                </div>
              </div>

              {commentData.user.$id === user.id && (
                <CustomAlertDialog
                  title="Delete Comment?"
                  description="Are you sure you want to delete this comment ?"
                  onConfirm={() => deleteComment(commentData.$id)}
                  confirmLabel="Delete"
                  cancelLabel="Cancel"
                >
                  <Trash2 className="text-red absolute top-1/2 -translate-y-1/2 right-2 cursor-pointer" />
                </CustomAlertDialog>
              )}
            </div>

            <div className="flex flex-col mt-2 pl-8 lg:pl-14">
              <p className="text-sm lg:text-base">{commentData.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CommentsSection
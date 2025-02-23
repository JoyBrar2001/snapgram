import { useDeleteSavedPost, useGetCommentsForPost, useGetCurrentUser, useLikePost, useSavePost } from '@/lib/react-query/queriesMutations';
import { checkIsLiked } from '@/lib/utils';
import { Models } from 'appwrite';
import React, { useEffect, useState } from 'react'
import Loader from './Loader';
import { MessageCircleMore } from 'lucide-react';
import { Link } from 'react-router-dom';

type PostStatsProps = {
  post?: Models.Document;
  userId: string;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
  const likesList = post?.likes.map((user: Models.Document) => user.$id);

  const [likes, setLikes] = useState(likesList);
  const [isSaved, setIsSaved] = useState(false);


  const { mutate: likePost } = useLikePost();
  const { mutate: savePost, isPending: isSaving } = useSavePost();
  const { mutate: deleteSavedPost, isPending: isDeleting } = useDeleteSavedPost();
  const { data: comments } = useGetCommentsForPost(post?.$id || "");

  const { data: currentUser } = useGetCurrentUser();

  const savedPostRecord = currentUser?.save.find((record: Models.Document) => record.post.$id === post?.$id);

  useEffect(() => {
    setIsSaved(!!savedPostRecord);
  }, [currentUser]);

  const handleLikePost = (e: React.MouseEvent) => {
    e.stopPropagation();

    let newLikes = [...likes];
    const hasLiked = newLikes.includes(userId);

    if (hasLiked) {
      newLikes = newLikes.filter(id => id !== userId);
    } else {
      newLikes.push(userId);
    }

    setLikes(newLikes);

    likePost({ postId: post?.$id || '', likesArray: newLikes })
  }

  const handleSavePost = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (savedPostRecord) {
      setIsSaved(false);
      deleteSavedPost(savedPostRecord.$id);
    } else {
      savePost({ userId, postId: post?.$id || '' });
      setIsSaved(true);
    }
  }

  return (
    <div className="flex justify-between items-center z-20">
      <div className="flex gap-2 mr-5 items-center">
        <img
          src={checkIsLiked(likes, userId)
            ? "/assets/icons/liked.svg"
            : "/assets/icons/like.svg"
          }
          alt="like"
          width={20}
          height={20}
          onClick={handleLikePost}
          className="cursor-pointer"
        />
        <p className="small-medium base-medium">
          {likes.length}
        </p>

        <Link to={`/post/${post?.$id}`}>
          <MessageCircleMore className="ml-2 text-[#877eff]" size={20} />
        </Link>
        <p className="small-medium base-medium">
          {comments?.length}
        </p>
      </div>

      <div className="flex gap-2">
        {isSaving || isDeleting ? (
          <Loader />
        ) : (
          <img
            src={isSaved
              ? "/assets/icons/saved.svg"
              : "/assets/icons/save.svg"
            }
            alt="save"
            width={20}
            height={20}
            onClick={handleSavePost}
            className="cursor-pointer"
          />
        )}
      </div>
    </div>
  )
}

export default PostStats
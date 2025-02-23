import { Models } from 'appwrite';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { useUserContext } from '@/context/AuthContext';
import { useFollowingUsers, useFollowUser, useUnfollowUser } from '@/lib/react-query/queriesMutations';
import Loader from './Loader';
import { useEffect, useState } from 'react';

const UserCard = ({ user }: { user: Models.Document }) => {
  const { user: currentUser } = useUserContext();

  const followUserMutation = useFollowUser(currentUser.id, user.$id);
  const unfollowUserMutation = useUnfollowUser(currentUser.id, user.$id);

  const { data: followingUsers, isLoading } = useFollowingUsers(currentUser.id);

  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  useEffect(() => {
    if (followingUsers) {
      setIsFollowing(followingUsers.includes(user.$id));
    }
  }, [followingUsers, user.$id]);

  const handleFollow = () => {
    if (isFollowing) {
      unfollowUserMutation.mutate(undefined, {
        onSuccess: () => {
          setIsFollowing(false);
        }
      });
    } else {
      followUserMutation.mutate(undefined, {
        onSuccess: () => {
          setIsFollowing(true);
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="user-card">
        <Loader />
      </div>
    );
  }

  return (
    <div className="user-card">
      <Link to={`/profile/${user.$id}`} className="flex-center flex-col gap-4">
        <img
          src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="creator"
          className="rounded-full w-14 h-14"
        />

        <div className="flex-center flex-col gap-1">
          <p className="base-medium text-light-1 text-center line-clamp-1">
            {user.name}
          </p>
          <p className="small-regular text-light-3 text-center line-clamp-1">
            @{user.username}
          </p>
        </div>
      </Link>

      {currentUser.id !== user.$id && (
        <Button
          type="button"
          size="sm"
          className="shad-button_primary px-5"
          onClick={handleFollow}
        >
          {isLoading || followUserMutation.isPending || unfollowUserMutation.isPending ? (
            <Loader />
          ) : (
            isFollowing ? "Unfollow" : "Follow"
          )}
        </Button>
      )}
    </div>
  );
}

export default UserCard;
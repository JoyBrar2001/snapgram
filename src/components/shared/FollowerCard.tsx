import { useFollowingUsers, useFollowUser, useGetUserByID, useUnfollowUser } from '@/lib/react-query/queriesMutations'
import { useEffect, useState } from 'react'
import Loader from './Loader';
import { Link } from 'react-router-dom';
import { useUserContext } from '@/context/AuthContext';
import { Button } from '../ui/button';

const FollowerCard = ({ followerId }: { followerId: string }) => {
  const { user: currentUser } = useUserContext();
  const { data: userData, isLoading: isUserLoading } = useGetUserByID(followerId);

  const followUserMutation = useFollowUser(currentUser.id, userData?.$id || "");
  const unfollowUserMutation = useUnfollowUser(currentUser.id, userData?.$id || "");

  const { data: followingUsers, isLoading } = useFollowingUsers(currentUser.id);

  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  useEffect(() => {
    if (followingUsers) {
      setIsFollowing(followingUsers.includes(userData?.$id || ""));
    }
  }, [followingUsers, userData?.$id || ""]);

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

  if(!userData || isUserLoading){
    return (
      <div className="user-card">
        <Loader />
      </div>
    );
  }

  return (
    <div className="user-card">
      <Link to={`/profile/${userData.$id}`} className="flex-center flex-col gap-4">
        <img
          src={userData.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="creator"
          className="rounded-full w-14 h-14"
        />

        <div className="flex-center flex-col gap-1">
          <p className="base-medium text-light-1 text-center line-clamp-1">
            {userData.name}
          </p>
          <p className="small-regular text-light-3 text-center line-clamp-1">
            @{userData.username}
          </p>
        </div>
      </Link>

      {currentUser.id !== userData.$id && (
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
  )
}

export default FollowerCard
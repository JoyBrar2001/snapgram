import GridPostList from '@/components/shared/GridPostList';
import Loader from '@/components/shared/Loader';
import { Button } from '@/components/ui/button';
import { useUserContext } from '@/context/AuthContext';
import { useGetUserByID, useFollowUser, useUnfollowUser, useFollowingUsers, useFollowersUsers } from '@/lib/react-query/queriesMutations';
import { Link, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom';
import LikedPosts from './LikedPosts';
import Followers from './Followers';
import Following from './Following';
import { UserRoundCheck, UserRoundPlus } from 'lucide-react';
import { useState, useEffect } from 'react';

const Profile = () => {
  const { id } = useParams();
  const { user } = useUserContext();

  const { pathname } = useLocation();

  const { data: currentUser, isLoading: isUserLoading } = useGetUserByID(id || "");

  const { data: followingUsers } = useFollowingUsers(user.id);
  const { data: followers } = useFollowersUsers(user.id);

  const { mutate: followUser, isPending: isFollowingLoading } = useFollowUser(user.id, id || "");
  const { mutate: unfollowUser, isPending: isUnfollowingLoading } = useUnfollowUser(user.id, id || "");

  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  useEffect(() => {
    if (followingUsers) {
      setIsFollowing(followingUsers.includes(id || ""));
    }
  }, [followingUsers, id]);

  if (!currentUser || isUserLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  const handleFollow = () => {
    if (isFollowing) {
      unfollowUser();
      setIsFollowing(false);
    } else {
      followUser();
      setIsFollowing(true);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-inner_container">
        <div className="flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7">

          <img
            src={currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt={currentUser.name || ""}
            className="w-28 h-28 lg:h-36 lg:w-36 rounded-full"
          />

          <div className="flex flex-col flex-1 justify-between md:mt-2">
            <div className="flex flex-col w-full">
              <h1 className="text-center xl:text-left h3-bold md:h1-semibold w-full">
                {currentUser.name}
              </h1>
              <p className="small-regular md:body-medium text-light-3 text-center xl:text-left">
                @{currentUser.username}
              </p>
            </div>

            <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20">
              <Link to={`/profile/${id}`} className="flex-center gap-2">
                <p className="small-semibold lg:body-bold text-primary-500">{currentUser.posts.length}</p>
                <p className="small-medium lg:base-medium text-light-2">Posts</p>
              </Link>

              <Link to={`/profile/${id}/followers`} className="flex-center gap-2">
                <p className="small-semibold lg:body-bold text-primary-500">{followers?.length || 0}</p>
                <p className="small-medium lg:base-medium text-light-2">Followers</p>
              </Link>

              <Link to={`/profile/${id}/following`} className="flex-center gap-2">
                <p className="small-semibold lg:body-bold text-primary-500">{followingUsers?.length || 0}</p>
                <p className="small-medium lg:base-medium text-light-2">Following</p>
              </Link>
            </div>

            <p className="small-medium md:base-medium text-center xl:text-left mt-7 max-w-screen-sm">
              {currentUser.bio}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            {user.id === currentUser.$id && (
              <div>
                <Link
                  to={`/update-profile/${currentUser.$id}`}
                  className="h-12 bg-dark-4 px-5 text-light-1 flex-center gap-2 rounded-lg"
                >
                  <img
                    src={"/assets/icons/edit.svg"}
                    alt="edit"
                    width={20}
                    height={20}
                  />

                  <p className="flex whitespace-nowrap small-medium">
                    Edit Profile
                  </p>
                </Link>
              </div>
            )}

            {user.id !== currentUser.$id && (
              <Button
                type="button"
                className="shad-button_primary px-8"
                onClick={handleFollow}
                disabled={isFollowingLoading || isUnfollowingLoading}
              >
                {isFollowingLoading || isUnfollowingLoading ? (
                  <Loader />
                ) : (
                  isFollowing ? "Unfollow" : "Follow"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {currentUser.$id === user.id && (
        <div className="grid grid-cols-2 gap-0 lg:grid-cols-4  max-w-5xl">
          <Link
            to={`/profile/${id}`}
            className={`profile-tab rounded-l-lg ${pathname === `/profile/${id}` && "!bg-dark-3"}`}
          >
            <img
              src={"/assets/icons/posts.svg"}
              alt="posts"
              width={20}
              height={20}
            />
            Posts
          </Link>
          <Link
            to={`/profile/${id}/liked-posts`}
            className={`profile-tab ${pathname === `/profile/${id}/liked-posts` && "!bg-dark-3"}`}
          >
            <img
              src={"/assets/icons/like.svg"}
              alt="like"
              width={20}
              height={20}
            />
            Liked Posts
          </Link>
          <Link
            to={`/profile/${id}/followers`}
            className={`profile-tab ${pathname === `/profile/${id}/followers` && "!bg-dark-3"}`}
          >
            <UserRoundPlus
              size={20}
              className="text-primary-500"
            />
            Followers
          </Link>
          <Link
            to={`/profile/${id}/following`}
            className={`profile-tab rounded-r-lg ${pathname === `/profile/${id}/following` && "!bg-dark-3"}`}
          >
            <UserRoundCheck 
              size={20}
              className="text-primary-500"
            />
            Following
          </Link>
        </div>
      )}

      <Routes>
        <Route
          index
          element={<GridPostList posts={currentUser.posts} showUser={false} />}
        />
        {currentUser.$id === user.id && (
          <Route
            path="/liked-posts"
            element={<LikedPosts />}
          />
        )}
        <Route
          path="/followers"
          element={<Followers />}
        />
        <Route
          path="/following"
          element={<Following />}
        />
      </Routes>
      <Outlet />
    </div>
  )
}

export default Profile;

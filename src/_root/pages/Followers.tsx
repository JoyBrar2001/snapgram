import FollowerCard from "@/components/shared/FollowerCard";
import { useUserContext } from "@/context/AuthContext"
import { useFollowersUsers } from "@/lib/react-query/queriesMutations";

const Followers = () => {
  const { user: currentUser } = useUserContext();

  const { data: followers } = useFollowersUsers(currentUser.id);

  return (
    <div className="grid-container">
      {followers?.map((follower) => (
        <FollowerCard followerId={follower} key={follower} />
      ))}
    </div>
  )
}

export default Followers
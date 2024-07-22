import FollowerCard from "@/components/shared/FollowerCard";
import { useUserContext } from "@/context/AuthContext"
import { useFollowingUsers } from "@/lib/react-query/queriesMutations";

const Following = () => {
  const { user: currentUser } = useUserContext();

  const { data: followers } = useFollowingUsers(currentUser.id);

  return (
    <div className="grid-container">
      {followers?.map((follower) => (
        <FollowerCard followerId={follower} key={follower} />
      ))}
    </div>
  )
}

export default Following
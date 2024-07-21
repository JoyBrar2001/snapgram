import Loader from "@/components/shared/Loader";
import UserCard from "@/components/shared/UserCard";
import { useToast } from "@/components/ui/use-toast";
import { useGetAllUsers } from "@/lib/react-query/queriesMutations";

const AllUsers = () => {
  const { toast } = useToast();
  const { data: users, isLoading, isError: isErrorCreators } = useGetAllUsers();

  if(isErrorCreators){
    toast({
      title: "Something Went Wrong",
      description: "Could not fetch users",
    });
  }

  return (
    <div className="common-container">
      <div className="user-container">
        <h2 className="h3-bold md:h2-bold text-left w-full">
          All Users
        </h2>

        {isLoading ? (
          <Loader />
        ) : (
          <ul className="user-grid">
            {users?.documents.map((user) => (
              <li key={user.$id} className="flex-1 min-w-[200px] w-full">
                <UserCard user={user} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default AllUsers
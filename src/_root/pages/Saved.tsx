import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import { useGetCurrentUser, useGetSavedPosts } from "@/lib/react-query/queriesMutations"

const Saved = () => {
  const { data: currentUser } = useGetCurrentUser();
  const { data: savedPosts } = useGetSavedPosts(currentUser?.$id || "");

  if (!currentUser || !savedPosts) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  return (
    <div className="saved-container">
      <div className="flex gap-2 w-full max-w-5xl">
        <img
          src="/assets/icons/save.svg"
          width={36}
          height={36}
          alt="edit"
          className="invert-white"
        />
        <h2 className="h3-bold md:h2-bold text-left w-full">
          Saved Posts
        </h2>
      </div>

      {!currentUser ? (
        <Loader />
      ) : (
        <ul className="w-full flex justify-center max-w-5xl gap-9">
          {savedPosts?.length === 0 ? (
            <p className="text-light-4">
              You haven't saved any posts yet.
            </p>
          ) : (
            <GridPostList 
              posts={savedPosts || []}
              showStats={false}
            />
          )}
        </ul>
      )}
    </div>
  )
}

export default Saved
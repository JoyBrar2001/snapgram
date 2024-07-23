import GridPostList from '@/components/shared/GridPostList';
import Loader from '@/components/shared/Loader';
import SearchResults from '@/components/shared/SearchResults';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input'
// import { useUserContext } from '@/context/AuthContext';
import { useGetPosts, useSearchPosts } from '@/lib/react-query/queriesMutations';
import { useState } from 'react'

export type SearchResultProps = {
  isSearchFetching: boolean;
  searchedPosts: any;
};

const Explore = () => {
  const { data: posts } = useGetPosts();
  // const { user } = useUserContext();

  const [searchValue, setSearchValue] = useState("");
  const { data: searchedPosts, isFetching: isSearchFetching } = useSearchPosts(searchValue);

  const [currentFilter, setCurrentFilter] = useState<"All" | "Following" | "Most Liked">("All");

  // const { data: posts, isPending, isFetching } = useGetFilteredPosts(currentFilter, user.id);
  // console.log(currentFilter, posts);
  

  if (!posts) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    )
  }

  const shouldShowSearchResults = searchValue !== '';
  const shouldShowPosts = !shouldShowSearchResults && posts.documents.length !== 0;

  return (
    <div className="explore-container">
      <div className="explore-inner_container">
        <h2 className="h3-bold md:h2-bold w-full">
          Search Posts
        </h2>

        <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4">
          <img
            src="/assets/icons/search.svg"
            alt="Search"
            width={24}
            height={24}
          />
          <Input
            type="text"
            placeholder="Search"
            className="explore-search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-between w-full max-w-5xl mt-16 mb-7">
        <h3 className="body-bold md:h3-bold">Popular Today</h3>

        <div className="flex-center gap-3 bg-dark-3 rounded-xl px-4 py-2 cursor-pointer">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex-center gap-2 small-medium md:base-medium text-light-2">
              {currentFilter}
              <img
                src="/assets/icons/filter.svg"
                width={20}
                height={20}
                alt="filter"
              />
            </DropdownMenuTrigger>

            <DropdownMenuContent className="bg-dark-3 border-white/20 mt-2">
              {["All", "Following", "Most Liked"].map((filter) => (
                <DropdownMenuItem
                  key={filter}
                  onClick={() => setCurrentFilter(filter as "All" | "Following" | "Most Liked")}
                  className="cursor-pointer"
                >
                  {filter}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* <p className="small-medium md:base-medium text-light-2">All</p>
          <img
            src="/assets/icons/filter.svg"
            width={20}
            height={20}
            alt="filter"
          /> */}
        </div>
      </div>

      <div className="flex flex-wrap gap-9 w-full max-w-5xl">
        {shouldShowSearchResults ? (
          <SearchResults
            isSearchFetching={isSearchFetching}
            searchedPosts={searchedPosts?.documents || []}
          />
        ) : shouldShowPosts && posts.documents ? (
          <GridPostList
            posts={posts.documents}
          />
        ) : (
          <p className="text-light-4 mt-10 text-center w-full">End of posts</p>
        )}
      </div>
    </div>
  )
}

export default Explore
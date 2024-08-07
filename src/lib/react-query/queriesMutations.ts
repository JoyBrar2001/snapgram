import { useQuery, useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";
import { IComment, INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";
import { createPost, createUserAccount, deleteComment, deletePost, deleteSavedPost, followUser, getAllCommentsForPost, getAllUsers, getCurrentUser, getFilteredPosts, getFollowersList, getFollowingList, getInfinitePosts, getPostById, getRecentPosts, getSavedPosts, getUserById, likePost, postComment, savePost, searchPosts, signInAccount, signOutAccount, unFollowUser, updatePost, updateUser } from "../appwrite/api";
import { QUERY_KEYS } from "./queryKeys";

export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: (user: INewUser) => createUserAccount(user)
  });
}

export const useSignInAccount = () => {
  return useMutation({
    mutationFn: (user: {
      email: string,
      password: string
    }) => signInAccount(user)
  });
}

export const useSignOutAccount = () => {
  return useMutation({
    mutationFn: () => signOutAccount()
  });
}

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: INewPost) => createPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
}

export const useGetRecentPosts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    queryFn: getRecentPosts,
  });
}

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      likesArray,
    }: {
      postId: string;
      likesArray: string[];
    }) => likePost(postId, likesArray),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

export const useSavePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, postId }: { userId: string; postId: string }) => savePost(userId, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_SAVED_POSTS],
      });
    },
  });
};

export const useDeleteSavedPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_SAVED_POSTS],
      });
    },
  });
};

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER],
    queryFn: getCurrentUser,
  });
};

export const useGetUserByID = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
}

export const useGetAllUsers = (limit?: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USERS],
    queryFn: () => getAllUsers(limit),
  });
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: IUpdateUser) => updateUser(user),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id],
      });
    },
  });
}

export const useFollowUser = (followerId: string, followingId: string) => {
  const queryClient = new QueryClient();

  return useMutation({
    mutationFn: () => followUser(followerId, followingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USERS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FOLLOWING_USERS],
      });
    }
  });
}

export const useUnfollowUser = (followerId: string, followingId: string) => {
  const queryClient = new QueryClient();

  return useMutation({
    mutationFn: () => unFollowUser(followerId, followingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USERS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FOLLOWING_USERS],
      });
    }
  });
}

export const useFollowingUsers = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_FOLLOWING_USERS, userId],
    queryFn: () => getFollowingList(userId),
  });
};

export const useFollowersUsers = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_FOLLOWER_USERS, userId],
    queryFn: () => getFollowersList(userId),
  });
};

export const useGetPostById = (postId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });
}

export const useGetSavedPosts = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_SAVED_POSTS, userId],
    queryFn: () => getSavedPosts(userId),
    enabled: !!userId,
  });
}

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: IUpdatePost) => updatePost(post),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
      });
    },
  });
}

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, imageId }: { postId: string, imageId: string }) => deletePost(postId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
}

export const useGetPosts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
    queryFn: () => getInfinitePosts(),
    enabled: true,
  });
};

export const useGetFilteredPosts = (filter: string, userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
    queryFn: () => getFilteredPosts(filter, userId),
  });
};

export const useSearchPosts = (searchTerm: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
    queryFn: () => searchPosts(searchTerm),
    enabled: !!searchTerm,
  });
}

export const useGetCommentsForPost = (postId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_COMMENTS_FOR_POST, postId],
    queryFn: () => getAllCommentsForPost(postId),
    enabled: !!postId,
  });
};

export const usePostComment = () => {
  const queryClient = new QueryClient();

  return useMutation({
    mutationFn: (commentData: IComment) => postComment(commentData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.postId]
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_COMMENTS_FOR_POST, data?.postId]
      });
    },
  });
}

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_COMMENTS_FOR_POST, data?.post?.$id],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.post?.$id],
      });
    },
  });
};
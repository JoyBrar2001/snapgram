import { ID, ImageGravity, Query } from "appwrite";

import { INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";
import { account, appwriteConfig, avatars, databases, storage } from "./config";

export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name,
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(user.name);

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      email: newAccount.email,
      name: newAccount.name,
      username: user.username,
      imageUrl: avatarUrl,
    });

    return newUser;
  } catch (error) {
    console.log(error);
  }
}

export async function saveUserToDB(user: { accountId: string, email: string, name: string, imageUrl: URL, username?: string }) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user,
    );

    return newUser;
  } catch (error) {
    console.log(error);
  }
}

export async function signInAccount(user: { email: string, password: string }) {
  try {
    const session = await account.createEmailPasswordSession(
      user.email,
      user.password,
    );

    return session;
  } catch (error) {
    console.log(error);
  }
}

export async function getCurrentUser() {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
}

export async function getUserById(userId: string) {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    if (!user) throw Error;

    return user;
  } catch (error) {
    console.log(error);
  }
}

export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;

  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    }

    if (hasFileToUpdate) {
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw Error;

      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.userId,
      {
        name: user.name,
        bio: user.bio,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
      }
    );

    if (!updatedUser) {
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      throw Error;
    }

    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updateUser;
  } catch (error) {
    console.log(error);
  }
}

export async function getAllUsers(limit?: number) {
  const queries: any[] = [Query.orderDesc("$createdAt")];

  if (limit) {
    queries.push(Query.limit(limit))
  }

  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries,
    );

    if (!users) throw Error;

    return users;
  } catch (error) {
    console.log(error);
  }
}

export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    console.log(error);
  }
}

export async function followUser(followerId: string, followedId: string) {
  try {
    const followRecord = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.followCollectionId,
      ID.unique(),
      {
        FollowerId: followerId,
        FollowingId: followedId,
      }
    );

    return followRecord;
  } catch (error) {
    console.log(error);
  }
}

export async function unFollowUser(followerId: string, followingId: string) {
  try {
    const followRecords = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.followCollectionId,
      [
        Query.equal('FollowerId', followerId),
        Query.equal('FollowingId', followingId)
      ]
    );

    if (followRecords.documents.length > 0) {
      const followRecordId = followRecords.documents[0].$id;

      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.followCollectionId,
        followRecordId
      );
    }

    return followRecords;
  } catch (error) {
    console.log('Error unfollowing user:', error);
  }
}

export async function getFollowingList(userId: string) {
  try {
    const followingUsers = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.followCollectionId,
      [Query.equal('FollowerId', userId)]
    );

    const followingIds = followingUsers.documents.map(doc => doc.FollowingId);

    return followingIds;
  } catch (error) {
    console.log(error);
  }
}

export async function getFollowersList(userId: string) {
  try {
    const followingUsers = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.followCollectionId,
      [Query.equal('FollowingId', userId)]
    );

    const followerIds = followingUsers.documents.map(doc => doc.FollowerId);

    return followerIds;
  } catch (error) {
    console.log(error);
  }
}

export async function createPost(post: INewPost) {
  try {
    const uploadedFile = await uploadFile(post.file[0]);
    console.log(uploadedFile)

    if (!uploadedFile) throw Error;

    const fileUrl = getFilePreview(uploadedFile.$id);
    // console.log(typeof fileUrl)

    if (!fileUrl) {
      deleteFile(uploadedFile.$id);
      throw Error;
    }

    const tags = post.tags?.replace(/ /g, '').split(',') || [];

    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
      }
    );
    console.log(newPost)

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.log(error);
  }
}

export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;

  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    }

    if (hasFileToUpdate) {
      const uploadedFile = await uploadFile(post.file[0]);

      if (!uploadedFile) throw Error;

      const fileUrl = getFilePreview(uploadedFile.$id);

      if (!fileUrl) {
        deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = {
        ...image,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id
      }
    }

    const tags = post.tags?.replace(/ /g, '').split(',') || [];

    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      }
    );

    if (!updatedPost) {
      await deleteFile(post.imageId);
      throw Error;
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

export async function deletePost(postId: string, imageId: string) {
  if (!postId || !imageId) {
    throw Error;
  }

  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

export function getFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,
      2000,
      ImageGravity.Top,
      100
    );

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

export async function getFilteredPosts(filter: string, userId: string) {
  let filteredPosts;
  let queries = [];
  try {
    if (filter === "All") {
      filteredPosts = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
      );

    } else if (filter === "Following") {
      
      const followingUsersIds = await getFollowingList(userId);
      if (followingUsersIds && followingUsersIds.length > 0) {
        queries.push(Query.equal("userId", followingUsersIds));
      } else {
        queries.push(Query.equal('userId', 'nonexistentUser'));
      }
      
      // Fetch posts from there
    } else if (filter === "Most Liked") {
      queries.push(Query.orderDesc("likesCount"));
    }

    if (queries.length > 0) {
      filteredPosts = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        queries
      );
    }

    return filteredPosts;
  } catch (error) {
    console.log(error);
  }
}

export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      { likes: likesArray },
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

export async function savePost(userId: string, postId: string) {
  try {
    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      },
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId,
    );

    if (!statusCode) throw Error;

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

export async function getPostById(postId: string) {
  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    return post;
  } catch (error) {
    console.log(error);
  }
}

export async function getInfinitePosts(pageParam?: number) {
  const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search('caption', searchTerm)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

export async function getSavedPosts(userId: string) {
  try {
    const savedRecords = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      [Query.equal('user', userId)],
    );

    if (!savedRecords) throw Error;

    const postIds = savedRecords.documents.map(record => record.post.$id);

    const savedPostsPromises = postIds.map(postId => databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    ));

    const savedPosts = await Promise.all(savedPostsPromises);

    return savedPosts;
  } catch (error) {
    console.log(error);
  }
}
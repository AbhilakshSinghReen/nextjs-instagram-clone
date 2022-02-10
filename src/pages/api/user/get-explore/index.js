import getUser from "../../../../lib/auth/getUser";
import connectToDb from "../../../../lib/db/db";
import userModel from "../../../../lib/db/models/user";
import postModel from "../../../../lib/db/models/post";

// username, profilePicture, id
async function getUserMeta(userId) {
  await connectToDb();

  try {
    const user = await userModel
      .findById(userId)
      .select("username profilePicture");

    return {
      errorOccurred: false,
      httpCode: 200,
      user: user,
    };
  } catch (error) {
    return {
      errorOccurred: true,
      error: error,
      httpCode: 500,
      message: "Something went wrong.",
    };
  }
}

// find some public users
// get posts of those users
// send those posts
async function getWallOfUser(userId) {
  await connectToDb();

  try {
    const randomPublicUsers = await userModel
      .find({ privateProfile: false })
      .limit(10);

    const postsByRandomPublicUsers = await postModel
      .find({ creator: randomPublicUsers })
      .sort("-createdAt")
      .limit(100);

    const uniquePostsUsersIds = new Set(
      postsByRandomPublicUsers.map((post) => post.creator.toString())
    );

    const postUserMetas = [];
    for (const postUserId of uniquePostsUsersIds) {
      const postUserMetaResult = await getUserMeta(postUserId);

      if (!postUserMetaResult.errorOccurred) {
        postUserMetas.push(postUserMetaResult.user);
      }
    }

    const postsByRandomPublicUsersWithUserMetas = postsByRandomPublicUsers.map(
      (post) => ({
        ...post._doc,
        creator: postUserMetas.find((userMeta) =>
          userMeta._id.equals(post._doc.creator)
        ),
      })
    );

    return {
      errorOccurred: false,
      httpCode: 200,
      postsInFeed: postsByRandomPublicUsersWithUserMetas,
    };
  } catch (error) {
    return {
      errorOccurred: true,
      error: error,
      httpCode: 500,
      message: "Something went wrong.",
    };
  }
}

export default async function handler(req, res) {
  const user = getUser(req);
  if (!user) {
    return res.status(401).send({
      message: "Sign in to continue.",
    });
  }

  const result = await getWallOfUser(user._id);
  return res.status(result.httpCode).json({
    ...result,
  });
}

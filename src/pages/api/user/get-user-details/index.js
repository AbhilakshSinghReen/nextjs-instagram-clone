import getUser from "../../../../lib/auth/getUser";
import connectToDb from "../../../../lib/db/db";
import userModel from "../../../../lib/db/models/user";
import postModel from "../../../../lib/db/models/post";



async function getUserDetails(userId) {
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

async function getUserPosts(userId){

}



export default async function handler(req, res) {
  const user = getUser(req);
  if (!user) {
    return res.status(401).send({
      message: "Sign in to continue.",
    });
  }

  // if request has a userId field, get details of that user
  // if user profile is private, show posts only if currently logged in user is following the user
  // if request has no userId field, get details of currently logged in user


  const result = await getWallOfUser(user._id);
  return res.status(result.httpCode).json({
    ...result,
  });
}

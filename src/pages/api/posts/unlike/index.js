import getUser from "../../../../lib/auth/getUser";
import connectToDb from "../../../../lib/db/db";
import postModel from "../../../../lib/db/models/post";
import validateUnlikePostRequest from "../../../../validators/posts/postUnlikeValidator";

async function unlikePost(user, postId) {
  await connectToDb();

  try {
    const post = await postModel.findById(postId).exec();

    if (!post) {
      return {
        errorOccurred: true,
        httpCode: 400,
        message: "Post does not exist.",
      };
    }

    if (!post.likes.includes(user._id)) {
      return {
        errorOccurred: true,
        httpCode: 400,
        message: "Cannot unlike.",
      };
    }

    console.log("user ", user._id);

    await postModel
      .findByIdAndUpdate(postId, {
        $pull: {
          likes: user._id,
        },
      })
      .exec();

    return {
      errorOccurred: false,
      httpCode: 201,
      message: "Post unliked successfully.",
    };
  } catch (error) {
    return {
      errorOccurred: true,
      httpCode: 500,
      error: error,
      message: "Something went wrong.",
    };
  }
}

export default async function handler(req, res) {
  const user = getUser(req);
  console.log("user ", user);
  if (!user) {
    return res.status(401).send({
      message: "Sign in to continue.",
    });
  }

  const validationResult = await validateUnlikePostRequest(req.body);
  if (!validationResult.isValid) {
    return res.status(400).json({
      error: validationResult.error.errors,
    });
  }

  const { postId } = req.body;

  const result = await unlikePost(user, postId);

  const status = result.httpCode;
  delete result.httpCode;

  return res.status(status).json({
    ...result,
  });
}

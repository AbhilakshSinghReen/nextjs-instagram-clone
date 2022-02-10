import getUser from "../../../../lib/auth/getUser";
import connectToDb from "../../../../lib/db/db";
import postModel from "../../../../lib/db/models/post";
import validateLikePostRequest from "../../../../validators/posts/postLikeValidator";

async function likePost(user, postId) {
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

    if (post.likes.includes(user._id)) {
      return {
        errorOccurred: true,
        httpCode: 400,
        message: "Double like attempt.",
      };
    }

    console.log("user ", user._id);

    await postModel
      .findByIdAndUpdate(postId, {
        $push: {
          likes: user._id,
        },
      })
      .exec();

    return {
      errorOccurred: false,
      httpCode: 201,
      message: "Post liked successfully.",
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

  const validationResult = await validateLikePostRequest(req.body);
  if (!validationResult.isValid) {
    return res.status(400).json({
      error: validationResult.error.errors,
    });
  }

  const { postId } = req.body;

  const result = await likePost(user, postId);

  const status = result.httpCode;
  delete result.httpCode;

  return res.status(status).json({
    ...result,
  });
}

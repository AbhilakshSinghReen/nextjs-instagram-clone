import getUser from "../../../../lib/auth/getUser";

import connectToDb from "../../../../lib/db/db";
import postModel from "../../../../lib/db/models/post";
import validatePostDeleteRequest from "../../../../validators/posts/postDeleteValidator";
import { deleteFolderFromStorage } from "../../../../lib/storage/storage";

async function deletePost(user, postId) {
  await connectToDb();

  try {
    const post = await postModel.findById(postId).exec();

    if (!post) {
      return {
        errorOccurred: true,
        message: "Post does not exist.",
      };
    }

    if (!post.creator.equals(user._id)) {
      return {
        errorOccurred: true,
        message: "Unauthorized.",
      };
    }

    await postModel.findByIdAndDelete(postId).exec();
    deleteFolderFromStorage(`posts/${postId}`);

    return {
      errorOccurred: false,
      message: "Post deleted successfully.",
    };
  } catch (error) {
    return {
      errorOccurred: true,
      error: error,
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

  const validationResult = await validatePostDeleteRequest(req.body);
  if (!validationResult.isValid) {
    return res.status(400).json({
      error: validationResult.error.errors,
    });
  }

  const { postId } = req.body;

  const result = await deletePost(user, postId);

  const status = result.errorOccurred
    ? result.message === "Unauthorized."
      ? 401
      : result.message === "Post does not exist."
      ? 400
      : 500
    : 200;

  return res.status(status).json({
    ...result,
  });
}

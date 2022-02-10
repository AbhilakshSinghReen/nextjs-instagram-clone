import getUser from "../../../../lib/auth/getUser";
import connectToDb from "../../../../lib/db/db";
import commentModel from "../../../../lib/db/models/comment";
import validateCreateCommentRequest from "../../../../validators/comments/createCommentValidator";

async function createComment(postId, userId, commentContent) {
  await connectToDb();

  const newComment = new commentModel({
    post: postId,
    creator: userId,
    content: commentContent,
  });

  try {
    const comment = await newComment.save();

    return {
      errorOccurred: false,
      httpCode: 201,
      message: "Comment created successfully.",
      comment: comment,
    };
  } catch (error) {
    console.log(error);
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
  if (!user) {
    return res.status(401).send({
      message: "Sign in to continue.",
    });
  }

  const validationResult = await validateCreateCommentRequest(req.body);
  if (!validationResult.isValid) {
    return res.status(400).json({
      error: validationResult.error.errors,
    });
  }

  const { postId, content } = req.body;

  const result = await createComment(postId, user._id, content);

  const status = result.httpCode;
  delete result.httpCode;
  return res.status(status).json({
    ...result,
  });
}

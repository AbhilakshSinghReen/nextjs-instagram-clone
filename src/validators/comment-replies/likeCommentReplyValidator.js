import { object, string } from "yup";

import validateObject from "../schemaValidator";

const likeCommentReplySchema = object({
  commentId: string().required(),
  replyId: string().required(),
});

export default async function validateLikeCommentReplyRequest(requestBody) {
  const result = await validateObject(likeCommentReplySchema, requestBody, {
    abortEarly: false,
  });
  return result;
}

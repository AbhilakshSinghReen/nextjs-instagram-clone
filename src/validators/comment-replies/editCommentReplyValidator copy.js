import { object, string } from "yup";

import validateObject from "../schemaValidator";

const editCommentReplySchema = object({
  commentId: string().required(),
  replyId: string().required(),
  content: string().required().max(500),
});

export default async function validateEditCommentReplyRequest(requestBody) {
  const result = await validateObject(editCommentReplySchema, requestBody, {
    abortEarly: false,
  });
  return result;
}

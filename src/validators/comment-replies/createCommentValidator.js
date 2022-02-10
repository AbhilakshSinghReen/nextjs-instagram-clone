import { object, string } from "yup";

import validateObject from "../schemaValidator";

const createCommentReplySchema = object({
  commentId: string().required(),
  content: string().required().max(500),
});

export default async function validateCreateCommentReplyRequest(requestBody) {
  const result = await validateObject(createCommentReplySchema, requestBody, {
    abortEarly: false,
  });
  return result;
}

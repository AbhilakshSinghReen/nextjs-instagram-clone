import { object, string } from "yup";

import validateObject from "../schemaValidator";

const editCommentSchema = object({
  commentId: string().required(),
  content: string().required().max(500),
});

export default async function validateEditCommentRequest(requestBody) {
  const result = await validateObject(editCommentSchema, requestBody, {
    abortEarly: false,
  });
  return result;
}

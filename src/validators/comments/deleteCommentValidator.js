import { object, string } from "yup";

import validateObject from "../schemaValidator";

const deleteCommentSchema = object({
  commentId: string().required(),
});

export default async function validateDeleteCommentRequest(requestBody) {
  const result = await validateObject(deleteCommentSchema, requestBody, {
    abortEarly: false,
  });
  return result;
}

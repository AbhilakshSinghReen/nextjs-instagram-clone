import { object, string } from "yup";

import validateObject from "../schemaValidator";

const likePostSchema = object({
  postId: string().required(),
});

export default async function validateLikePostRequest(requestBody) {
  const result = await validateObject(likePostSchema, requestBody, {
    abortEarly: false,
  });
  return result;
}

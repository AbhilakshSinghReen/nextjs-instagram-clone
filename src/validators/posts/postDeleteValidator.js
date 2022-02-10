import { object, string } from "yup";

import validateObject from "../schemaValidator";

const postDeleteSchema = object({
  postId: string().required(),
});

export default async function validatePostDeleteRequest(requestBody) {
  const result = await validateObject(postDeleteSchema, requestBody, {
    abortEarly: false,
  });
  return result;
}

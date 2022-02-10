import { object, string } from "yup";

import validateObject from "../schemaValidator";

const signUpSchema = object({
  emailOrUsername: string().required(),
  password: string().required().min(8),
});

export default async function validateSignInRequest(requestBody) {
  const result = await validateObject(signUpSchema, requestBody, {
    abortEarly: false,
  });
  return result;
}

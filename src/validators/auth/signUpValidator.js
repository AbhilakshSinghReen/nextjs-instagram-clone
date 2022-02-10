import { object, string } from "yup";

import validateObject from "../schemaValidator";

const signUpSchema = object({
  email: string().required(),
  username: string().required().min(3).max(20),
  name: string().required().min(3).max(50),
  password: string().required().min(8),
});

export default async function validateSignUpRequest(requestBody) {
  const result = await validateObject(signUpSchema, requestBody, {
    abortEarly: false,
  });
  return result;
}

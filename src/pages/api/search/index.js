import getUser from "../../../lib/auth/getUser";
import connectToDb from "../../../lib/db/db";
import userModel from "../../../lib/db/models/user";

// async function getUserMeta(userId) {
//   await connectToDb();

//   try {
//     const user = await userModel
//       .findById(userId)
//       .select("username profilePicture");

//     return {
//       errorOccurred: false,
//       httpCode: 200,
//       user: user,
//     };
//   } catch (error) {
//     return {
//       errorOccurred: true,
//       error: error,
//       httpCode: 500,
//       message: "Something went wrong.",
//     };
//   }
// }

async function searchForUser(userSearchQuery) {
  await connectToDb();

  try {
    const users = await userModel
      .find({
        username: {
          $regex: new RegExp("^" + userSearchQuery),
        },
      })
      .select("username profilePicture")
      .exec();

    console.log(users);

    return {
      errorOccurred: false,
      httpCode: 200,
      users: users,
    };
  } catch (error) {
    console.log(error);
    return {
      errorOccurred: true,
      error: error,
      httpCode: 500,
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

  const { userSearchQuery } = req.body;

  const result = await searchForUser(userSearchQuery);
  return res.status(result.httpCode).json({
    ...result,
  });
}

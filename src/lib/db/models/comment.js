const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      max: 500,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    replies: [
      {
        creator: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
          max: 200,
        },
        likes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Comment ||
  mongoose.model("Comment", commentSchema);

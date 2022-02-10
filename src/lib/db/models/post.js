const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    caption: {
      type: String,
      required: true,
      max: 500,
    },
    // ???
    // postType: {
    //   type: String,
    //   enum: ["admin", "user"],
    // },
    media: [
      {
        type: {
          type: String,
          enum: ["image", "video"],
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Post || mongoose.model("Post", postSchema);

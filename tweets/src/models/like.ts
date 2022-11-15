import mongoose from "mongoose";
import { UserDoc } from "./user";
import { TweetDoc } from "./tweet";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface LikeAttrs {
  tweetId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  id: mongoose.Types.ObjectId;
}

interface LikeDoc extends mongoose.Document {
  tweetId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
}

interface LikeModel extends mongoose.Model<LikeDoc> {
  build(attrs: LikeAttrs): LikeDoc;
}

const likeSchema = new mongoose.Schema(
  {
    tweetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

likeSchema.set("versionKey", "version");

likeSchema.plugin(updateIfCurrentPlugin);

likeSchema.statics.build = (attrs: LikeAttrs) => {
  return new Like({
    _id: attrs.id,
    userId: attrs.userId,
    tweetId: attrs.tweetId,
    createdAt: attrs.createdAt,
  });
};

export const Like = mongoose.model<LikeDoc, LikeModel>("Like", likeSchema);

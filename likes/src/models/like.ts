import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface LikeAttrs {
  tweetId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
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
    optimisticConcurrency: true,
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
  return new Like(attrs);
};

export const Like = mongoose.model<LikeDoc, LikeModel>("Like", likeSchema);

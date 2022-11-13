import { ConflictError } from "@domosideproject/twitter-common";
import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface LikeAttrs {
  tweetId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
}

interface LikeDoc extends mongoose.Document {
  tweetId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
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

// handle duplicate key error(multiple like by same user on same tweet)
likeSchema.post("save", function (error: any, doc: LikeDoc, next: any) {
  if (error.code === 11000) {
    next(new ConflictError("can not like same tweet more than once"));
  }
  next();
});

// prevent tweet have multiple like from same user
likeSchema.index({ tweetId: 1, userId: 1 }, { unique: true });

likeSchema.statics.build = (attrs: LikeAttrs) => {
  return new Like(attrs);
};

export const Like = mongoose.model<LikeDoc, LikeModel>("Like", likeSchema);

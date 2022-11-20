import {
  ConflictError,
  LikeDeletedContent,
} from "@domosideproject/twitter-common";
import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { connection } from "../app";
import { LikeDeletedPublishers } from "../publishers/like-deleted";

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
likeSchema.post("remove", async function () {
  const content: LikeDeletedContent = {
    // @ts-ignore
    id: this._id.toHexString(),
  };
  await new LikeDeletedPublishers(connection).publish(content);
});

// 推文被刪除後，會觸發連動刪除相關讚紀錄，當讚被刪除後，這邊會幫我們publish to like:deleted queue
likeSchema.pre("deleteMany", async function () {
  // @ts-ignore
  const tweetId = this._conditions.tweetId.toHexString();

  if (tweetId) {
    const deletedLikes = await Like.find({ tweetId });
    if (deletedLikes.length) {
      const publisher = new LikeDeletedPublishers(connection);
      await Promise.all(
        deletedLikes.map(({ _id }) =>
          publisher.publish({
            // @ts-ignore
            id: _id.toHexString(),
          })
        )
      );
    }
  }
});

// prevent tweet have multiple like from same user
likeSchema.index({ tweetId: 1, userId: 1 }, { unique: true });

likeSchema.statics.build = (attrs: LikeAttrs): LikeDoc => {
  return new Like(attrs);
};

export const Like = mongoose.model<LikeDoc, LikeModel>("Like", likeSchema);

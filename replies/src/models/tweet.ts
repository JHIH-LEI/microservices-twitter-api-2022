import mongoose from "mongoose";
import { Reply } from "./reply";
interface TweetAttrs {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
}

// 不需要版本來處理concurrency update的問題，因為只有userId欄位，貼文只有新增/刪除時需要同步更新。如果刪除的event先跑進來，就會找不到資料，那event就晚點再處理就好，推文server會做好驗證，確保刪除的貼文是一定有效的資料要被做刪除。

export interface TweetDoc extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
}

interface TweetModel extends mongoose.Model<TweetDoc> {
  build(attrs: TweetAttrs): TweetDoc;
}

const tweetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
    },
  },
  {
    optimisticConcurrency: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

tweetSchema.statics.build = (attrs: TweetAttrs) => {
  return new Tweet(attrs);
};

// before delete tweet delete all related reply
tweetSchema.pre("remove", async function (next) {
  // @ts-ignore query type didn't eat our TweetDoc type
  await Reply.deleteMany({ tweetId: this._id });
  next();
});

export const Tweet = mongoose.model<TweetDoc, TweetModel>("Tweet", tweetSchema);

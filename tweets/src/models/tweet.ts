import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
interface TweetAttrs {
  description: string;
  userId: mongoose.Schema.Types.ObjectId;
}

export interface TweetDoc extends mongoose.Document {
  description: string;
  userId: mongoose.Schema.Types.ObjectId;
  totalReplies: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TweetModel extends mongoose.Model<TweetDoc> {
  build(attrs: TweetAttrs): TweetDoc;
  /**
   *
   * 確保event的處理順序 === event觸發者對資料處理的順序，
   * 才不會有資料結果不一致的問題。
   * 返回null，代表資料庫這筆資料的版本並不是該次資料的前一個版本，
   * 還有版本沒被更新到，請稍後再試。
   */
  findByVersionOrder(event: {
    id: string;
    version: number;
  }): Promise<TweetDoc | null>;
}

const tweetSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    totalReplies: {
      type: Number,
      required: true,
      default: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
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

tweetSchema.set("versionKey", "version");
tweetSchema.plugin(updateIfCurrentPlugin);

tweetSchema.statics.build = (attrs: TweetAttrs) => {
  return new Tweet(attrs);
};
tweetSchema.statics.findByVersionOrder = (event: {
  id: string;
  version: number;
}) => {
  return Tweet.findOne({ _id: event.id, version: event.version - 1 });
};

export const Tweet = mongoose.model<TweetDoc, TweetModel>("Tweet", tweetSchema);

import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface ReplyAttrs {
  tweetId: string;
  userId: string;
  comment: string;
}

interface ReplyDoc extends mongoose.Document {
  tweetId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  comment: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ReplyModel extends mongoose.Model<ReplyDoc> {
  build(attrs: ReplyAttrs): ReplyDoc;
}

const replySchema = new mongoose.Schema(
  {
    tweetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
    },
    comment: {
      type: String,
      require: true,
    },
    version: {
      type: Number,
      default: 0,
      require: true,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

replySchema.set("versionKey", "version");
replySchema.plugin(updateIfCurrentPlugin);

replySchema.statics.build = (attrs: ReplyAttrs) => {
  return new Reply(attrs);
};

export const Reply = mongoose.model<ReplyDoc, ReplyModel>("Reply", replySchema);

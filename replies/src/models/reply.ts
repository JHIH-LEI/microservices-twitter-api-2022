import { ReplyDeletedContent } from "@domosideproject/twitter-common";
import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { connection } from "../app";
import { ReplyDeletedPublisher } from "../publishers/reply-deleted";

interface ReplyAttrs {
  tweetId: string;
  userId: string;
  comment: string;
}

interface ReplyDoc extends mongoose.Document {
  tweetId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
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

replySchema.post("remove", async function () {
  const content: ReplyDeletedContent = {
    // @ts-ignore can not know our ReplyDoc type
    id: this._id.toHexString(),
    // @ts-ignore can not know our ReplyDoc type
    version: this.version,
  };
  // @ts-ignore
  await new ReplyDeletedPublisher(connection).publish(content);
});

export const Reply = mongoose.model<ReplyDoc, ReplyModel>("Reply", replySchema);

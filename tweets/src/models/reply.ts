import mongoose from "mongoose";

interface ReplyAttrs {
  id: mongoose.Types.ObjectId;
  tweetId: mongoose.Types.ObjectId;
  version: number;
}

interface ReplyDoc extends mongoose.Document {
  tweetId: mongoose.Types.ObjectId;
  version: number;
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

replySchema.set("versionKey", "version");

replySchema.statics.build = (attrs: ReplyAttrs) => {
  return new Reply({
    _id: attrs.id,
    tweetId: attrs.tweetId,
    version: attrs.version,
  });
};

export const Reply = mongoose.model<ReplyDoc, ReplyModel>("Reply", replySchema);

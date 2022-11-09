import mongoose from "mongoose";

interface ReplyAttrs {
  tweetId: mongoose.Schema.Types.ObjectId;
}

interface ReplyDoc extends mongoose.Document {
  tweetId: mongoose.Schema.Types.ObjectId;
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

replySchema.statics.build = (attrs: ReplyAttrs) => {
  return new Reply(attrs);
};

export const Reply = mongoose.model<ReplyDoc, ReplyModel>("Reply", replySchema);

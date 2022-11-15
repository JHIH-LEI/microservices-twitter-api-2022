import mongoose from "mongoose";

interface ReplyAttrs {
  tweetId: mongoose.Types.ObjectId;
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

interface ReplyDoc extends mongoose.Document {
  tweetId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

interface ReplyModel extends mongoose.Model<ReplyDoc> {
  build(attrs: ReplyAttrs): ReplyDoc;
  findOneAndDeletedByVersionOrder(event: {
    id: string;
    version: number;
  }): Promise<ReplyDoc | null>;
}

const replySchema = new mongoose.Schema(
  {
    tweetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    createdAt: {
      type: Date,
      require: true,
    },
    updatedAt: {
      type: Date,
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

replySchema.set("versionKey", "version");

replySchema.statics.build = (attrs: ReplyAttrs) => {
  return new Reply(attrs);
};

replySchema.statics.findOneAndDeletedByVersionOrder = async (event: {
  id: string;
  version: number;
}) => {
  return Reply.findOneAndDelete({ id: event.id, version: event.version });
};

export const Reply = mongoose.model<ReplyDoc, ReplyModel>("Reply", replySchema);

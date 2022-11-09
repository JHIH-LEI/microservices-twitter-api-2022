import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface UserAttrs {
  name: string;
  account: string;
  avatar: string;
  version: number;
}

export interface UserDoc extends mongoose.Document {
  name: string;
  account: string;
  avatar: string;
  version: number;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
  findByVersionOrder(event: {
    id: string;
    version: number;
  }): Promise<UserDoc | null>;
}

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    account: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
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

userSchema.set("versionKey", "version");
userSchema.plugin(updateIfCurrentPlugin);

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};
userSchema.statics.findByVersionOrder = (event: {
  id: string;
  version: number;
}) => {
  return User.findOne({ _id: event.id, version: event.version - 1 });
};

export const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

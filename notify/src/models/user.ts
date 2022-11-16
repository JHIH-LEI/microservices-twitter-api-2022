import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface UserAttrs {
  _id: mongoose.Types.ObjectId;
  name: string;
  avatar: string;
  version: number;
}

interface UserDoc extends mongoose.Document {
  name: string;
  avatar: string;
  version: number;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  avatar: {
    type: String,
    require: true,
  },
});

userSchema.set("versionKey", "version");
userSchema.plugin(updateIfCurrentPlugin);

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

export const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

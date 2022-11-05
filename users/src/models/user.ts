import mongoose from "mongoose";
import { Password } from "../services/password";

// version概念
// 更新的時候要更新版本號
// event收到時更新前要確認版本號是否為資料庫的後一版

interface UserAttrs {
  name: string;
  account: string;
  email: string;
  password: string;
}

interface UserDoc extends mongoose.Document {
  name: string;
  account: string;
  email: string;
  password: string;
  intro: string;
  avatar: string;
  banner: string;
  isAdmin: boolean;
  version: number;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: 50,
  },
  email: {
    type: String,
    required: true,
  },
  account: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  intro: {
    type: String,
    required: true,
    default: "",
  },
  avatar: {
    type: String,
    required: true,
    default: "",
  },
  banner: {
    type: String,
    required: true,
    default: "",
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  version: {
    type: Number,
    required: true,
  },
});

userSchema.set("versionKey", "version");

userSchema.pre("save", async function (done) {
  // this = userDoc, if we use arrow func will override this to context.

  this.version = this.version + 1;

  if (!this.isModified("password")) {
    done();
  }

  const hashPassword = await Password.toHash(this.get("password"));
  this.set("password", hashPassword);
  done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

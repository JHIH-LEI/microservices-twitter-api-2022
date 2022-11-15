import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface UserAttrs {
  _id: mongoose.Types.ObjectId;
  name: string;
  account: string;
  avatar: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDoc extends mongoose.Document {
  name: string;
  account: string;
  avatar: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
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

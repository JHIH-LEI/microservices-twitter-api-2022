import { NotificationType } from "@domosideproject/twitter-common";
import mongoose from "mongoose";

interface NotificationAttrs {
  id: mongoose.Types.ObjectId;
  type: NotificationType;
  main: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
  triggerId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
}

interface NotificationDoc extends mongoose.Document {
  id: mongoose.Types.ObjectId;
  type: NotificationType;
  main: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
  triggerId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
}

interface NotificationModel extends mongoose.Model<NotificationDoc> {
  build(attrs: NotificationAttrs): NotificationDoc;
}

/**
 * id為該通知點進去後要導入的資源id，如推文通知會給推文的id
 * 追蹤訂閱給的id為觸發者的userId
 * _id則為該通知的id
 */
const notificationSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
  },
  type: {
    type: String,
    enum: NotificationType,
    require: true,
  },
  main: {
    type: String,
  },
  isRead: {
    type: Boolean,
    require: true,
    default: false,
  },
  createdAt: {
    type: Date,
    require: true,
  },
  updatedAt: {
    type: Date,
    require: true,
  },
  triggerId: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
  },
});

notificationSchema.statics.build = (attrs: NotificationAttrs) => {
  return new Notification(attrs);
};

export const Notification = mongoose.model<NotificationDoc, NotificationModel>(
  "Notification",
  notificationSchema
);

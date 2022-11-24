export enum NotificationType {
  Tweet = "tweet",
  Subscribe = "subscribeship",
  Follow = "followship",
  Like = "like",
  Reply = "reply",
}

/**
 * @param id 資源的id，像是新推文/新留言就會是給推文的id，追蹤/訂閱給觸發者的id
 * @param createdAt 資源新增的時間
 * @param main: 通知要顯示的內文，可能是空白(追蹤/訂閱)、新推文內文、新回覆的內容
 */

export interface NotificationCreatedContent {
  id: string;
  createdAt: string;
  type: NotificationType;
  main: string;
  userId: string;
  notifyUserIds: string[];
}

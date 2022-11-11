export enum NotificationType {
  Tweet = "tweet",
  Subscribe = "subscribeship",
  Follow = "followship",
  Like = "like",
  Reply = "reply",
}

export interface NotificationMessage {
  id: string;
  createdAt: string;
  type: NotificationType;
  main: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
}

import {
  NotificationCreatedContent,
  NotificationType,
} from "@domosideproject/twitter-common";

export interface ServerToClientEvents {
  notify: (notification: NotifyPopupContent) => void;
  isRead: (id: string) => void;
  notificationCounts: (counts: number) => void;
}

export interface ClientToServerEvents {
  isRead: (id: string) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  userId: string;
  socketId: string;
}

// 前端會根據這個來渲染跳出的通知
export interface NotifyPopupContent {
  id: string;
  createdAt: string;
  type: NotificationType;
  main: string;
  userId: string;
  name: string;
  avatar: string;
}

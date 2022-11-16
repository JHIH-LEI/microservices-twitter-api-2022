export interface ServerToClientEvents {
  notify: (notification: any) => void;
  isRead: (id: string) => void;
  notificationCounts: (counts: number) => void;
}

export interface ClientToServerEvents {
  isRead: (id: string) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  userId: string;
}

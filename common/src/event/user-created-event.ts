import { Queue } from "./queue";

export interface UserCreatedContent {
  id: string;
  name: string;
  account: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface UserCreatedEvent {
  queue: Queue.UserCreated;
  content: UserCreatedContent;
}

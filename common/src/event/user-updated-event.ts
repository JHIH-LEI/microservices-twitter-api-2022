import { Queue } from "./queue";

export interface UserUpdatedContent {
  id: string;
  name: string;
  account: string;
  avatar: string;
  updatedAt: string;
  version: number;
}

export interface UserCreatedEvent {
  queue: Queue.UserUpdated;
  content: UserUpdatedContent;
}

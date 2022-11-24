import { BindingKey } from "./bindingKey";

export interface TweetCreatedContent {
  id: string;
  userId: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface TweetCreatedEvent {
  queue: string;
  content: TweetCreatedContent;
  bindingKey: BindingKey;
}

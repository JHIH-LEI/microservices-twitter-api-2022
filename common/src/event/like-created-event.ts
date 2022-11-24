import { BindingKey } from "./bindingKey";

export interface LikeCreatedContent {
  id: string;
  tweetId: string;
  userId: string;
  createdAt: string;
}

export interface LikeCreatedEvent {
  queue: string;
  content: LikeCreatedContent;
  bindingKey: BindingKey;
}

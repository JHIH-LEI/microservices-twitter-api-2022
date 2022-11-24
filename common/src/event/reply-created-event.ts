import { BindingKey } from "./bindingKey";

/**
 * id is mongodb id
 */
export interface ReplyCreatedContent {
  id: string;
  tweetId: string;
  comment: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface ReplyCreatedEvent {
  queue: string;
  content: ReplyCreatedContent;
  bindingKey: BindingKey;
}

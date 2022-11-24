import { BindingKey } from "./bindingKey";

export interface TweetUpdatedContent {
  id: string;
  description: string;
  updatedAt: string;
  version: number;
}

export interface TweetUpdatedEvent {
  queue: string;
  content: TweetUpdatedContent;
  bindingKey: BindingKey;
}

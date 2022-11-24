import { BindingKey } from "./bindingKey";

export interface TweetDeletedContent {
  id: string;
  version: number;
}

export interface TweetDeletedEvent {
  queue: string;
  content: TweetDeletedContent;
  bindingKey: BindingKey;
}

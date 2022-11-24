import { BindingKey } from "./bindingKey";

export interface SubscribeshipCreatedContent {
  subscriberId: string;
  subscribingId: string;
  createdAt: string;
}

export interface SubscribeshipCreatedEvent {
  queue: string;
  content: SubscribeshipCreatedContent;
  bindingKey: BindingKey;
}

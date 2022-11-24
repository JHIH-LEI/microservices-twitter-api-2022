import { BindingKey } from "./bindingKey";

export interface SubscribeshipDeletedContent {
  subscriberId: string;
  subscribingId: string;
}

export interface SubscribeshipDeletedEvent {
  queue: string;
  content: SubscribeshipDeletedContent;
  bindingKey: BindingKey;
}

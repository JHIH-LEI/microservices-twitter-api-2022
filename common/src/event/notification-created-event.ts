import { BindingKey } from "./bindingKey";
import { NotificationCreatedContent } from "./types/notification";

// build-notification
export interface NotificationCreatedEvent {
  queue: string;
  content: NotificationCreatedContent;
  bindingKey: BindingKey;
}

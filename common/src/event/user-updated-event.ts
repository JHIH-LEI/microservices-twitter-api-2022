import { BindingKey } from "./bindingKey";

export interface UserUpdatedContent {
  id: string;
  name: string;
  account: string;
  avatar: string;
  updatedAt: string;
  version: number;
}

export interface UserUpdatedEvent {
  queue: string;
  content: UserUpdatedContent;
  bindingKey: BindingKey;
}

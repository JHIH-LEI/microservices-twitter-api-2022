import { BindingKey } from "./bindingKey";

export interface UserCreatedContent {
  id: string;
  name: string;
  account: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface UserCreatedEvent {
  queue: string;
  content: UserCreatedContent;
  bindingKey: BindingKey;
}

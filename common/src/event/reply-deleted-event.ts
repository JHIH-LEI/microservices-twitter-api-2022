import { BindingKey } from "./bindingKey";

/**
 * id is mongodb id
 */
export interface ReplyDeletedContent {
  id: string;
  version: number;
}

export interface ReplyDeletedEvent {
  queue: string;
  content: ReplyDeletedContent;
  bindingKey: BindingKey;
}

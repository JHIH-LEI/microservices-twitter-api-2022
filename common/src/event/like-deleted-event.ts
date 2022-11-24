import { BindingKey } from "./bindingKey";

/**
 * id is mongodb id
 */
export interface LikeDeletedContent {
  id: string;
}

export interface LikeDeletedEvent {
  queue: string;
  content: LikeDeletedContent;
  bindingKey: BindingKey;
}

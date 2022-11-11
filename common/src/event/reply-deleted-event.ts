import { Queue } from "./queue";

/**
 * id is mongodb id
 */
export interface ReplyCreatedContent {
  id: string;
  version: number;
}

export interface ReplyCreatedEvent {
  queue: Queue.ReplyDeleted;
  content: ReplyCreatedContent;
}

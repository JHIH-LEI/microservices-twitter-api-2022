import { Queue } from "./queue";

/**
 * id is mongodb id
 */
export interface ReplyDeletedContent {
  id: string;
  version: number;
}

export interface ReplyDeletedEvent {
  queue: Queue.ReplyDeleted;
  content: ReplyDeletedContent;
}

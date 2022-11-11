import { Queue } from "./queue";

/**
 * id is mongodb id
 */
export interface LikeDeletedContent {
  id: string;
}

export interface LikeDeletedEvent {
  queue: Queue.LikeDeleted;
  content: LikeDeletedContent;
}

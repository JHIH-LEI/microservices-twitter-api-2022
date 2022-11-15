import { Queue } from "./queue";

export interface Event {
  content: any;
  queue: Queue;
}

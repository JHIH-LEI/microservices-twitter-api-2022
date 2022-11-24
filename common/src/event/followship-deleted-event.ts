import { BindingKey } from "./bindingKey";

export interface FollowshipDeletedContent {
  followerId: string;
  followingId: string;
}

export interface FollowshipDeletedEvent {
  queue: string;
  content: FollowshipDeletedContent;
  bindingKey: BindingKey;
}

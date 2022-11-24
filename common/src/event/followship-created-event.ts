import { BindingKey } from "./bindingKey";

export interface FollowshipCreatedContent {
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface FollowshipCreatedEvent {
  queue: string;
  content: FollowshipCreatedContent;
  bindingKey: BindingKey;
}

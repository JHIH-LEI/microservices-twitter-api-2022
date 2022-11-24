import { BindingKey } from "./bindingKey";

export enum Service {
  User = "users",
  Tweet = "tweets",
  Notify = "notify",
  BuildNotification = "build-notifications",
  Subscribeship = "subscribeships",
  Followship = "followships",
}

/**
 *
 * @param service
 * @param bindingKey
 * @returns queue name. 格式：訂閱的服務＋訂閱的bindingkey
 */
export function getQueueName(service: Service, bindingKey: BindingKey) {
  return `${service}_${bindingKey}`;
}

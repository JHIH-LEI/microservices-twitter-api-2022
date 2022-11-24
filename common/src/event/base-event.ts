import { BindingKey } from "./bindingKey";

export interface Event {
  content: any;
  queue: string;
  bindingKey: BindingKey;
}

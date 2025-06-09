import { ChatEvents } from './chat-events.enum';

export type NewMessagePayload =
  | {
      type: 'user';
      username: string;
      message: string;
      timestamp: string;
    }
  | {
      type: 'system';
      message: string;
      timestamp: string;
      users: string[];
    };

export interface WsEvents {
  [ChatEvents.NEW_MESSAGE]: NewMessagePayload;
  [ChatEvents.ON_USER_JOIN]: NewMessagePayload;
}

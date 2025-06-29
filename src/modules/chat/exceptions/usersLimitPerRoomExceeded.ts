import { BaseException } from './baseException';

export class UsersLimitPerRoomExceeded extends BaseException {
  constructor(private readonly usersLimit: number) {
    super(`Room has reached maximum users ${usersLimit}`);
    this.name = 'usersLimitPerRoomExceeded';
  }

  toErrorResponse() {
    return {
      errorType: 'UsersLimitPerRoomExceeded',
      message: 'Room already has 5 online members',
    };
  }
}

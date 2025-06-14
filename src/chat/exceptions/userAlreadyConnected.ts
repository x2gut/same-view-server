import { BaseException } from './baseException';

export class UserAlreadyConnectedException extends BaseException {
  constructor(
    private readonly username: string,
    private readonly roomId: string,
  ) {
    super(`User "${username}" already connected to room "${roomId}"`);
    this.name = 'UserAlreadyConnectedException';
  }

  toErrorResponse() {
    return {
      errorType: 'UserAlreadyConnected',
      message: `User ${this.username} is already connected to the room`,
    };
  }
}

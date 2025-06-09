export class UserAlreadyConnectedException extends Error {
  constructor(username: string, roomId: string) {
    super(`User ${username} is already connected to room ${roomId}`);
    this.name = 'UserAlreadyConnectedException';
  }
}

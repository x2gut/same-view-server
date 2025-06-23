export class InvalidRoomPasswordException extends Error {
  constructor() {
    super('Invalid room password');
  }
}

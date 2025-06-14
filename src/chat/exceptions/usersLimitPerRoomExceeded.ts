export class UsersLimitPerRoomExceeded extends Error {
  constructor(usersLimit: number) {
    super(`Room has reached maximum users ${usersLimit}`);
    this.name = 'usersLimitPerRoomExceeded';
  }
}

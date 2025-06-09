function generateRoomKey(length: number = 12) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let res = '';

  for (let i = 0; i <= length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    res += chars[randomIndex];
  }

  return res;
}

export default generateRoomKey;

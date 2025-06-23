import { Document } from 'mongoose';
import { Room } from '../schemas/create-room.schema';

export type RoomDocument = Room & Document;

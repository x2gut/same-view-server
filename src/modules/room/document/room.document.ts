import { Document } from 'mongoose';
import { Room } from '../schemas/room.schema';

export type RoomDocument = Room & Document;

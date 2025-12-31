/**
 * Room DTOs
 */

/**
 * Create Room Request Body
 * POST /api/rooms
 */
export interface CreateRoomDto {
  name: string;
  description?: string;  // Optional
}

/**
 * Update Room Request Body
 * PUT /api/rooms/:id
 */
export interface UpdateRoomDto {
  name?: string;
  description?: string;
}

/**
 * Room Response
 * What a room looks like in responses
 */
export interface RoomResponseDto {
  id: string;
  name: string;
  description: string | null;
  type?: string;  // "public" or "direct"
  createdAt: Date;
  updatedAt: Date;
  memberCount?: number;  // Optional: include member count
  unreadCount?: number;  // Optional: number of unread messages
}

/**
 * Room with Members Response
 * GET /api/rooms/:id (detailed view)
 */
export interface RoomWithMembersDto extends RoomResponseDto {
  members: {
    id: string;
    username: string;
    joinedAt: Date;
  }[];
}

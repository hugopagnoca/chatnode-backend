/**
 * Message DTOs
 */

/**
 * Create Message Request Body
 * POST /api/rooms/:roomId/messages
 */
export interface CreateMessageDto {
  content: string;
}

/**
 * Message Response
 * What a message looks like in responses
 */
export interface MessageResponseDto {
  id: string;
  content: string;
  roomId: string;
  userId: string;
  user: {
    id: string;
    username: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Paginated Messages Response
 * GET /api/rooms/:roomId/messages
 */
export interface PaginatedMessagesDto {
  messages: MessageResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * Query parameters for getting messages
 */
export interface GetMessagesQueryDto {
  page?: number;    // Default: 1
  limit?: number;   // Default: 50, max: 100
}

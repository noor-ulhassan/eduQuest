// Shared in-memory state for all competition rooms.
// Import from here — never re-declare rooms elsewhere.

export const rooms       = new Map(); // roomCode → room object
export const userRoomMap = new Map(); // userId   → roomCode (O(1) disconnect lookup)
export const getRooms    = () => rooms;

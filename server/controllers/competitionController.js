import { getRooms } from "../socket/roomHandler.js";

export const getRoomInfo = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const rooms = getRooms();
    const room = rooms.get(roomCode);

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    return res.status(200).json({
      success: true,
      room: {
        roomCode: room.roomCode,
        hostId: room.hostId,
        status: room.status,
        category: room.category,
        difficulty: room.difficulty,
        language: room.language,
        topic: room.topic,
        description: room.description,
        totalQuestions: room.totalQuestions,
        timerDuration: room.timerDuration,
        playerCount: room.players.length,
        players: room.players.map((p) => ({
          id: p.id,
          name: p.name,
          avatarUrl: p.avatarUrl,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllActiveRooms = async (req, res) => {
  try {
    const rooms = getRooms();
    const activeRooms = [];

    for (const [code, room] of rooms) {
      if (room.status === "waiting" || room.status === "active") {
        const hostPlayer = room.players.find((p) => p.id === room.hostId);
        const elapsed = room.startTime
          ? Math.floor((Date.now() - room.startTime) / 1000)
          : 0;

        activeRooms.push({
          roomCode: code,
          hostName: hostPlayer?.name || "Unknown",
          hostAvatar: hostPlayer?.avatarUrl || null,
          status: room.status,
          category: room.category,
          topic: room.topic || null,
          description: room.description || null,
          difficulty: room.difficulty,
          language: room.language,
          playerCount: room.players.length,
          spectatorCount: (room.spectators || []).length,
          maxPlayers: 20,
          timerDuration: room.timerDuration,
          elapsedTime: elapsed,
          startTime: room.startTime || null,
          createdAt: room.createdAt,
        });
      }
    }

    // Sort: active games first, then waiting. Within each, newest first.
    activeRooms.sort((a, b) => {
      if (a.status === "active" && b.status !== "active") return -1;
      if (b.status === "active" && a.status !== "active") return 1;
      return b.createdAt - a.createdAt;
    });

    return res.status(200).json({ success: true, rooms: activeRooms });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

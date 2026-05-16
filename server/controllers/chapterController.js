import { Chapter } from "../models/Chapter.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getChaptersByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const chapters = await Chapter.find({ courseId }).sort({ chapterNumber: 1 });
  return res.status(200).json(new ApiResponse(200, { chapters }));
});

export const updateChapter = asyncHandler(async (req, res) => {
  const { chapterId } = req.params;
  const { title, blocks } = req.body;
  const update = {};
  if (title !== undefined) update.title = title;
  if (blocks !== undefined) update.blocks = blocks;
  const chapter = await Chapter.findByIdAndUpdate(chapterId, { $set: update }, { new: true });
  if (!chapter) throw new ApiError(404, "Chapter not found");
  return res.status(200).json(new ApiResponse(200, { chapter }));
});

export const removeBlock = asyncHandler(async (req, res) => {
  const { chapterId, blockId } = req.params;
  const chapter = await Chapter.findByIdAndUpdate(
    chapterId,
    { $pull: { blocks: { id: blockId } } },
    { new: true }
  );
  if (!chapter) throw new ApiError(404, "Chapter not found");
  return res.status(200).json(new ApiResponse(200, { chapter }));
});

export const reorderBlocks = asyncHandler(async (req, res) => {
  const { chapterId } = req.params;
  const { blockIds } = req.body;
  if (!Array.isArray(blockIds)) throw new ApiError(400, "blockIds must be an array");
  const chapter = await Chapter.findById(chapterId);
  if (!chapter) throw new ApiError(404, "Chapter not found");
  const blockMap = new Map(chapter.blocks.map((b) => [b.id, b]));
  chapter.blocks = blockIds.map((id) => blockMap.get(id)).filter(Boolean);
  await chapter.save();
  return res.status(200).json(new ApiResponse(200, { chapter }));
});

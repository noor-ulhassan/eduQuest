import React, { useCallback, useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { nanoid } from "nanoid";
import { Loader2, Plus, Save } from "lucide-react";
import toast from "react-hot-toast";
import {
  getChaptersByCourse,
  updateChapter,
  removeBlock,
  reorderBlocks,
} from "@/features/workspace/courseApi";
import BlockCard from "./BlockCard";
import { BlockEditorForType } from "./BlockEditors";

const BLOCK_TYPES = [
  "text",
  "code",
  "youtube",
  "mermaid",
  "pro-tip",
  "concept-card",
  "playground-task",
];

function makeBlock(type) {
  const base = { id: nanoid(8), type };
  switch (type) {
    case "text":
      return { ...base, content: "" };
    case "code":
      return { ...base, language: "python", code: "" };
    case "youtube":
      return { ...base, url: "", videoTitle: "" };
    case "mermaid":
      return { ...base, content: "" };
    case "pro-tip":
      return { ...base, content: "" };
    case "concept-card":
      return { ...base, title: "", subtitle: "" };
    case "playground-task":
      return { ...base, instruction: "", starterCode: "", testCases: [] };
    default:
      return base;
  }
}

export default function BlockEditorArea({ chapterIndex, courseId }) {
  const [chapter, setChapter] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // Load chapters for this course, find the one matching chapterIndex
  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    setLoading(true);
    getChaptersByCourse(courseId)
      .then((all) => {
        if (cancelled) return;
        const found = all.find((c) => c.chapterNumber === chapterIndex + 1);
        if (found) {
          setChapter(found);
          setBlocks(found.blocks || []);
        } else {
          setChapter(null);
          setBlocks([]);
        }
      })
      .catch(() => {
        if (!cancelled) { setChapter(null); setBlocks([]); }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [courseId, chapterIndex]);

  const handleDragEnd = useCallback(
    async ({ active, over }) => {
      if (!over || active.id === over.id || !chapter) return;
      const oldIdx = blocks.findIndex((b) => b.id === active.id);
      const newIdx = blocks.findIndex((b) => b.id === over.id);
      const reordered = arrayMove(blocks, oldIdx, newIdx);
      setBlocks(reordered);
      try {
        await reorderBlocks(chapter._id, reordered.map((b) => b.id));
      } catch {
        toast.error("Failed to save block order");
      }
    },
    [blocks, chapter],
  );

  const handleBlockChange = useCallback((updatedBlock) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)),
    );
  }, []);

  const handleDelete = useCallback(
    async (blockId) => {
      if (!chapter) return;
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
      try {
        await removeBlock(chapter._id, blockId);
      } catch {
        toast.error("Failed to delete block");
      }
    },
    [chapter],
  );

  const handleAddBlock = useCallback(
    (type) => {
      setBlocks((prev) => [...prev, makeBlock(type)]);
      setShowAddMenu(false);
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!chapter) return;
    setSaving(true);
    try {
      await updateChapter(chapter._id, { blocks });
      toast.success("Chapter saved");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }, [chapter, blocks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="p-6 text-sm text-zinc-500 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
        This chapter has not been generated yet. Click <strong>Generate</strong> from the student view to create its AI content, then come back to edit blocks.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowAddMenu((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Block
          </button>
          {showAddMenu && (
            <div className="absolute top-full left-0 mt-1 z-20 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl py-1 min-w-[160px]">
              {BLOCK_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => handleAddBlock(t)}
                  className="w-full text-left px-4 py-2 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors capitalize"
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1" />
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          Save
        </button>
      </div>

      {/* Blocks */}
      {blocks.length === 0 ? (
        <p className="text-xs text-zinc-500 text-center py-8">
          No blocks yet — add one above.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {blocks.map((block) => (
                <BlockCard
                  key={block.id}
                  block={block}
                  isActive={activeBlockId === block.id}
                  onDelete={handleDelete}
                >
                  <div onClick={() => setActiveBlockId(block.id)}>
                    <BlockEditorForType
                      block={block}
                      onChange={handleBlockChange}
                    />
                  </div>
                </BlockCard>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

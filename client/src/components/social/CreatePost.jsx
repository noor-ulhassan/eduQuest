import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, Send, Loader2 } from "lucide-react";
import { createPost } from "../../features/social/socialApi";
import { useSelector } from "react-redux";
import { Input } from "@/components/ui/input";

const CreatePost = ({ onPostCreated }) => {
  const { user } = useSelector((state) => state.auth);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageUrl, setShowImageUrl] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await createPost({ content, image: imageUrl });
      if (response.success) {
        setContent("");
        setImageUrl("");
        setShowImageUrl(false);
        if (onPostCreated) onPostCreated(response.post);
      }
    } catch (error) {
      console.error("Failed to create post", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full bg-white mb-6 border-zinc-200 shadow-sm overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Avatar className="h-10 w-10 border border-zinc-200">
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder={`What's on your mind, ${user?.name?.split(" ")[0]}?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[80px] bg-zinc-50 border-none resize-none focus-visible:ring-0 text-zinc-700 placeholder:text-zinc-400"
            />

            {showImageUrl && (
              <Input
                placeholder="Image URL (https://...)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="bg-zinc-50 border-zinc-200 text-xs"
              />
            )}

            <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
              <Button
                variant="ghost"
                size="sm"
                className={`text-zinc-500 gap-2 ${showImageUrl ? "bg-zinc-100" : ""}`}
                onClick={() => setShowImageUrl(!showImageUrl)}
              >
                <ImageIcon className="w-4 h-4" />
                <span className="text-xs">Photo URL</span>
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Post <Send className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePost;

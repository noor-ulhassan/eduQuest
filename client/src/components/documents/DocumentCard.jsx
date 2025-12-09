import React from "react";
import { Trash2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const DocumentCard = ({ doc, onDeleteRequest }) => {
  // Extract file extension for the Badge
  const fileExtension = doc.filename.split(".").pop().toUpperCase();

  return (
    <TableRow className="hover:bg-gray-50 cursor-pointer">
      <TableCell className="font-medium flex items-center">
        <FileText className="w-5 h-5 mr-3 text-primary" />
        {doc.title}
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{fileExtension}</Badge>
      </TableCell>
      <TableCell>{formatFileSize(doc.size || 0)}</TableCell>
      <TableCell>{new Date(doc.uploadDate).toLocaleDateString()}</TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation(); // Prevents accidental interactions if row is clickable
            onDeleteRequest(doc);
          }}
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default DocumentCard;

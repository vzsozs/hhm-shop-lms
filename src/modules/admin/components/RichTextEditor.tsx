"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { useState, useCallback } from "react";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading2, 
  Heading3,
  Link as LinkIcon,
  Link2Off,
  Undo,
  Redo
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  // Kényszerítsük az újrarajzolást, hogy a toolbar szinkronban maradjon
  const [, setUpdateToken] = useState(0);
  const forceUpdate = useCallback(() => setUpdateToken(s => s + 1), []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Kezdj el gépelni...",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-brand-orange underline cursor-pointer",
        },
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[150px] p-4 text-white overflow-y-auto",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      forceUpdate();
    },
    onSelectionUpdate: () => {
      forceUpdate();
    },
    onTransaction: () => {
      forceUpdate();
    }
  });

  if (!editor) {
    return (
      <div className="h-[200px] w-full bg-card-bg border border-white/10 rounded-xl animate-pulse" />
    );
  }

  const addLink = () => {
    let url = window.prompt("URL címe:");
    if (url === null) return;
    
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // Automatikus protokoll kiegészítés
    if (!/^https?:\/\//i.test(url) && !url.startsWith("/") && !url.startsWith("#") && !url.startsWith("mailto:")) {
      url = "https://" + url;
    }
    
    const target = window.confirm("Új ablakban nyíljon meg? (Mégse = ugyanazon az oldalon)") ? "_blank" : "_self";
    editor.chain().focus().extendMarkRange("link").setLink({ href: url, target, rel: target === "_blank" ? "noopener noreferrer" : "" }).run();
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
  };

  return (
    <div className="w-full bg-card-bg border border-white/10 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-white/20 transition-all">
      <div className="flex flex-wrap gap-1 p-2 border-b border-white/10 bg-white/5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded-md transition-colors ${editor.isActive("bold") ? "bg-brand-orange text-white" : "text-white/60 hover:bg-white/10"}`}
          title="Félkövér"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded-md transition-colors ${editor.isActive("italic") ? "bg-brand-orange text-white" : "text-white/60 hover:bg-white/10"}`}
          title="Dőlt"
        >
          <Italic size={16} />
        </button>
        <div className="w-px h-6 bg-white/10 mx-1 self-center" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-md transition-colors ${editor.isActive("heading", { level: 2 }) ? "bg-brand-orange text-white" : "text-white/60 hover:bg-white/10"}`}
          title="Címsor 2"
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded-md transition-colors ${editor.isActive("heading", { level: 3 }) ? "bg-brand-orange text-white" : "text-white/60 hover:bg-white/10"}`}
          title="Címsor 3"
        >
          <Heading3 size={16} />
        </button>
        <div className="w-px h-6 bg-white/10 mx-1 self-center" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-md transition-colors ${editor.isActive("bulletList") ? "bg-brand-orange text-white" : "text-white/60 hover:bg-white/10"}`}
          title="Pontozott lista"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-md transition-colors ${editor.isActive("orderedList") ? "bg-brand-orange text-white" : "text-white/60 hover:bg-white/10"}`}
          title="Számozott lista"
        >
          <ListOrdered size={16} />
        </button>
        <div className="w-px h-6 bg-white/10 mx-1 self-center" />
        <button
          type="button"
          onClick={addLink}
          className={`p-2 rounded-md transition-colors ${editor.isActive("link") ? "bg-brand-orange text-white" : "text-white/60 hover:bg-white/10"}`}
          title="Link beszúrása"
        >
          <LinkIcon size={16} />
        </button>
        <button
          type="button"
          onClick={removeLink}
          disabled={!editor.isActive("link")}
          className={`p-2 rounded-md transition-colors ${editor.isActive("link") ? "text-red-500 hover:bg-red-500/10" : "text-white/20"}`}
          title="Link eltávolítása"
        >
          <Link2Off size={16} />
        </button>

        <div className="w-px h-6 bg-white/10 mx-1 self-center" />
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="p-2 rounded-md text-white/60 hover:bg-white/10 disabled:opacity-30"
          title="Visszavonás"
        >
          <Undo size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="p-2 rounded-md text-white/60 hover:bg-white/10 disabled:opacity-30"
          title="Ismétlés"
        >
          <Redo size={16} />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

import { useEffect, useMemo } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import bash from 'highlight.js/lib/languages/bash.js';
import css from 'highlight.js/lib/languages/css.js';
import html from 'highlight.js/lib/languages/xml.js';
import javascript from 'highlight.js/lib/languages/javascript.js';
import json from 'highlight.js/lib/languages/json.js';
import python from 'highlight.js/lib/languages/python.js';
import sql from 'highlight.js/lib/languages/sql.js';
import typescript from 'highlight.js/lib/languages/typescript.js';
import yaml from 'highlight.js/lib/languages/yaml.js';

const lowlight = createLowlight({ bash, css, html, javascript, json, python, sql, typescript, yaml });
const emptyDoc = { type: 'doc', content: [{ type: 'paragraph' }] };

export default function BlogEditor({ value, onChange, onUploadImage, media = [] }) {
  const extensions = useMemo(() => [
    StarterKit.configure({ codeBlock: false, link: false, underline: false }),
    CodeBlockLowlight.configure({ lowlight }),
    Image.extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          mediaId: { default: null, rendered: false },
          caption: { default: '', rendered: false },
        };
      },
    }).configure({ allowBase64: false }),
    Link.configure({ openOnClick: false, autolink: true, protocols: ['mailto', 'tel'], HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
    Youtube.configure({ nocookie: true, controls: true, modestBranding: true, width: 720, height: 405 }),
    Placeholder.configure({ placeholder: 'Mulai tulis artikel…' }),
    Underline,
  ], []);
  const editor = useEditor({
    extensions,
    content: value || emptyDoc,
    immediatelyRender: false,
    editorProps: { attributes: { class: 'blog-editor-content', 'aria-label': 'Isi artikel' } },
    onUpdate: ({ editor: current }) => onChange(current.getJSON()),
  });
  const openImagePicker = () => document.getElementById('blog-editor-image-upload')?.click();

  useEffect(() => {
    if (!editor) return;
    const next = value || emptyDoc;
    if (JSON.stringify(editor.getJSON()) !== JSON.stringify(next)) editor.commands.setContent(next, { emitUpdate: false });
  }, [editor, value]);

  const toolbarButton = (label, active, callback, disabled = !editor) => (
    <button type="button" className={`editor-tool ${active ? 'is-active' : ''}`} aria-label={label} title={label} disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={callback}>{label}</button>
  );

  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !editor) return;
    try {
      const asset = await onUploadImage(file);
      if (!asset) return;
      const alt = window.prompt('Teks alternatif untuk gambar', asset.filename) || '';
      const caption = window.prompt('Caption gambar (opsional)', '') || '';
      editor.chain().focus().setImage({ src: asset.public_url, alt, title: caption, mediaId: asset.id, caption }).run();
    } catch (error) {
      window.alert(error.message || 'Gagal mengunggah gambar.');
    }
  };

  return (
    <div className="blog-editor">
      <div className="blog-editor-toolbar" role="toolbar" aria-label="Pemformatan artikel">
        {toolbarButton('B', editor?.isActive('bold'), () => editor?.chain().focus().toggleBold().run())}
        {toolbarButton('I', editor?.isActive('italic'), () => editor?.chain().focus().toggleItalic().run())}
        {toolbarButton('U', editor?.isActive('underline'), () => editor?.chain().focus().toggleUnderline().run())}
        {toolbarButton('H2', editor?.isActive('heading', { level: 2 }), () => editor?.chain().focus().toggleHeading({ level: 2 }).run())}
        {toolbarButton('H3', editor?.isActive('heading', { level: 3 }), () => editor?.chain().focus().toggleHeading({ level: 3 }).run())}
        {toolbarButton('• List', editor?.isActive('bulletList'), () => editor?.chain().focus().toggleBulletList().run())}
        {toolbarButton('1. List', editor?.isActive('orderedList'), () => editor?.chain().focus().toggleOrderedList().run())}
        {toolbarButton('Quote', editor?.isActive('blockquote'), () => editor?.chain().focus().toggleBlockquote().run())}
        {toolbarButton('Code', editor?.isActive('codeBlock'), () => editor?.chain().focus().toggleCodeBlock().run())}
        {toolbarButton('Language', false, () => {
          const language = window.prompt('Bahasa kode (contoh: js, python, sql)', editor?.getAttributes('codeBlock').language || 'text');
          if (language) editor?.chain().focus().setCodeBlock({ language: language.trim().toLowerCase() }).run();
        }, !editor || !editor.isActive('codeBlock'))}
        {toolbarButton('Link', editor?.isActive('link'), () => {
          const href = window.prompt('URL tautan', editor?.getAttributes('link').href || 'https://');
          if (href === null) return;
          if (href.trim()) editor?.chain().focus().extendMarkRange('link').setLink({ href: href.trim() }).run();
          else editor?.chain().focus().unsetLink().run();
        })}
        {toolbarButton('Gambar', false, openImagePicker)}
        <select aria-label="Sisipkan gambar dari media library" defaultValue="" onChange={(event) => {
          const asset = media.find((item) => item.id === event.target.value);
          event.target.value = '';
          if (!asset || !editor) return;
          const alt = window.prompt('Teks alternatif untuk gambar', asset.alt_text || asset.filename);
          if (alt === null) return;
          const caption = window.prompt('Caption gambar (opsional)', '') || '';
          editor.chain().focus().setImage({ src: asset.public_url, alt, title: caption, mediaId: asset.id, caption }).run();
        }}><option value="">Media tersimpan…</option>{media.map((asset) => <option key={asset.id} value={asset.id}>{asset.filename}</option>)}</select>
        {toolbarButton('YouTube', false, () => {
          const src = window.prompt('URL video YouTube');
          if (src) editor?.chain().focus().setYoutubeVideo({ src }).run();
        })}
        {toolbarButton('Undo', false, () => editor?.chain().focus().undo().run())}
        {toolbarButton('Redo', false, () => editor?.chain().focus().redo().run())}
        <input id="blog-editor-image-upload" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" hidden onChange={upload} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

"use client";

import { FormEvent, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Note = {
  id: string;
  title: string;
  body: string;
  updatedAt: string;
};

const STORAGE_KEY = "scribble-notes";
const subscribeToMount = () => () => {};
const getMountedSnapshot = () => true;
const getServerSnapshot = () => false;

function isNote(value: unknown): value is Note {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "title" in value &&
    typeof value.title === "string" &&
    "body" in value &&
    typeof value.body === "string" &&
    "updatedAt" in value &&
    typeof value.updatedAt === "string"
  );
}

function readSavedNotes(): Note[] {
  if (typeof window === "undefined") return [];
  const savedNotes = window.localStorage.getItem(STORAGE_KEY);
  if (!savedNotes) return [];

  try {
    const parsedNotes: unknown = JSON.parse(savedNotes);
    if (!Array.isArray(parsedNotes) || !parsedNotes.every(isNote)) {
      console.error("Saved notes are not in the expected format.");
      return [];
    }
    return parsedNotes;
  } catch (error) {
    console.error("Could not load saved notes.", error);
    return [];
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default function NotesPage() {
  const router = useRouter();
  const hasMounted = useSyncExternalStore(
    subscribeToMount,
    getMountedSnapshot,
    getServerSnapshot,
  );
  const [user] = useState(() =>
    typeof window === "undefined"
      ? ""
      : window.localStorage.getItem("scribble-user") || "",
  );
  const [notes, setNotes] = useState<Note[]>(readSavedNotes);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (hasMounted && !user) {
      router.replace("/");
    }
  }, [hasMounted, router, user]);

  useEffect(() => {
    if (hasMounted && user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  }, [hasMounted, notes, user]);

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return notes;
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.body.toLowerCase().includes(query),
    );
  }, [notes, search]);

  const selectedNote = notes.find((note) => note.id === selectedId);

  function createNote() {
    const note: Note = {
      id: crypto.randomUUID(),
      title: "",
      body: "",
      updatedAt: new Date().toISOString(),
    };
    setNotes((current) => [note, ...current]);
    setSelectedId(note.id);
  }

  function updateSelectedNote(field: "title" | "body", value: string) {
    setNotes((current) =>
      current.map((note) =>
        note.id === selectedId
          ? { ...note, [field]: value, updatedAt: new Date().toISOString() }
          : note,
      ),
    );
  }

  function deleteSelectedNote() {
    setNotes((current) => current.filter((note) => note.id !== selectedId));
    setSelectedId("");
  }

  function logout() {
    window.localStorage.removeItem("scribble-user");
    router.push("/");
  }

  function handleNoteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  if (!hasMounted || !user) return null;

  return (
    <main className="notes-page">
      <aside className="notes-sidebar">
        <Link className="brand sidebar-brand" href="/" aria-label="Scribble home">
          <span className="brand-mark" aria-hidden="true">s.</span>
          scribble
        </Link>

        <div className="sidebar-welcome">
          <span className="eyebrow">YOUR LITTLE CORNER</span>
          <h1>Make room for your thoughts.</h1>
          <p>A note for every little thing on your mind.</p>
        </div>

        <button className="new-note-button" onClick={createNote} type="button">
          <span aria-hidden="true">＋</span> New note
        </button>

        <label className="search-box" htmlFor="search-notes">
          <span aria-hidden="true">⌕</span>
          <input
            id="search-notes"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Find a note..."
            value={search}
          />
          <kbd>/</kbd>
        </label>

        <div className="notes-list-heading">
          <span>YOUR NOTES</span>
          <span className="note-count">{notes.length}</span>
        </div>

        <div className="notes-list">
          {filteredNotes.map((note) => (
            <button
              aria-current={note.id === selectedId ? "page" : undefined}
              className={`note-list-item${note.id === selectedId ? " is-selected" : ""}`}
              key={note.id}
              onClick={() => setSelectedId(note.id)}
              type="button"
            >
              <span className="note-list-title">{note.title || "Untitled note"}</span>
              <span className="note-list-preview">
                {note.body || "A fresh page, just for you."}
              </span>
              <span className="note-list-date">{formatDate(note.updatedAt)}</span>
            </button>
          ))}
          {filteredNotes.length === 0 && (
            <p className="no-notes">
              {search ? "No notes match that search." : "Your list is lovely and clear."}
            </p>
          )}
        </div>

        <div className="profile-row">
          <span className="avatar">{user.slice(0, 1).toUpperCase()}</span>
          <span className="profile-email">{user}</span>
          <button className="logout-button" onClick={logout} type="button">
            Log out <span aria-hidden="true">↗</span>
          </button>
        </div>
      </aside>

      <section className="editor-area">
        <header className="editor-topbar">
          <div className="breadcrumb"><span>My notes</span><span aria-hidden="true">/</span><span>{selectedNote?.title || "Untitled"}</span></div>
          <span className="save-status"><span aria-hidden="true">●</span> Saved on this device</span>
        </header>

        {selectedNote ? (
          <form className="note-editor" onSubmit={handleNoteSubmit}>
            <div className="editor-meta">
              <span className="editor-tag"><span aria-hidden="true">✳</span> NOTE</span>
              <button className="delete-note-button" onClick={deleteSelectedNote} type="button">
                Delete note
              </button>
            </div>
            <input
              aria-label="Note title"
              className="note-title-input"
              onChange={(event) => updateSelectedNote("title", event.target.value)}
              placeholder="Give your note a title..."
              value={selectedNote.title}
            />
            <p className="note-date">Last updated {formatDate(selectedNote.updatedAt)}</p>
            <textarea
              aria-label="Note content"
              className="note-body-input"
              onChange={(event) => updateSelectedNote("body", event.target.value)}
              placeholder={"Start anywhere...\n\nThere is no right way to begin."}
              value={selectedNote.body}
            />
          </form>
        ) : (
          <div className="empty-state">
            <div className="empty-illustration" aria-hidden="true">
              <span>✳</span>
              <div className="empty-paper"><i /><i /><i /></div>
              <b>♡</b>
            </div>
            <span className="eyebrow">A FRESH PAGE</span>
            <h2>Your next thought starts here.</h2>
            <p>Jot down an idea, make a list, or just see where the words take you.</p>
            <button className="primary-button empty-create-button" onClick={createNote} type="button">
              Write a note <span aria-hidden="true">→</span>
            </button>
          </div>
        )}
        <footer className="editor-footer">
          <span>Made for the thoughts that matter.</span>
          <span>✦</span>
        </footer>
      </section>
    </main>
  );
}

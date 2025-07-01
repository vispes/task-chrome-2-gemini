import StorageManager from './storage.js';

async function init() {
    // The original init ensured the 'notes' key exists and is an array.
    // StorageManager.getAllNotes() is designed to return [] if no notes are found,
    // which simplifies checks. However, to explicitly match the original behavior
    // of setting the *key* if it's completely missing, we can check its raw state.
    // Assuming 'notes' is the internal key name for notes data in StorageManager.
    const existingNotesData = await StorageManager.getItem('notes');
    if (existingNotesData === undefined || existingNotesData === null) {
        // If the 'notes' key itself doesn't exist or is explicitly null, initialize it as an empty array.
        await StorageManager.saveAllNotes([]);
    }
}

async function createNote(noteData) {
    if (!noteData) {
        throw new Error('Note data is required to create a note.');
    }

    // Use StorageManager to get all notes
    const notes = await StorageManager.getAllNotes(); // This should return an empty array if no notes exist

    const newNote = {
        ...noteData,
        id: crypto.randomUUID(), // Consistent ID generation
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    notes.push(newNote);
    // Use StorageManager to save the updated list of notes
    await StorageManager.saveAllNotes(notes);
    return newNote;
}

async function getNoteById(id) {
    if (!id) {
        throw new Error('Note ID is required.');
    }

    // Use StorageManager to get all notes
    const notes = await StorageManager.getAllNotes();
    const note = notes.find(n => n.id === id);
    return note || null;
}

async function getAllNotes() {
    // Delegate to StorageManager's getAllNotes to resolve global conflict and consolidate storage logic.
    return await StorageManager.getAllNotes();
}

async function updateNote(id, newData) {
    if (!id || !newData) {
        throw new Error('Note ID and new data are required for update.');
    }

    // Use StorageManager to get all notes
    let notes = await StorageManager.getAllNotes();
    let updatedNote = null;
    let noteFound = false;

    notes = notes.map(note => {
        if (note.id === id) {
            noteFound = true;
            updatedNote = {
                ...note,
                ...newData,
                id: note.id, // Ensure ID is preserved
                updatedAt: Date.now()
            };
            return updatedNote;
        }
        return note;
    });

    if (!noteFound) {
        return null; // Return null if note was not found for update
    }

    // Use StorageManager to save the updated list of notes
    await StorageManager.saveAllNotes(notes);
    return updatedNote;
}

async function deleteNote(id) {
    if (!id) {
        throw new Error('Note ID is required for deletion.');
    }

    // Use StorageManager to get all notes
    let notes = await StorageManager.getAllNotes();
    const initialLength = notes.length;

    const filteredNotes = notes.filter(note => note.id !== id);

    if (filteredNotes.length === initialLength) {
        return false; // Note not found, no deletion occurred
    }

    // Use StorageManager to save the filtered list of notes
    await StorageManager.saveAllNotes(filteredNotes);
    return true; // Note deleted successfully
}

const NoteManager = {
    init, // Now encapsulated within NoteManager
    createNote,
    getNoteById,
    getAllNotes,
    updateNote,
    deleteNote
};

export default NoteManager;
import "./NoteEaseMainContainer.css";

// PUBLIC_INTERFACE
export type Note = {
  id: string;
  title: string;
  content: string;
  category: string;
};

const CATEGORY_LIST = ["All", "Work", "Personal", "Ideas", "Archive"];

function generateId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

// PUBLIC_INTERFACE
export default class NoteEaseMainContainer {
  notes: Note[];
  filteredNotes: Note[];
  categories: string[];
  selectedCategory: string;
  search: string;
  root: HTMLElement;

  constructor(mountNode: HTMLElement) {
    this.notes = [];
    this.filteredNotes = [];
    this.categories = CATEGORY_LIST;
    this.selectedCategory = "All";
    this.search = "";
    this.root = document.createElement("div");
    this.root.className = "ne-main-container";
    mountNode.appendChild(this.root);
    this.render();
  }

  // PUBLIC_INTERFACE
  addNote(title = "", content = "", category = "Personal") {
    const note: Note = {
      id: generateId(),
      title,
      content,
      category,
    };
    this.notes.unshift(note);
    this.applyFilters();
    this.render();
  }

  // PUBLIC_INTERFACE
  editNote(id: string, title: string, content: string, category: string) {
    const note = this.notes.find((n) => n.id === id);
    if (note) {
      note.title = title;
      note.content = content;
      note.category = category;
      this.applyFilters();
      this.render();
    }
  }

  // PUBLIC_INTERFACE
  deleteNote(id: string) {
    this.notes = this.notes.filter((n) => n.id !== id);
    this.applyFilters();
    this.render();
  }

  // PUBLIC_INTERFACE
  setSearch(value: string) {
    this.search = value;
    this.applyFilters();
    this.render();
  }

  // PUBLIC_INTERFACE
  setCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
    this.render();
  }

  applyFilters() {
    let filtered = [...this.notes];
    if (this.selectedCategory !== "All") {
      filtered = filtered.filter((n) => n.category === this.selectedCategory);
    }
    if (this.search.trim() !== "") {
      const keyword = this.search.trim().toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(keyword) ||
          n.content.toLowerCase().includes(keyword)
      );
    }
    this.filteredNotes = filtered;
  }

  // UI rendering

  render() {
    this.root.innerHTML = `
      <div class="ne-search-bar-container">
        <input type="text" class="ne-search-bar" placeholder="Search notes..." value="${this.escapeHtml(this.search)}"/>
      </div>
      <div class="ne-category-filter">
        ${this.categories
          .map(
            (cat) => `<button
              class="ne-category-btn${cat === this.selectedCategory ? " ne-active" : ""}"
              data-category="${cat}"
            >${cat}</button>`
          )
          .join("")}
      </div>
      <div class="ne-notes-list">
        ${
          this.filteredNotes.length === 0
            ? `<div class="ne-empty-state">No notes found</div>`
            : this.filteredNotes
                .map(
                  (note) =>
                    `<div class="ne-note-preview" data-id="${note.id}">
                      <div class="ne-note-title">${this.escapeHtml(note.title || "(Untitled)")}</div>
                      <div class="ne-note-snippet">${this.escapeHtml(
                        note.content.length > 80
                          ? note.content.slice(0, 77) + "..."
                          : note.content
                      )}</div>
                      <div class="ne-note-category">${note.category}</div>
                      <button class="ne-edit-btn" data-id="${note.id}">Edit</button>
                      <button class="ne-delete-btn" data-id="${note.id}">Delete</button>
                    </div>`
                )
                .join("")
        }
      </div>
      <button class="ne-fab" title="Add Note">+</button>
      <div class="ne-modal-backdrop" style="display:none;">
        <!-- Modal will be injected here -->
      </div>
    `;
    // wiring UI events
    this.attachEvents();
  }

  attachEvents() {
    // Search bar
    const searchBar = this.root.querySelector<HTMLInputElement>(".ne-search-bar");
    if (searchBar) {
      searchBar.oninput = (e) => {
        this.setSearch((e.target as HTMLInputElement).value);
      };
    }

    // Category buttons
    this.root
      .querySelectorAll<HTMLButtonElement>(".ne-category-btn")
      .forEach((btn) => {
        btn.onclick = () => {
          const cat = btn.getAttribute("data-category");
          if (cat) this.setCategory(cat);
        };
      });

    // Note edit/delete buttons
    this.root
      .querySelectorAll<HTMLButtonElement>(".ne-edit-btn")
      .forEach((btn) => {
        btn.onclick = () => {
          const id = btn.getAttribute("data-id");
          if (id) this.openEditModal(id);
        };
      });
    this.root
      .querySelectorAll<HTMLButtonElement>(".ne-delete-btn")
      .forEach((btn) => {
        btn.onclick = () => {
          const id = btn.getAttribute("data-id");
          if (id && confirm("Delete this note?")) this.deleteNote(id);
        };
      });

    // Floating action button
    const fab = this.root.querySelector<HTMLButtonElement>(".ne-fab");
    if (fab) {
      fab.onclick = () => this.openEditModal(null);
    }
  }

  // Modal logic for create/edit note
  openEditModal(id: string | null) {
    const modalBackdrop = this.root.querySelector<HTMLDivElement>(".ne-modal-backdrop");
    if (!modalBackdrop) return;
    const isEdit = !!id && this.notes.find((n) => n.id === id);
    let title = "";
    let content = "";
    let category = this.categories.find((cat) => cat !== "All") || "Personal";
    if (isEdit) {
      const note = this.notes.find((n) => n.id === id)!;
      title = note.title;
      content = note.content;
      category = note.category;
    }
    modalBackdrop.style.display = "flex";
    modalBackdrop.innerHTML = `
      <div class="ne-modal">
        <h2>${isEdit ? "Edit Note" : "Create Note"}</h2>
        <form class="ne-modal-form">
          <input class="ne-modal-title" placeholder="Title" value="${this.escapeHtml(title)}"/>
          <select class="ne-modal-category">
            ${this.categories
              .filter((cat) => cat !== "All")
              .map(
                (cat) =>
                  `<option value="${cat}" ${
                    cat === category ? "selected" : ""
                  }>${cat}</option>`
              )
              .join("")}
          </select>
          <textarea class="ne-modal-content" placeholder="Contents...">${this.escapeHtml(
            content
          )}</textarea>
          <div class="ne-modal-actions">
            <button type="submit" class="ne-modal-save-btn">${isEdit ? "Update" : "Add"}</button>
            <button type="button" class="ne-modal-cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    `;
    // Modal handlers
    const form = modalBackdrop.querySelector<HTMLFormElement>(".ne-modal-form");
    const cancelBtn = modalBackdrop.querySelector<HTMLButtonElement>(
      ".ne-modal-cancel-btn"
    );
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const modalTitle = modalBackdrop.querySelector<HTMLInputElement>(
          ".ne-modal-title"
        );
        const modalContent = modalBackdrop.querySelector<HTMLTextAreaElement>(
          ".ne-modal-content"
        );
        const modalCategory = modalBackdrop.querySelector<HTMLSelectElement>(
          ".ne-modal-category"
        );
        const newTitle = modalTitle?.value.trim() ?? "";
        const newContent = modalContent?.value.trim() ?? "";
        const newCategory = modalCategory?.value || "Personal";
        if (isEdit && id) {
          this.editNote(id, newTitle, newContent, newCategory);
        } else {
          this.addNote(newTitle, newContent, newCategory);
        }
        this.closeModal();
      };
    }
    if (cancelBtn) {
      cancelBtn.onclick = () => this.closeModal();
    }
    // Close on backdrop click (not modal area)
    modalBackdrop.onclick = (e) => {
      if (e.target === modalBackdrop) this.closeModal();
    };
  }

  closeModal() {
    const modalBackdrop = this.root.querySelector<HTMLDivElement>(".ne-modal-backdrop");
    if (modalBackdrop) {
      modalBackdrop.innerHTML = "";
      modalBackdrop.style.display = "none";
    }
  }

  escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
}

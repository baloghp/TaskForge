import { TLEditorComponents } from "tldraw";

// Define a minimal snapshot for the initial state (store only)
export const snapshot: any = {
  store: {
    "document:document": {
      gridSize: 10,
      name: "",
      meta: {},
      id: "document:document",
      typeName: "document",
    },
    "page:page": {
      meta: {},
      id: "page:page",
      name: "Page 1",
      index: "a1",
      typeName: "page",
    },
    // Create an instance of the new project-idea shape
    "shape:project-idea-main": { // Use a descriptive ID
     "x": 587,
      "y": 253.99999999999997,
      "rotation": 0,
      "isLocked": false,
      "opacity": 1,
      "meta": {},
      "id": "shape:project-idea-main",
      "type": "project-idea",
      "props": {
        "w": 447.99999999999994,
        "h": 217.00000000000003,
        "text": "",
        "url": "",
        "html": null
      },
      parentId: "page:page",
      index: "a2",
      typeName: "shape",
    },
  },
  // Schema removed - will be provided by the editor instance at runtime
};

// Minimal components (optional, depending on tldraw setup)
export const components: Partial<TLEditorComponents> = {
  // Define any custom components if needed, otherwise leave empty or remove
};

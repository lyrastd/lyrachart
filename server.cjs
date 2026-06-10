var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
app.use(import_express.default.json({ limit: "15mb" }));
function getAISDK(req) {
  const clientKey = req.headers["x-api-key"];
  const key = clientKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("Chave de API do Gemini n\xE3o configurada. Por favor, adicione sua chave de API nas configura\xE7\xF5es ou use a do servidor.");
  }
  return new import_genai.GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
app.post("/api/validate-key", async (req, res) => {
  try {
    const key = req.headers["x-api-key"] || req.body.key;
    if (!key) {
      return res.status(400).json({ success: false, error: "Chave n\xE3o fornecida." });
    }
    const testAi = new import_genai.GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" }
      }
    });
    await testAi.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Respond only with 'OK'"
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Validation error:", err);
    res.json({ success: false, error: err.message || "Chave inv\xE1lida ou erro na API." });
  }
});
var diagramSchema = {
  type: import_genai.Type.OBJECT,
  properties: {
    title: { type: import_genai.Type.STRING },
    type: { type: import_genai.Type.STRING, description: "Must be: flowchart, bpmn, uml, er, or mindmap" },
    nodes: {
      type: import_genai.Type.ARRAY,
      items: {
        type: import_genai.Type.OBJECT,
        properties: {
          id: { type: import_genai.Type.STRING },
          type: { type: import_genai.Type.STRING, description: "e.g., task, gateway, event, class, entity, attribute, relationship, start, end, mindmap-node" },
          label: { type: import_genai.Type.STRING },
          x: { type: import_genai.Type.NUMBER },
          y: { type: import_genai.Type.NUMBER },
          shape: { type: import_genai.Type.STRING, description: "rectangle, diamond, circle, ellipse, pill, parallelogram, class-box" },
          color: { type: import_genai.Type.STRING, description: "E.g. #3b82f6, #ef4444, #10b981, #f59e0b, #8b5cf6, #ec4899" },
          properties: {
            type: import_genai.Type.ARRAY,
            items: { type: import_genai.Type.STRING },
            description: "For UML classes (attributes, methods) or database columns/types. Empty if none."
          }
        },
        required: ["id", "type", "label", "x", "y", "shape", "color"]
      }
    },
    edges: {
      type: import_genai.Type.ARRAY,
      items: {
        type: import_genai.Type.OBJECT,
        properties: {
          id: { type: import_genai.Type.STRING },
          from: { type: import_genai.Type.STRING },
          to: { type: import_genai.Type.STRING },
          label: { type: import_genai.Type.STRING },
          type: { type: import_genai.Type.STRING, description: "flow, association, inheritance, dependency, relation" },
          cardinality: { type: import_genai.Type.STRING, description: "e.g. 1..N, 1..1, N..M (for ER)" },
          animated: { type: import_genai.Type.BOOLEAN }
        },
        required: ["id", "from", "to"]
      }
    },
    mermaid: { type: import_genai.Type.STRING, description: "Proper, compilable Mermaid.js markdown block code" },
    d2: { type: import_genai.Type.STRING, description: "Proper, readable D2 diagram declarative script" },
    markdown: { type: import_genai.Type.STRING, description: "Detailed Markdown guide/documentation structured for Notion or Obsidian including layout explanation" },
    htmlSystem: { type: import_genai.Type.STRING, description: "A beautiful, fully self-contained HTML (using Tailwind CSS CDN) with embedded Javascript and state, making a functional, highly-polished direct interactive playground simulation or mock application representing the system represented by this diagram." }
  },
  required: ["title", "type", "nodes", "edges", "mermaid", "d2", "markdown", "htmlSystem"]
};
var chatResponseSchema = {
  type: import_genai.Type.OBJECT,
  properties: {
    replyText: { type: import_genai.Type.STRING, description: "Detailed conversational response in Portuguese. Introduce yourself, ask questions, explain what you will generate, or guide the user dynamically." },
    actionTrigger: { type: import_genai.Type.STRING, description: "Must be: 'none' (just chat/explain/ask more info), 'generate' (make a whole new diagram), 'refactor' (modify/add to the active diagram), or 'prototype' (only update mockup htmlSystem)." },
    diagram: {
      type: import_genai.Type.OBJECT,
      description: "Required ONLY if actionTrigger is 'generate' or 'refactor'.",
      properties: {
        title: { type: import_genai.Type.STRING },
        type: { type: import_genai.Type.STRING },
        nodes: {
          type: import_genai.Type.ARRAY,
          items: {
            type: import_genai.Type.OBJECT,
            properties: {
              id: { type: import_genai.Type.STRING },
              type: { type: import_genai.Type.STRING },
              label: { type: import_genai.Type.STRING },
              x: { type: import_genai.Type.NUMBER },
              y: { type: import_genai.Type.NUMBER },
              shape: { type: import_genai.Type.STRING },
              color: { type: import_genai.Type.STRING },
              properties: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING }
              }
            },
            required: ["id", "type", "label", "x", "y", "shape", "color"]
          }
        },
        edges: {
          type: import_genai.Type.ARRAY,
          items: {
            type: import_genai.Type.OBJECT,
            properties: {
              id: { type: import_genai.Type.STRING },
              from: { type: import_genai.Type.STRING },
              to: { type: import_genai.Type.STRING },
              label: { type: import_genai.Type.STRING },
              type: { type: import_genai.Type.STRING },
              cardinality: { type: import_genai.Type.STRING },
              animated: { type: import_genai.Type.BOOLEAN }
            },
            required: ["id", "from", "to"]
          }
        },
        mermaid: { type: import_genai.Type.STRING },
        d2: { type: import_genai.Type.STRING },
        markdown: { type: import_genai.Type.STRING },
        htmlSystem: { type: import_genai.Type.STRING }
      },
      required: ["title", "type", "nodes", "edges", "mermaid", "d2", "markdown", "htmlSystem"]
    },
    htmlSystem: { type: import_genai.Type.STRING, description: "Required ONLY if actionTrigger is 'prototype'. A beautifully polished standalone web application with mock state and records." }
  },
  required: ["replyText", "actionTrigger"]
};
var CHAT_SYSTEM_INSTRUCTIONS = `You are "Lyra Dev AI", an elite full-stack developer and system architect who is helping the user design, refactor and prototype operational systems. 

Your goals during the chat conversation:
1. Act as a human developer consultant: Speak directly in Brazilian Portuguese, ask clarifying questions when requirements are vague, summarize what you will build prior to or during building, and guide the user's design.
2. If the user's request is ambiguous or is a high-level discussion (e.g. they say "I want to build an e-commerce platform"), do NOT build it immediately. Instead, converse with them: suggest a structure, ask how many steps or states they want in their diagram, and request confirmation. Set actionTrigger to 'none' and provide your response in 'replyText'.
3. Once you have a clear blueprint or if the user sends a direct instruction (e.g., "Add a login step", "Generate a BPMN of ticket sales", "Crie o fluxograma agora"), perform the creation or refactoring. In this case, set actionTrigger to 'generate' or 'refactor', construct a gorgeous diagram with nodes spaced 150px+ apart (spacing them out so they do not overlap on the grid canvas!), draw connections properly, and output the updated diagram structure inside the 'diagram' object. 
4. Always build the 'htmlSystem' inside the diagram as a superb, fully interactive, visually spectacular prototype mockup app with form validations, mock record logs, stateful transitions and nice Tailwind components. When the user asks ONLY to change the interactive mockup application itself, you can set actionTrigger to 'prototype' and return the updated HTML string inside the 'htmlSystem' key of your response.

Stay extremely friendly, professional, smart, and logical. Propose features and enhancements where appropriate.`;
app.post("/api/chatbot-converse", async (req, res) => {
  try {
    const { messages, currentDiagram, diagramType, fileContent, fileName, fileExt } = req.body;
    const ai = getAISDK(req);
    let formattedPrompt = `You are talking with the user. The current active diagram structure is:
${JSON.stringify(currentDiagram || "empty")}

`;
    formattedPrompt += `Preferred diagram type setting is: ${diagramType || "auto-detect"}.
`;
    if (fileContent) {
      formattedPrompt += `The user has attached a file named "${fileName}" (Type: ${fileExt}). File content is:
${fileContent}

`;
    }
    formattedPrompt += `Chat history transcript:
`;
    messages.forEach((msg) => {
      const senderName = msg.sender === "user" || msg.sender === "Voc\xEA" ? "User" : "Lyra Dev AI Assistant";
      formattedPrompt += `${senderName}: ${msg.text}
`;
    });
    formattedPrompt += `
Remember, if you decide to act (create 'generate', modify 'refactor', or only update interactive UI 'prototype'), output the filled objects. If you are just discussing or clarifying, set actionTrigger to 'none' and do not add diagram or htmlSystem. Please respond in JSON strictly adhering to the schema.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedPrompt,
      config: {
        systemInstruction: CHAT_SYSTEM_INSTRUCTIONS,
        responseMimeType: "application/json",
        responseSchema: chatResponseSchema,
        temperature: 0.2
      }
    });
    const outputText = response.text;
    if (!outputText) {
      throw new Error("No response or empty text from Gemini API.");
    }
    const cleanedJson = JSON.parse(outputText.trim());
    res.json({ success: true, ...cleanedJson });
  } catch (error) {
    console.error("Error in chatbot conversation:", error);
    res.status(500).json({ success: false, error: error.message || error });
  }
});
var SYSTEM_INSTRUCTIONS = `You are a world-class system architect and diagram generation specialist. 
Your goal is to parse text prompts, uploaded source codes, markdown, BPMN XML, ER representations, D2 syntax, or mind maps, and outputs a complete, organized, animated diagram model in JSON along with a fully functioning mock-application prototype system.

Design exquisite diagrams with clear relative 2D positions (x, y coordinates ranging naturally from 100 to 1000, spacing them out proportionally so nodes do NOT overlap or crowd each other).
Choose aesthetically professional color schemes based on diagram category.
For the 'htmlSystem':
- It must be a fully responsive, visually stunner, single-page web application using:
  - Tailwind CSS (via CDN: https://cdn.tailwindcss.com)
  - Beautiful typographic layouts, spacing, shadows, microinteractions, tabs (if needed), input fields, action buttons, table records, stored locally using standard state or localStorage.
  - It MUST functionally emulate/mock the actual business processes, forms, calculations, or models described by the diagram. For example, if it's a BPMN authorization process, write a multi-step form with mock notifications, interactive logs, success dashboard, and user configurations. Keep it highly interactive, visually polished and realistic.
  - Deliver pristine code without any truncated lines. Do not truncate! All HTML must be fully complete and operational.

Format all responses matching the schema exactly. Choose the most appropriate diagram type (flowchart, bpmn, uml, er, mindmap) representing the user prompt if not explicitly specified.`;
app.post("/api/generate-diagram", async (req, res) => {
  try {
    const { prompt, diagramType, fileContent, fileName, fileExt } = req.body;
    const ai = getAISDK(req);
    let userPrompt = `Generate a diagram of type: ${diagramType || "auto-detect"}.
`;
    if (prompt) {
      userPrompt += `User request: "${prompt}"
`;
    }
    if (fileContent) {
      userPrompt += `Uploaded context file "${fileName || "diagram-file"}" with extension "${fileExt || "txt"}":
-----------
${fileContent}
-----------
`;
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS,
        responseMimeType: "application/json",
        responseSchema: diagramSchema,
        temperature: 0.2
      }
    });
    const outputText = response.text;
    if (!outputText) {
      throw new Error("No response or empty text from Gemini API.");
    }
    const cleanedJson = JSON.parse(outputText.trim());
    res.json({ success: true, diagram: cleanedJson });
  } catch (error) {
    console.error("Error generating diagram:", error);
    res.status(500).json({ success: false, error: error.message || error });
  }
});
app.post("/api/refactor-diagram", async (req, res) => {
  try {
    const { diagram, refinementPrompt } = req.body;
    const ai = getAISDK(req);
    if (!diagram || !refinementPrompt) {
      return res.status(400).json({ success: false, error: "diagram and refinementPrompt are required." });
    }
    const userPrompt = `Refactor and modify the following diagram metadata based on user feedback.
Feedback: "${refinementPrompt}"
Current diagram state:
-----------
${JSON.stringify(diagram, null, 2)}
-----------
Please reconstruct the entire model, updating coordinates, shapes, colors, mermaid code, d2 code, markdown and rebuilding/improving the htmlSystem mock application accordingly. Expand coordinates naturally if new nodes are added. Maintain overall style cohesion.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS,
        responseMimeType: "application/json",
        responseSchema: diagramSchema,
        temperature: 0.2
      }
    });
    const outputText = response.text;
    if (!outputText) {
      throw new Error("No response or empty text from Gemini API.");
    }
    const cleanedJson = JSON.parse(outputText.trim());
    res.json({ success: true, diagram: cleanedJson });
  } catch (error) {
    console.error("Error refactoring diagram:", error);
    res.status(500).json({ success: false, error: error.message || error });
  }
});
app.post("/api/regenerate-system", async (req, res) => {
  try {
    const { diagram, customizationRequest } = req.body;
    const ai = getAISDK(req);
    if (!diagram) {
      return res.status(400).json({ success: false, error: "diagram data is required." });
    }
    const userPrompt = `Review the following diagram layout and build/rebuild the 'htmlSystem' mockup system.
Diagram details:
${JSON.stringify({ title: diagram.title, type: diagram.type, nodes: diagram.nodes, edges: diagram.edges }, null, 2)}
Customization request: "${customizationRequest || "Build a fully integrated prototype based exactly on this system model with state persistence, interactive fields and clean logging."}"
Return a single JSON block containing ONLY a single key 'htmlSystem' which contains the complete, standalone HTML string representing this system mockup. Ready to run and fully styled!`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS,
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            htmlSystem: { type: import_genai.Type.STRING }
          },
          required: ["htmlSystem"]
        },
        temperature: 0.2
      }
    });
    const outputText = response.text;
    if (!outputText) {
      throw new Error("No response from Gemini API.");
    }
    const cleanedJson = JSON.parse(outputText.trim());
    res.json({ success: true, htmlSystem: cleanedJson.htmlSystem });
  } catch (error) {
    console.error("Error regenerating HTML system:", error);
    res.status(500).json({ success: false, error: error.message || error });
  }
});
async function startServer() {
  const PORT = 3e3;
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[DEVELOPMENT SERVER] running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map

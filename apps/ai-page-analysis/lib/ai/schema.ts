export const ANALYZE_OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "requirementType",
    "pageGoal",
    "needs",
    "mustHave",
    "apiSuggestions",
    "statusAndErrors",
    "keyPoints",
    "boundaries",
    "prdGaps",
    "devSplit"
  ],
  properties: {
    requirementType: { type: "string" },
    pageGoal: { type: "string" },
    needs: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "owner", "summary"],
        properties: {
          title: { type: "string" },
          owner: { type: "string" },
          summary: { type: "string" }
        }
      }
    },
    mustHave: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "reason", "priority"],
        properties: {
          title: { type: "string" },
          reason: { type: "string" },
          priority: { type: "string", enum: ["P0", "P1", "P2"] }
        }
      }
    },
    apiSuggestions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "method", "purpose"],
        properties: {
          name: { type: "string" },
          method: { type: "string" },
          purpose: { type: "string" }
        }
      }
    },
    statusAndErrors: { type: "array", items: { type: "string" } },
    keyPoints: { type: "array", items: { type: "string" } },
    boundaries: { type: "array", items: { type: "string" } },
    prdGaps: { type: "array", items: { type: "string" } },
    devSplit: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["area", "items"],
        properties: {
          area: { type: "string" },
          items: { type: "array", items: { type: "string" } }
        }
      }
    }
  }
} as const;

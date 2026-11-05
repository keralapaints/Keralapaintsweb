/** The story's ten scenes, in order: their copy, framing and reading time. lib/story/scene-data numbers them and adds their media. */
export type SceneContent = {
  id: string;
  title: string;
  lines: string[];
  paragraphs: string[];
  alignment: "left" | "center";
  focalPoint: string;
  mobileFocalPoint: string;
  /** Reading time held on the scene before its film moves on, in timeline units (stage heights of scroll). */
  hold: number;
  /** Local contrast strength, chosen for the footage behind this scene's copy. */
  copyShade?: number;
  eyebrow?: string;
  question?: string[];
  actions?: { label: string; href: string }[];
};

export const storyScenes: SceneContent[] = [
  {
    id: "beyond-beautiful-walls", title: "Beyond beautiful walls",
    lines: ["BEYOND", "BEAUTIFUL", "WALLS."],
    paragraphs: ["We are building healthier spaces for\npeople to live, breathe and grow."],
    alignment: "left", focalPoint: "50% 50%", mobileFocalPoint: "75% 50%", hold: 0,
    actions: [{ label: "Explore our philosophy", href: "#wall-philosophy" }, { label: "Discover products", href: "#product-range" }],
  },
  {
    id: "wall-philosophy", title: "A wall is never just a wall",
    lines: ["A WALL IS NEVER", "JUST A WALL."],
    paragraphs: ["It surrounds the people we love. It becomes part of\nthe spaces where we sleep, breathe, live and grow.", "That made us ask a deeper question."],
    alignment: "left", focalPoint: "50% 50%", mobileFocalPoint: "42% 50%", hold: 1,
  },
  {
    id: "inside-the-paint", title: "Inside the paint",
    copyShade: .75,
    lines: ["INSIDE THE PAINT."],
    paragraphs: ["We journey into the microscopic layers\nwhere every particle has a purpose.", "Formulated with care. Crafted for better living."],
    alignment: "left", focalPoint: "50% 50%", mobileFocalPoint: "58% 50%", hold: 1,
  },
  {
    id: "nature-colour", title: "Nature gave us colour",
    copyShade: .85,
    lines: ["NATURE GAVE US", "COLOUR."],
    paragraphs: ["From earth and minerals, flowers and leaves,\nnature created the world’s first colours."],
    alignment: "left", focalPoint: "50% 50%", mobileFocalPoint: "57% 50%", hold: .85,
  },
  {
    id: "human-discovery", title: "Humans discovered colour",
    copyShade: .55,
    lines: ["HUMANS DISCOVERED", "COLOUR."],
    paragraphs: ["From ancient caves to timeless art, we explored,\nground and crafted colours from nature.", "A discovery that became our expression."],
    alignment: "left", focalPoint: "50% 50%", mobileFocalPoint: "56% 50%", hold: 1,
  },
  {
    id: "paint-changed-the-world", title: "Paint changed the world",
    copyShade: .85,
    lines: ["PAINT CHANGED", "THE WORLD."],
    paragraphs: ["From nature’s colours to advanced manufacturing,\nwe transformed possibilities into performance.", "Technology, precision and care at every step."],
    alignment: "left", focalPoint: "50% 50%", mobileFocalPoint: "54% 50%", hold: 1,
  },
  {
    id: "the-question", title: "Who protects the people living inside?",
    lines: ["PAINT BECAME MORE", "BEAUTIFUL THAN EVER."],
    paragraphs: [], eyebrow: "But one question remained.",
    question: ["WHO PROTECTS THE", "PEOPLE LIVING INSIDE?"],
    alignment: "center", focalPoint: "50% 50%", mobileFocalPoint: "50% 50%", hold: 1.15,
  },
  {
    id: "the-nature-answer", title: "The answer began in nature",
    copyShade: .65,
    lines: ["THE ANSWER", "BEGAN IN NATURE."],
    paragraphs: ["Natural rubber latex gave us a new way\nto think about what paint could become."],
    alignment: "center", focalPoint: "50% 50%", mobileFocalPoint: "62% 50%", hold: .85,
  },
  {
    id: "nature-reengineered", title: "Nature, reengineered",
    copyShade: 1,
    lines: ["NATURE, REENGINEERED."],
    paragraphs: ["Inside natural latex, our research unlocks a structure\nthat holds colour, strengthens performance\nand redefines what a wall can be."],
    alignment: "left", focalPoint: "50% 50%", mobileFocalPoint: "58% 50%", hold: .85,
  },
  {
    id: "living-surface", title: "From latex to living surface",
    copyShade: .85,
    lines: ["FROM LATEX TO", "LIVING SURFACE."],
    paragraphs: ["Through innovation, it transforms into a smooth,\ndurable finish that becomes one with your walls."],
    alignment: "left", focalPoint: "50% 50%", mobileFocalPoint: "92% 50%", hold: .85,
  },
];

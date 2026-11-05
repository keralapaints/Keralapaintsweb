/** The enquiry chapter: its heading, the form's labels and the messages after sending. */
export const enquiryCopy = {
  /** The heading's lines; the last ends with a gold full stop. */
  heading: ["LET’S TALK", "ABOUT YOUR SPACE"],
  /** The intro, in two parts around a line break shown on larger screens. */
  intro: ["Tell us about your project and we’ll help", " you choose the right finish."],
  /** Each field's screen-reader label and placeholder. */
  fields: {
    name: { label: "Name", placeholder: "Your name" },
    phone: { label: "Phone Number", placeholder: "Phone" },
    email: { label: "Email", placeholder: "Email" },
    city: { label: "City", placeholder: "City" },
    product: { label: "Product Interest", placeholder: "Product interest", guidance: "Help me choose" },
    message: { label: "Message", placeholder: "What would you like to paint?" },
  },
  send: "Send enquiry",
  sending: "Sending…",
  status: {
    /** No NEXT_PUBLIC_ENQUIRY_ENDPOINT is configured. */
    offline: "Online enquiries are not connected yet. Your details have not been sent.",
    sent: "Thank you. Your enquiry has been received.",
    failed: "Your enquiry could not be sent. Please try again. Your details are still here.",
  },
} as const;

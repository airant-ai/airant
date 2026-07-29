export type SeoGuide = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  intro: string;
  why: string[];
  next: string[];
  faq: { question: string; answer: string }[];
};

export const seoGuides: SeoGuide[] = [
  {
    slug: "frustrated-with-ai",
    title: "Frustrated With AI? You’re Not the Only One",
    description: "A practical, funny place to process a frustrating AI interaction, understand what went wrong and get some closure.",
    eyebrow: "When artificial intelligence tests real patience",
    intro: "AI can produce a brilliant answer in seconds and then spend the next ten minutes misunderstanding one completely ordinary request. That mismatch is what makes it so frustrating: the tool appears capable, but the result can still feel strangely disconnected from what you asked.",
    why: ["The model inferred a different goal from your wording.", "Important context was buried, ambiguous or lost during a long conversation.", "The system optimised for a plausible answer instead of checking whether it was correct.", "A tool limitation was presented like a successful result."],
    next: ["Write down the specific moment the interaction went wrong.", "Separate the original goal from everything the AI added or changed.", "Start a fresh conversation with the goal, constraints and required output stated separately.", "If you mainly need closure, give AIRant the incident and choose the response you deserved."],
    faq: [{ question: "Why is talking to AI sometimes so frustrating?", answer: "AI generates likely responses from patterns. It does not share your intent, so it can sound confident while pursuing the wrong interpretation." }, { question: "Can I rant about an AI anonymously?", answer: "Yes. AIRant does not require an account. Leave out names and private information, and only opt into social use if you want the anonymised submission considered for publication." }],
  },
  {
    slug: "chatgpt-not-following-instructions",
    title: "Why ChatGPT Is Not Following Your Instructions",
    description: "Common reasons an AI ignores part of a prompt, changes the wrong thing or gives an answer that misses the brief.",
    eyebrow: "You gave it instructions. It chose a side quest.",
    intro: "When ChatGPT ignores an instruction, it is rarely making a deliberate choice. More often, several requirements are competing for attention, a key constraint is unclear, or the conversation contains older instructions that pull the response in another direction.",
    why: ["Several requests were combined without a clear priority.", "A later instruction conflicts with an earlier one.", "The required format was implied rather than stated.", "The request asks the model or tool to preserve something it cannot directly access.", "The conversation has become long enough that starting again would be clearer."],
    next: ["Put the outcome in the first sentence.", "List non-negotiable constraints under a short ‘Keep unchanged’ heading.", "Ask for one transformation at a time when editing files or images.", "Request a brief confirmation of the intended change before execution when precision matters."],
    faq: [{ question: "How do I make ChatGPT follow instructions more reliably?", answer: "State one clear objective, separate constraints from background context, specify the output format and remove conflicting instructions." }, { question: "Should I keep correcting the same chat?", answer: "After repeated misunderstandings, a fresh conversation with a shorter, consolidated brief is often more effective." }],
  },
  {
    slug: "ai-keeps-getting-things-wrong",
    title: "Why AI Keeps Getting Things Wrong",
    description: "Understand confident AI mistakes, hallucinations and plausible-looking answers that do not match reality.",
    eyebrow: "Confidently incorrect is still incorrect",
    intro: "Generative AI is designed to produce a useful-looking continuation, not to guarantee that every claim is true. It can combine real patterns into invented facts, misunderstand incomplete context or rely on information that is no longer current.",
    why: ["The question requires current information that the model has not verified.", "The model filled a gap with a plausible but invented detail.", "A source was summarised without being available in the conversation.", "The task needed calculation, browsing or specialist data rather than language generation alone."],
    next: ["Ask for sources and open them yourself.", "Separate facts from suggestions and creative ideas.", "Use authoritative primary sources for important decisions.", "Ask the AI to identify uncertainties instead of forcing a definite answer."],
    faq: [{ question: "Why does AI sound certain when it is wrong?", answer: "Fluent wording reflects the model’s ability to generate language, not a measurement of factual confidence." }, { question: "Should I trust AI answers?", answer: "Treat them as a starting point. Verify important medical, legal, financial, technical and current claims with authoritative sources." }],
  },
  {
    slug: "chatgpt-forgot-conversation",
    title: "What to Do When ChatGPT Forgets the Conversation",
    description: "Why an AI loses context, repeats old mistakes or appears to forget something you explained earlier.",
    eyebrow: "You explained it three messages ago",
    intro: "A long AI conversation can feel like a shared working session, but the model is continually reconstructing what matters from the available context. Details can lose prominence as the chat grows or when newer instructions compete with earlier ones.",
    why: ["The conversation contains too much unrelated history.", "The important requirement appeared once and was not repeated in the working brief.", "Several versions of the same instruction now exist.", "The application or selected mode has a practical context limit."],
    next: ["Create a short current-state summary.", "Restate the objective, decisions and non-negotiable constraints.", "Remove obsolete instructions when starting a fresh chat.", "For complex work, keep the source of truth in a document rather than relying only on conversation memory."],
    faq: [{ question: "Does ChatGPT remember everything in a conversation?", answer: "No. The usable context is limited, and not every earlier detail will carry equal weight throughout a long interaction." }, { question: "What is the fastest fix?", answer: "Start a new chat with a concise summary of the goal, current state, constraints and next action." }],
  },
  {
    slug: "ai-image-editing-fails",
    title: "Why AI Image Editing Changes the Wrong Thing",
    description: "Why a simple AI image edit can alter faces, layouts, colours or everything except the requested detail.",
    eyebrow: "One tiny edit. An entirely new universe.",
    intro: "AI image editing often regenerates pixels rather than manipulating an image like traditional design software. A request that sounds surgical to a person can therefore trigger broader visual changes, particularly when the target area is not clearly isolated.",
    why: ["The edit region was not clearly identified.", "The instruction described the desired scene but not what must remain identical.", "The tool generated a variation instead of performing a deterministic transform.", "Text, faces and precise layouts are especially vulnerable to unintended regeneration."],
    next: ["Name the single element to change and explicitly list everything to preserve.", "Use a mask or selection tool when the application provides one.", "For rotation, cropping and resizing, use a deterministic editor where possible.", "Keep the original file and compare each edit before continuing."],
    faq: [{ question: "Why did AI redesign my whole image?", answer: "Many AI editors recreate parts of an image instead of applying a conventional pixel-level operation, so insufficiently constrained edits can spread beyond the intended area." }, { question: "Should I use AI to rotate or crop an image?", answer: "Traditional editing tools are usually faster and more predictable for simple geometric operations." }],
  },
];

export const guideBySlug = Object.fromEntries(seoGuides.map((guide) => [guide.slug, guide]));

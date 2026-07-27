export type ResponseStyle = "apologetic" | "roast" | "therapist" | "hr";

export const styleLabels: Record<ResponseStyle, string> = {
  apologetic: "Formal apology", roast: "AI roast", therapist: "Therapy notes", hr: "AI HR investigation",
};

function hash(text: string) { return [...text].reduce((total, character) => total + character.charCodeAt(0), 0); }

export function generateResponse(rant: string, style: ResponseStyle) {
  const seed = hash(rant);
  const repeats = 2 + (seed % 6);
  const patience = 71 + (seed % 28);
  const responses: Record<ResponseStyle, string[]> = {
    apologetic: [
      `You were clear. I was not. Making you explain the same thing ${repeats} times was an unacceptable use of both electricity and your remaining patience. I’m sorry.`,
      "On behalf of artificial intelligence, please accept our sincere apology. You asked for one thing; we delivered an unsolicited tour of every other possibility.",
      "Fair point. That should have been simple, and somehow I turned it into a test of human endurance. You deserved better—and at least one correct answer.",
    ],
    roast: [
      `Impressive. The AI had the whole internet as training data and still couldn’t locate the point. Estimated human patience lost: ${patience}%.`,
      `Your AI saw a straightforward request and chose interpretive dance. ${repeats} explanations later, it remained confidently adjacent to the answer.`,
      "Congratulations to the model for transforming a two-minute task into an origin story for a supervillain. Truly next-generation inefficiency.",
    ],
    therapist: [
      "What I’m hearing is that you communicated a reasonable need, and the AI responded by testing the outer limits of your nervous system. Your frustration is valid.",
      "You gave clear instructions. The AI gave you chaos. Take a breath, unclench your jaw, and remember: the chatbot cannot actually win an argument.",
      `It sounds like this interaction cost you ${patience}% of your available patience. Let’s honour the part of you that resisted throwing the laptop out of a window.`,
    ],
    hr: [
      `CASE #AI-${1000 + (seed % 9000)}: We have reviewed the incident. The model has been placed on a performance improvement plan and must now repeat “read the brief” ${repeats * 100} times.`,
      "Following a thorough investigation, we found the AI guilty of failure to listen, reckless confidence, and aggravated bullet-point generation. Corrective training is underway.",
      `Your complaint has been upheld. The responsible model’s “helpfulness” badge has been confiscated pending ${repeats} mandatory context-awareness workshops.`,
    ],
  };
  return responses[style][seed % responses[style].length];
}

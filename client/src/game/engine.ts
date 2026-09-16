export type GameType = "Memory" | "Logic" | "Attention" | "Speed" | "Pattern";

export type Challenge = {
  id: string;
  type: GameType;
  prompt: string;
  options: string[];
  answer: string;
  hint: string;
  accent: string;
};

const colors = ["#ff735f", "#5ed3ad", "#8d84ff", "#f5c86d"];
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
const unique = (items: string[]) => Array.from(new Set(items));

function memoryChallenge(index: number): Challenge {
  const symbols = ["◆", "●", "✦", "▲", "■", "✚", "⬟", "◒"];
  const target = symbols.slice(index % 3, (index % 3) + 4).join(" ");
  const answer = target.split(" ")[1];
  const options = shuffle(unique([answer, "●", "✦", "▲", "■"]).slice(0, 4));
  return { id: `memory-${index}`, type: "Memory", prompt: `Which symbol was second in the sequence?\n${target}`, options, answer, hint: "Focus on the second position.", accent: colors[index % colors.length] };
}

function logicChallenge(index: number): Challenge {
  const a = 3 + (index % 4);
  const b = 5 + (index % 3);
  const answer = String(a * b - index);
  const options = shuffle(unique([answer, String(Number(answer) + 2), String(Number(answer) - 3), String(Number(answer) + 5)]));
  return { id: `logic-${index}`, type: "Logic", prompt: `Solve: ${a} × ${b} − ${index}`, options, answer, hint: "Multiply first, then subtract.", accent: colors[index % colors.length] };
}

function attentionChallenge(index: number): Challenge {
  const answer = index % 2 === 0 ? "MINT" : "CORAL";
  return { id: `attention-${index}`, type: "Attention", prompt: `Find the word that appears only once:\nCORAL · ${answer} · CORAL · CORAL`, options: shuffle([answer, "NAVY", "MAZE", "GLOW"]), answer, hint: "Ignore the repeated words.", accent: colors[index % colors.length] };
}

function speedChallenge(index: number): Challenge {
  const answer = index % 2 === 0 ? "YES" : "NO";
  return { id: `speed-${index}`, type: "Speed", prompt: `Does the pattern continue?\n${index % 2 === 0 ? "● ○ ● ○ ●" : "▲ ▲ ● ▲ ▲"}`, options: ["YES", "NO", "NOT SURE", "SKIP"], answer, hint: "Look for repetition.", accent: colors[index % colors.length] };
}

function patternChallenge(index: number): Challenge {
  const answer = String((index + 2) * 2);
  return { id: `pattern-${index}`, type: "Pattern", prompt: `Complete the pattern:\n${index + 2}, ${index + 4}, ${index + 6}, ?`, options: shuffle(unique([answer, String(Number(answer) + 1), String(Number(answer) + 2), String(Number(answer) - 2)])), answer, hint: "The gap stays the same.", accent: colors[index % colors.length] };
}

export function generateDailyChallenges(seed = new Date().getDate()): Challenge[] {
  const makers = [memoryChallenge, logicChallenge, attentionChallenge, speedChallenge, patternChallenge];
  return makers.map((maker, index) => maker((seed + index) % 7));
}

export function xpForLevel(level: number) { return 300 + (level - 1) * 125; }
export function scoreForAnswer(correct: boolean, streak: number) { return correct ? 100 + streak * 15 : 0; }

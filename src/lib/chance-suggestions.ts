/** Photographable group tasks. The manager picks one, edits it, or writes their own. */
export const CHANCE_SUGGESTIONS = [
  "Take a group selfie in a phone box",
  "Take a selfie of your whole group with drinks in hand",
  "Pose the whole team with a red post box",
  "Find a blue door and get everyone in the photo",
  "Get the whole team jumping in one photo",
  "Take a selfie with everyone pointing at something yellow",
  "Line up from shortest to tallest and photograph the team",
  "Find a statue and pose like it",
  "Take a selfie with a bus or taxi behind the team",
  "Photograph everyone making the same silly face",
  "Find a street clock and stand under it for a photo",
  "Get the whole team sitting on one bench or wall",
  "Take a photo where everyone is wearing the same colour",
  "Find a bridge and photograph the team in front of it",
  "Spell the first letter of your team name with your arms",
  "Find a shop window and photograph the team's reflection",
  "Take a selfie with a flower, tree, or plant in the picture",
  "Photograph the team all looking in different directions",
  "Find a street sign and point at a word on it together",
  "Take a photo of the team pretending to hold up a building",
] as const;

export function pickChanceSuggestions(count = 4): string[] {
  const copy = [...CHANCE_SUGGESTIONS];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = copy[i];
    copy[i] = copy[j];
    copy[j] = swap;
  }
  return copy.slice(0, Math.min(count, copy.length));
}

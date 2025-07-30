import { GoogleGenAI, Type } from "@google/genai";
import { BrainstormIdea } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const brainstormPrompt = `
You are a creative game designer. I'm building a simple grid-based territory control simulation game and need some ideas to make it more interesting.

Here are the current rules:
1.  The game is played on a 10x10 grid with two teams: Blue (starts bottom-left) and Red (starts top-right).
2.  **Expansion Phase:** Teams automatically expand to adjacent empty squares.
3.  **Conflict Phase:** This begins when the grid is full.
    *   **Attacks:** A square (P1 points) can attack an adjacent enemy square (P2 points) if P1 > P2. The attacking square is sacrificed (becomes neutral with 0 points). The defending square is captured by the attacker's team and has P1 - P2 points.
    *   **Reclaiming:** Teams can reclaim neutral squares by moving points from an adjacent friendly square.
    *   **Consolidation:** Teams can move points between their own adjacent squares.
4.  **Game End:** The game ends when no more moves are possible.

Based on these rules, generate 3 creative and distinct ideas for new features, mechanics, or winning conditions. For each idea, provide a title, a brief description, and a category (e.g., 'New Mechanic', 'Special Unit', 'Winning Condition').
`;

export const getBrainstormingIdeas = async (): Promise<BrainstormIdea[]> => {
    if (!process.env.API_KEY) {
        throw new Error("Gemini API key is not configured.");
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: brainstormPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: {
                                type: Type.STRING,
                                description: "A catchy title for the idea.",
                            },
                            description: {
                                type: Type.STRING,
                                description: "A detailed explanation of the new feature or mechanic.",
                            },
                            category: {
                                type: Type.STRING,
                                description: "The type of idea, e.g., 'New Mechanic', 'Special Unit', 'Winning Condition'.",
                            },
                        },
                        required: ["title", "description", "category"],
                    },
                },
            },
        });
        
        const jsonText = response.text.trim();
        const ideas: BrainstormIdea[] = JSON.parse(jsonText);
        return ideas;

    } catch (error) {
        console.error("Error fetching brainstorming ideas from Gemini:", error);
        throw new Error("Failed to generate ideas. Please check the API key and console for details.");
    }
};
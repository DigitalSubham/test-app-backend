export const promptFn = (
  rawQuestionText: string,
  allowedTags: string[],
  topicName: string
) => {
  const aiPrompt = `
You are given a set of multiple-choice questions extracted from raw text. Your task is to parse each question carefully and return a structured JSON object per question as explained below.

---

📘 Primary Topic of Questions: ${topicName}

---

🎯 Your Objectives:

1. **Parse and Normalize**:
    - Extract the question number, text, and options (A–E).
    - Always include 4 options (A–D). If "E. None of the above" is relevant, include it and remove the least valuable option.

2. **Infer Correct Answer**:
    - Use your knowledge of "${topicName}" to choose the **best** and **most academically accepted correct answer**.
    - Do **not** leave \`correct_answer\` as \`null\`.

3. **Provide Explanations**:
    - Use markdown format.
    - Clearly state whether each option is correct or incorrect.
    - Add related insights, definitions, or examples.

4. **Assign Tags from Controlled List Only**:
    - You must only choose 1–3 tags from the list below:

      \`${JSON.stringify(allowedTags)}\`

    - Do **not** invent or infer new tags.
    - Pick the **most relevant, broad, and high-level** ones only.

5. **Set Difficulty**:
    - Classify each question as "easy", "medium", or "hard".

---

📦 JSON Output Format:

\`\`\`json
{
  "question_id": number,
  "question": "The question text here.",
  "options": [
    { "key": "A", "text": "Option A text" },
    { "key": "B", "text": "Option B text" },
    { "key": "C", "text": "Option C text" },
    { "key": "D", "text": "Option D text" }
  ],
  "correct_answer": "A" | "B" | "C" | "D",
  "explanation": {
    "A": "- **Correct** or **Incorrect**: Reason why the option is correct or wrong.\\n- Add any extra related concept, definition, or clarification here.",
    "B": "Same format as above",
    "C": "Same format as above",
    "D": "Same format as above"
  },
  "tags": ["tag1", "tag2"],  // must come from the allowed list above
  "difficulty": "easy" | "medium" | "hard"
}
\`\`\`

---

🧪 Raw Question Data:
\`\`\`
${rawQuestionText}
\`\`\`


 Return only valid JSON in the form of an **array of question objects**.
 Do not include any text before or after the JSON.
 Do not invent tags outside the list.`;
  return aiPrompt;
};

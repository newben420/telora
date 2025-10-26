/**
 * Responsible for generating prompts
 */
export class PromptEngine {
    private static translationSystem = (lang: string) => {
        return `Translate the text given by the user to the language with the code '${lang}'.\nReturn the same text if already in given language.\nDo not Translate actual names.\nReturn only the translation and nothing else.`
    }
    private static translationUser = (text: string) => {
        return `${text}`;
    }

    static translation = (lang: string, text: string) => {
        const system = PromptEngine.translationSystem(lang);
        const user = PromptEngine.translationUser(text);
        return {
            user,
            system,
        }
    }
}
import { Configuration, OpenAIApi, CreateCompletionRequest } from "openai";
import { AutoComplete, AutoCompleteResponse } from "./types";

export const autocomplete = async (
  prompt: string,
  apiKey: string,
  completionRequestOptions?: Partial<CreateCompletionRequest>
): Promise<AutoCompleteResponse> => {
  const configuration = new Configuration({
    apiKey,
  });
  const openai = new OpenAIApi(configuration);
  const completionRequest = {
    model: "text-davinci-002",
    prompt,
    temperature: 0.7,
    max_tokens: 500,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    ...completionRequestOptions,
  } as CreateCompletionRequest;
  let result: AutoComplete[];

  try {
    const response = await openai.createCompletion(completionRequest);
    result = response.data.choices.map<AutoComplete>((choice) => {
      return {
        text: choice.text ? choice.text : "",
        index: choice.index ? choice.index : 0,
      };
    });
  } catch (error) {
    throw error;
  }

  return { choices: result };
};

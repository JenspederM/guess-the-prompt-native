import * as functions from "firebase-functions";
import { Configuration, OpenAIApi } from "openai";

const generateImage = functions
  .runWith({ secrets: ["OPENAI_API_KEY"] })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      return;
    }
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY?.replace(/"/g, ""),
    });

    const api = new OpenAIApi(configuration);

    functions.logger.info(
      "Generating image with:",
      { data },
      {
        structuredData: true,
      }
    );

    if (!data.prompt) {
      return;
    }

    const imageData = await api
      .createImage({
        prompt: data.prompt,
        n: data.n || 1,
        size: data.size || "256x256",
        response_format: data.response_format || "url",
        user: data?.userId,
      })
      .then((resp) => {
        return resp.data.data[0];
      })
      .catch((err) => {
        functions.logger.error(err, { structuredData: true });
        return;
      });

    if (!imageData) {
      return;
    }

    const response = {
      type: data.response_format === "url" ? "url" : "b64_json",
      image:
        data.response_format === "url" ? imageData.url : imageData.b64_json,
    };

    const size = Buffer.from(JSON.stringify(response)).length;
    functions.logger.debug(
      "Sending response",
      { size },
      { structuredData: true }
    );

    return response;
  });

const getModeration = functions
  .runWith({ secrets: ["OPENAI_API_KEY"] })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      return;
    }
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY?.replace(/"/g, ""),
    });

    const api = new OpenAIApi(configuration);

    functions.logger.info(
      "Getting moderation for:",
      { data },
      {
        structuredData: true,
      }
    );

    if (!data.input) {
      return;
    }

    const moderationData = await api
      .createModeration({ input: data.input })
      .then((resp) => {
        return resp.data.results[0];
      })
      .catch((err) => {
        functions.logger.error(err, { structuredData: true });
        return;
      });

    if (!moderationData) {
      return;
    }

    const response = {
      isFlagged: moderationData.flagged,
      isHateful: moderationData.categories.hate,
      isThreatening: moderationData.categories["hate/threatening"],
      isSelfHarm: moderationData.categories["self-harm"],
      isSexual: moderationData.categories.sexual,
      isSexualMinor: moderationData.categories["sexual/minors"],
      isViolent: moderationData.categories.violence,
      isViolentGraphic: moderationData.categories["violence/graphic"],
    };

    return response;
  });

const generateText = functions
  .runWith({ secrets: ["OPENAI_API_KEY"] })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      return;
    }

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY?.replace(/"/g, ""),
    });

    const api = new OpenAIApi(configuration);

    functions.logger.info(
      "Generating text for:",
      { data },
      {
        structuredData: true,
      }
    );

    if (!data.prompt || !data.guesses || data.guesses.length === 0) {
      return;
    }

    const guesses = data.guesses
      .map((guess: string, index: number) => `${index + 1}. "${guess}"`)
      .join("\n");

    const prompt = `
On a scale of 1 to 10, where 1 is dissimilar and 10 is similar, rate the relative contextual similarity of each guess compared to the original and explain why they are similar.

Return results formatted as:
1. "guess": "score" - "explanation"
...
N. "guess": "score" - "explanation"

Original: "${data.prompt}"

Guesses:
${guesses}

Similarities:`.trim();

    const textData = await api
      .createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        suffix: null,
        max_tokens: Math.min(Math.max(100, data.guesses.length * 40), 2048),
        temperature: 1,
        top_p: 1,
        echo: false,
        stop: null,
        presence_penalty: 0,
        frequency_penalty: 0,
        best_of: 1,
        user: data?.userId,
      })
      .then((resp) => {
        return resp.data;
      })
      .catch((err) => {
        functions.logger.error(err, { structuredData: true });
        return;
      });

    if (!textData) {
      return;
    }

    const response = {
      prompt: prompt,
      answer: textData.choices[0].text,
      usage: textData.usage,
    };

    return response;
  });

export const openai = {
  generateText,
  generateImage,
  getModeration,
};

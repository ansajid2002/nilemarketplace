import { Translate } from '@google-cloud/translate';

// Set up the Google Cloud Translation API client
const translate = new Translate({
  projectId: 'indigo-replica-394721',
});

export const translateText = async (text, targetLanguage) => {
  try {
    const [translation] = await translate.translate(text, targetLanguage);
    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
}; 
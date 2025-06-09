import { HttpException, Injectable } from '@nestjs/common';
import { HttpStatusCode } from 'axios';
import Groq from 'groq-sdk';

@Injectable()
export class GroqService {
  private jsObjectLiteralToJsonString(jsObjStr: string): string {
    // Step 1: Remove line breaks and trim
    let str = jsObjStr.replace(/\r?\n/g, '').trim();

    // Step 2: Quote unquoted keys (a:b → "a":b)
    str = str.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

    // Step 3: Replace only single-quoted string values (not keys or contractions inside strings)
    str = str.replace(/:\s*'([^']*)'/g, (_, val) => {
      const escaped = val.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      return `: "${escaped}"`;
    });

    // Step 4: Remove trailing commas (e.g., before } or ])
    str = str.replace(/,\s*([}\]])/g, '$1');

    return str;
  }

  private prompts = [
    `Create a single, original quote object related to love, sadness, feminine strength, deep emotion, or cinematic/musical themes. Vary the emotional tone and topic with each response. Sometimes include a real author, and leave the author blank if unknown. Do not repeat previous quotes or phrasing. Do not include Virginia Woolf or Anaïs Nin.

Also, write a short caption that encourages Instagram engagement, and include 5–6 relevant hashtags.

Respond with **valid JSON only**, using **double quotes** for all property names and string values. Do not use single quotes. Return exactly one object, nothing else.

Example format:
{
  "author": "",
  "quote": "Dating today means falling in love with someone’s playlist, memes, and Google Calendar etiquette.",
  "caption": "Modern love = vibes, emojis, and shared schedules. What’s your top green flag? 😂📅 #relationshiphumor #modernlove #funnyquotes #couplelife #digitalromance #laughingthroughlove"
}


`,

    `Create a unique single quote that humorously captures modern relationship expectations with a playful and light-hearted tone. The quote should be funny and relatable. Leave the author blank if unknown. Do not repeat previous quotes or phrasing. Do not include Virginia Woolf or Anaïs Nin.

Also, write a short caption that encourages Instagram engagement, and include 5–6 relevant hashtags.

Respond with **valid JSON only**, using **double quotes** for all property names and string values. Return exactly one object, nothing else.

Example format:
{
  "author": "",
  "quote": "She didn’t need permission to shine—he simply stood beside her, in awe of the fire she already was.",
  "caption": "The right person doesn’t dim your light—they admire the glow. Tag someone who gets it. ✨🔥 #empoweredlove #femininepower #strongwomenrising #relationshipgoals #selflovefirst #celebratednotowned"
}

`,
    `Create a unique single quote that captures the essence of a happy, empowering relationship from a woman’s perspective. Highlight that her joy doesn't stem from dependency but from being celebrated for who she truly is. The love she experiences honors her freedom, individuality, and strength. Leave the author blank if unknown. Do not repeat previous quotes or phrasing. Do not include Virginia Woolf or Anaïs Nin.

Also, write a short caption that encourages Instagram engagement, and include 5–6 relevant hashtags.

Respond with **valid JSON only**, using **double quotes** for all property names and string values. Return exactly one object, nothing else.

Example format:
{
  "author": "",
  "quote": "She stitched her broken heart with golden thread—because even wounds deserve to shine.",
  "caption": "Every healed scar is a badge of honor. What strength did your pain unlock? 💫🩹 #feminineresilience #heartbreakrecovery #growththroughpain #strongwomenquotes #healingjourney #emotionalstrength"
}

`,

    `Create a unique single quote that captures the emotional aftermath of heartbreak while highlighting feminine strength and resilience. Reflect the quiet power of a woman who has endured betrayal or sorrow in love, yet refuses to be defined by it. She honors her wounds as symbols of growth and survival. The quote should express layered emotion—acknowledging sadness without overshadowing strength. Leave the author blank if unknown. Do not repeat previous quotes or phrasing. Do not include Virginia Woolf or Anaïs Nin.

Also, write a short caption that encourages Instagram engagement, and include 5–6 relevant hashtags.

Respond with **valid JSON only**, using **double quotes** for all property names and string values. Return exactly one object, nothing else.

Example format:
{
  "author": "",
  "quote": "She stitched her broken heart with golden thread—because even wounds deserve to shine.",
  "caption": "Every healed scar is a badge of honor. What strength did your pain unlock? 💫🩹 #feminineresilience #heartbreakrecovery #growththroughpain #strongwomenquotes #healingjourney #emotionalstrength"
}

`,
  ];

  async callGROQAPI(index: number) {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

      console.log({ index });

      const response = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: this.prompts[index],
          },
        ],
        model: 'llama-3.3-70b-versatile',
      });

      const content = response.choices[0].message.content ?? '';

      const objectMatch = content.match(/\{[\s\S]*?\}/);
      if (!objectMatch) {
        throw new Error('No object found in the response');
      }

      const objStr = objectMatch[0];
      const jsonString = this.jsObjectLiteralToJsonString(objStr);
      const obj = JSON.parse(jsonString);
      console.log('Parsed object:', obj);

      return obj;
    } catch (error) {
      console.error('GROQ API Error:', error.response?.data || error.message);
      throw new HttpException('Error processing response', HttpStatusCode.BadRequest);
    }
  }

  async createQuoteFromString(rawQuote: string) {
    console.log('Raw content:', rawQuote);

    try {
      const prompt = `Take this raw quote and  Respond with **valid JSON only**, using **double quotes** for all property names and string values. Do not use single quotes. Return exactly one object, nothing else. Leave author field black is there is no author.
Also, write a short caption that encourages Instagram engagement, and include 5–6 relevant hashtags.
        Example format:
        {
          "author": "",
          "quote": "Dating today means falling in love with someone’s playlist, memes, and Google Calendar etiquette.",
          "caption": "Modern love = vibes, emojis, and shared schedules. What’s your top green flag? 😂📅 #relationshiphumor #modernlove #funnyquotes #couplelife #digitalromance #laughingthroughlove"
        }
        `;
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

      const response = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt + '  /n quote=>/n ' + rawQuote,
          },
        ],
        model: 'deepseek-r1-distill-llama-70b',
      });

      const content = response.choices[0].message.content ?? '';

      const objectMatch = content.match(/\{[\s\S]*?\}/);
      if (!objectMatch) {
        throw new Error('No object found in the response');
      }

      const objStr = objectMatch[0];
      const jsonString = this.jsObjectLiteralToJsonString(objStr);
      const obj = JSON.parse(jsonString);
      console.log('Parsed object:', obj);

      return obj;
    } catch (error) {
      console.log(error);

      console.error('GROQ API Error:', error.response?.data || error.message);
      throw new HttpException('Error processing response', HttpStatusCode.BadRequest);
    }
  }
  async createFootballTitle(title: string, comments: string) {
    try {
      const prompt = `Format this title and caption .Return exactly one object, nothing else. Put caption text in bulet form if not hastag
        Example format:
        {
          "title": "Title text",
          "caption":"post caption "
          
        } `;
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

      const response = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt + 'title :' + title + '\n commnet:' + comments,
          },
        ],
        model: 'deepseek-r1-distill-llama-70b',
      });

      const content = response.choices[0].message.content ?? '';

      const objectMatch = content.match(/\{[\s\S]*?\}/);
      if (!objectMatch) {
        throw new Error('No object found in the response');
      }

      const objStr = objectMatch[0];
      const jsonString = this.jsObjectLiteralToJsonString(objStr);
      const obj = JSON.parse(jsonString);
      return obj;
    } catch (error) {
      console.log(error);

      console.error('GROQ API Error:', error.response?.data || error.message);
      throw new HttpException('Error processing response', HttpStatusCode.BadRequest);
    }
  }
}

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
    `Create a single, original quote object related to love, sadness, feminine strength, deep emotion, or cinematic/musical themes. Vary the emotional tone and topic each time. Sometimes include a real author and leave the author blank if unknown. Do not repeat previous quotes or phrasing. 


            Also write a  caption that encourages Instagram engagement, and add 5–6 relevant hashtags.

            Respond with **valid JSON only**, using **double quotes** for all property names and string values. Do not use single quotes. Return exactly one object, nothing else. Do not repeat previous quotes and donot include Virginia Woolf Anaïs Nin

            Example format:
            {
            "author": "Dostoevsky",
            "quote": "Sometimes I think that to feel too deeply is a curse, not a gift...",
            "caption": "Fyodor Dostoevsky was a Russian novelist... #dostoevsky #philosophy #deep #existential #quotes #soul"
            }

            `,
    `Create a unique single, original quote object related to love, sadness, feminine strength, deep emotion or betryal in love .leave the author blank if unknown. Do not repeat previous quotes or phrasing. And dont start the quotes with same sentence


            Also write a short caption that encourages Instagram engagement, and add 5–6 relevant hashtags.

            Respond with **valid JSON only**, using **double quotes** for all property names and string values. Do not use single quotes. Return exactly one object, nothing else. Do not repeat previous quotes and donot include Virginia Woolf Anaïs Nin

            Example format:
            {
            "author": "Dostoevsky",
            "quote": "Sometimes I think that to feel too deeply is a curse, not a gift...",
            "caption": "Fyodor Dostoevsky was a Russian novelist... #dostoevsky #philosophy #deep #existential #quotes #soul"
            }

            `,
    `Create unique a single quote object related to being in a happy relation emotion which is women centric,leave the author blank if unknown. Do not repeat previous quotes or phrasing. And dont start the quotes with same sentence


            Also write a short caption that encourages Instagram engagement, and add 5–6 relevant hashtags.

            Respond with **valid JSON only**, using **double quotes** for all property names and string values. Do not use single quotes. Return exactly one object, nothing else. Do not repeat previous quotes and donot include Virginia Woolf Anaïs Nin

            Example format:
            {
            "author": "Dostoevsky",
            "quote": "Sometimes I think that to feel too deeply is a curse, not a gift...",
            "caption": "Fyodor Dostoevsky was a Russian novelist... #dostoevsky #philosophy #deep #existential #quotes #soul"
            }

            `,
  ];
  async callGROQAPI() {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const randomArrayIndex = Math.floor(Math.random() * this.prompts.length);

      console.log({randomArrayIndex});

      const response = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: this.prompts[randomArrayIndex],
          },
        ],
        model: 'llama-3.3-70b-versatile',
      });

      const content = response.choices[0].message.content ?? '';
      console.log('Raw content:', content);

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
}

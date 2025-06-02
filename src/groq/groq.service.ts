import { HttpException, Injectable } from '@nestjs/common';
import { HttpStatusCode } from 'axios';
import Groq from 'groq-sdk';

@Injectable()
export class GroqService {
  private jsObjectLiteralToJsonString(jsObjStr: string): string {
    // 1. Replace single quotes with double quotes
    let jsonStr = jsObjStr.replace(/'/g, '"');

    // 2. Quote unquoted property names:
    // Matches property names (alphanumeric, underscores, $) that are not quoted, followed by colon
    jsonStr = jsonStr.replace(/(\w+)\s*:/g, (_, prop) => `"${prop}":`);

    // 3. Remove trailing commas before } or ]
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');

    return jsonStr;
  }
  async callGROQAPI() {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

      const response = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: `Create a  new quote object like this:
    
                  {
                    author: 'Dostoevsky',
                    quote: 'Sometimes I think that to feel too deeply is a curse, not a gift...',
                    caption: 'Fyodor Dostoevsky was a Russian novelist and philosopher known for his profound psychological insight... #dostoevsky #philosophy #deep #existential #quotes #soul'
                  }`,
          },
        ],
        model: 'llama-3.3-70b-versatile',
      });
      const content = response.choices[0].message.content ?? '';

      const objectMatch = content.match(/\{[\s\S]*?\}/);
      if (!objectMatch) {
        throw new Error('No object found in the response');
      }

      let objStr = objectMatch[0];
      const jsonString = this.jsObjectLiteralToJsonString(objStr);
      const obj = JSON.parse(jsonString);
      return obj;
    } catch (error) {
      console.log(error.response?.data || error.message);
      throw new HttpException('Error getting token', HttpStatusCode.BadRequest);
    }
  }
}

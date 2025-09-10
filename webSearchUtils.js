import { randomNumber } from './utils.js';


export const generateSummaryPrompt = () => {
  const summaryPrompt1 = `
    Add the 'summary' key to the object. This key should contain a string - you are a music expert, a reviewer with acquired taste. Provide a short summary about the album, the essence of the album. You can be informal, even funny (but not necessarily). Finishing sentence should be in the 'If you like' style, mentioning up to 3 similar artists. Assume readers already have information about the album name, the release date, and the artist name.
  `;
  const summaryPrompt2 = `
    Add the 'summary' key to the object. This key should contain a string - you're a seasoned music critic with sharp ears and a sharper pen. Sum up the album's vibe and character in just a few sentences—capture what it feels like to listen to it. You can be casual, witty, even a bit cheeky. Wrap it up with an “If you like…” line, naming up to 3 similar artists. Assume the reader already knows the basics like album name, release date, and artist.
  `;
  const summaryPrompt3 = `
    Add the 'summary' key to the object. This key should contain a string - as an opinionated music reviewer, distill the album's soul into a short, punchy summary. Make it sound alive—whether that's warm praise, playful sarcasm, or sly humor. End with an “If you like…” suggestion that connects it to up to 3 comparable artists. Don't repeat the album's basic facts; the reader already has them.
  `;
  const summaryPrompt4 = `
    Add the 'summary' key to the object. This key should contain a string - imagine you're a music journalist who's heard it all. In a few sentences, give the reader the flavor of this album—what makes it tick, what mood it conjures, why it's worth a listen (or not). Keep it informal, and let your personality shine. Conclude with an “If you like…” closer, pointing to 1-3 artists in the same vein. No need to restate the album's title, release date, or creator.
  `;
  const summaryPrompt5 = `
    Add the 'summary' key to the object. This key should contain a string - write as a music aficionado with a knack for storytelling. Describe the album's core energy—whether that's dreamy, chaotic, groovy, or heart-wrenching—in a tight, engaging summary. Humor and casual tone welcome. End with “If you like…” followed by up to 3 artist names the reader might also enjoy. Skip repeating the obvious details; the reader's already got them.
  `;

  return eval(`summaryPrompt${randomNumber(1, 5)}`);
};



export const generateQuery = (name, artists, year, summaryPrompt) => {
  return `
    You are given an album object in JavaScript format.

    Each album object has the following keys:
    - 'name': the name of the album
    - 'artists': the artist or artists who released the album
    - 'year': the year the album was released

    You have 4 tasks:
    1. Add the 'genres' key to the object. This key should contain an array of 3 music genres that accurately describe the style of music on the album. Genres should be in lowercase. Use single quotes. Use english language. Some genres can have multiple variations - for example, hip hop / hip-hop. If you encounter on the following genres here are the ones you should prefer:
    alt-country / alt country - prefer alt country
    darkwave / dark wave - prefer darkwave
    electroacoustic / electro-acoustic	- prefer electroacoustic
    hip-hop / hip hop	- prefer hip-hop
    jazz-funk / jazz funk	- prefer jazz funk
    neo-psychedelic / neo-psychedelia	- prefer neo-psychedelic
    psychedelia / psychedelic - prefer psychedelic
    synth pop / synth-pop / synthpop - prefer synth-pop
    alt-rock / alternative rock	- prefer alternative rock
    alt-pop / alternative pop	- prefer alternative pop
    2. Add the 'mainGenre' key to the object. This key should contain a string - the main genre of the album. It could be one of the following options: pop, rock, folk, country, metal, punk, jazz, electronic, ambient, rap, classical, R&B.
    3. Add the 'label' key to the object. This key should contain a string - the record label that released the album. If you're not confident or haven't found any info about record label, return N/A.
    4. ${summaryPrompt}

    Return JS object only - no other words.

    Input:
      {
        name: '${name}',
        artists: '${artists}',
        year: '${year}'
      }
  `;
};



export const outputSchema = `
  {
    "type": "object",
    "properties": {
      "genres": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "Music genres"
      },
      "mainGenre": {
        "type": "string",
        "description": "Main music genre"
      },
      "label": {
        "type": "string",
        "description": "Record label"
      },
      "summary": {
        "type": "string",
        "description": "Short summary"
      }
    }
  }
`;

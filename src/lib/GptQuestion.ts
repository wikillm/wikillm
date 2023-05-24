// @ts-nocheck
/* eslint-disable */
import localforage from 'localforage';

const questionsQueue = [];

const delay = async (timeout) =>
  new Promise((resolve) => setTimeout(resolve, timeout));
let fails = 0;

// const CACHE = process.env.CACHE_LLM_REQUESTS
const CACHE = true;
const plugins = {
  openai: {
    createChatCompletion: async (prompt, openai) => {
      const message = { role: 'user', content: `${prompt}` };

      const result = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [message],
        temperature: 0.5,
        max_tokens: 3700,
      });
      const content = result.data.choices[0].message.content
        .replace(/^.*?\[/m, '[')
        .replace(/^.*?\[/gm, '[')
        .replace(/\].*?$/gm, ']');
      return { result, content };
    },
    createImage: async (prompt, openai) => {
      const result = await openai.createImage({
        prompt,
        n: 1,
        size: '1024x1024',
      });
      const content = result.data.data[0].url;
      return { result, content };
    },
  },
};

// create a function that takes as input 'openai.createChatCompletion'
// and returns the path value from the plugins object
const getPlugin = (path) => {
  const parts = path.split('.');
  return parts.reduce((acc, part) => acc[part], plugins);
};

async function askGPT(prompt, openai, type, action) {
  while (questionsQueue.length > 0) {
    await delay(100);
  }
  prompt = prompt.replace(/^[\s]+/gm, '');
  const cachedPrompt = await localforage.getItem(prompt);
  if (cachedPrompt) {
    const data = cachedPrompt;
    console.log('Question from cache:', prompt);
    console.log('Answer', data);
    return data;
  }
  try {
    console.log('type:', type);
    console.log('action:', action);
    console.log('Question:', prompt);
    const plugin = getPlugin(action);
    const { result, content } = await plugin(prompt, openai);
    console.log('Answer', content);

    questionsQueue.pop();
    if (type === 'string') {
      localforage.setItem(prompt, {
        result: content,
        request: result.data,
        prompt,
      });
      return { result: content, request: result.data, prompt };
    }
    try {
      const data = JSON.parse(content);
      localforage.setItem(prompt, {
        result: data,
        request: result.data,
        prompt,
      });

      console.log('Answer', data);
      return { result: data, request: result.data, prompt };
    } catch (er) {
      if (fails > 2) {
        console.warn('Failed');
        fails = 0;

        return { result: content, request: result.data, prompt };
      }
      console.warn('Retrying after fail', content);
      fails++;
      return await askGPT(prompt, openai, 'array', action);
    }
  } catch (err) {
    console.log(err);
  }
}
export function interpolate(template, params) {
  if (!template?.trim()) {
    // console.log("template", template);
    return '';
  }
  // console.log("interpolate", template, params);
  const names = Object.keys(params);
  const vals = Object.values(params);
  try {
    const result = new Function(
      ...names,
      `return \`${template.replace('$', '$')}\`;`
    )(...vals);
    return result;
  } catch (err) {
    console.error(err);
  }
}
export async function GptQuestion({
  openai,
  node: {
    name,
    each,
    objective,
    context,
    pattern,
    type,
    question,
    children,
    loop,
    action,
    ...rest
  },
  variables = {},
}) {
  if (loop) {
    const array = [];
    const requests = [];
    const prompts = [];
    console.log('vars', variables);
    for (const item of loop.items) {
      const { data, prompt, request } = await GptQuestion({
        openai,
        node: {
          name,
          each,
          objective,
          context,
          pattern,
          type,
          question,
          children,
          action,
          ...rest,
        },
        variables: {
          ...variables,
          [loop.name]: item,
        },
      });
      requests.push(request);
      prompts.push(prompt);
      array.push(...data);
    }
    return {
      data: array,
      prompts,
      requests,
      variables,
      name,
      each,
      objective,
      context,
      pattern,
      type,
      question,
      children,
      action,
      ...rest,
    };
  }
  console.log('var', variables);

  variables = { name, each, ...variables };
  pattern =
    typeof pattern === 'function'
      ? pattern(variables)
      : interpolate(pattern, variables);
  type =
    typeof type === 'function'
      ? type({ name, each, ...variables })
      : interpolate(type, variables);

  objective =
    typeof objective === 'function'
      ? objective({ name, each, ...variables })
      : interpolate(objective, variables);

  context =
    typeof context === 'function'
      ? context({ name, each, ...variables })
      : interpolate(context, variables);
  question =
    typeof question === 'function'
      ? question({ name, each, ...variables })
      : interpolate(question, variables);
  const newPrompt = ` ${objective}
                      ${context}
                      ${question} ${type ? `in the form of ${type}` : ''} ${
    pattern ? `following the pattern: ${pattern}` : ''
  }`;

  const restNode = {
    name,
    each,
    objective,
    context,
    pattern,
    type,
    question,
    children,
    action,
    ...rest,
  };
  const { request, result, prompt } = await askGPT(
    newPrompt,
    openai,
    each ? 'array' : 'string',
    action
  );
  variables[name] = result;
  return {
    data: result,
    // usage: request.usage.total_tokens,
    created: request.created,
    prompt,
    variables,
    ...restNode,
  };
}

export default GptQuestion;

const questionsQueue = []

const delay = (timeout) =>
  new Promise((resolve) => setTimeout(resolve, timeout))
let fails = 0

// const CACHE = process.env.CACHE_LLM_REQUESTS
const CACHE = true

const askGPT = async (prompt, openai, type) => {
  while (questionsQueue.length) {
    await delay(100)
  }
  prompt = prompt.replace(/^[\s]+/gm, '')
  const cachedPrompt = localStorage.getItem(prompt)
  if (cachedPrompt) {
    const data = JSON.parse(cachedPrompt)

    console.log('Answer', data)
    return data
  }
  try {
    const message = { role: 'user', content: `${prompt}` }
    questionsQueue.push(message)
    console.log('Question:', prompt)

    const result = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [message],
      temperature: 0.5,
      max_tokens: 3700
    })
    const content = result.data.choices[0].message.content
      .replace(/^.*?\[/m, '[')
      .replace(/^.*?\[/gm, '[')
      .replace(/\].*?$/gm, ']')
    result.data.choices[0].message.content !== content &&
      console.warn('Real answer', result.data.choices[0].message.content)

    questionsQueue.pop()
    if (type === 'string') {
      return { result: content, request: result.data, prompt }
    }
    try {
      const data = JSON.parse(content)
      localStorage.setItem(prompt, JSON.stringify({ result: data, request: result.data, prompt }
      ))

      console.log('Answer', data)
      return { result: data, request: result.data, prompt }
    } catch (er) {
      if (fails > 2) {
        console.warn('Failed')
        fails = 0

        return { result: content, request: result.data, prompt }
      }
      console.warn('Retrying after fail', content)
      fails++
      return await askGPT(prompt, openai, 'array')
    }
  } catch (err) {
    console.log(err)
  }
}
export function interpolate (template, params) {
  if (!template?.trim()) {
    // console.log("template", template);
    return ''
  }
  // console.log("interpolate", template, params);
  const names = Object.keys(params)
  const vals = Object.values(params)
  try {
    const result = new Function(
      ...names,
      `return \`${template.replace('$', '$')}\`;`
    )(...vals)
    return result
  } catch (err) {
    console.error(err)
  }
}
export const GptQuestion = async ({
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
    loop
  },
  variables = {}
}) => {
  if (loop) {
    const array = []
    const requests = []
    const prompts = []
    console.log('vars', variables)
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
          children
        },
        variables: {
          ...variables,
          [loop.name]: item
        }
      })
      requests.push(request)
      prompts.push(prompt)
      array.push(...data)
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
      children
    }
  }
  console.log('var', variables)

  variables = { name, each, ...variables }
  pattern =
    typeof pattern === 'function'
      ? pattern(variables)
      : interpolate(pattern, variables)
  type =
    typeof type === 'function'
      ? type({ name, each, ...variables })
      : interpolate(type, variables)

  objective =
    typeof objective === 'function'
      ? objective({ name, each, ...variables })
      : interpolate(objective, variables)
  pattern =
    typeof pattern === 'function'
      ? pattern({ name, each, ...variables })
      : interpolate(pattern, variables)
  context =
      typeof context === 'function'
        ? context({ name, each, ...variables })
        : interpolate(context, variables)
  question =
        typeof question === 'function'
          ? question({ name, each, ...variables })
          : interpolate(question, variables)
  const newPrompt = ` ${objective}
                      ${context}
                      ${question} ${type ? `in the form of ${type}` : ''} ${
    pattern ? `following the pattern: ${pattern}` : ''
  }`

  const restNode = {
    name,
    each,
    objective,
    context,
    pattern,
    type,
    question,
    children
  }
  const { request, result, prompt } = await askGPT(newPrompt, openai, each ? 'array' : 'string')
  variables[name] = result
  return {
    data: result,
    usage: request.usage.total_tokens,
    created: request.created,
    prompt,
    variables,
    ...restNode
  }
}

export default GptQuestion

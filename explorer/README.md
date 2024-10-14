# The Scout Explorer Service

This is a Next.js application that uses [Vercel AI](https://vercel.com/ai) and [Langchain](https://js.langchain.com/v0.2/docs/introduction/) to build an agentic application for data exploration through natural language querying, RAG, and code interpreter.

## Weaviate and CT-RATE
Currently, the application expects to query a Weaviate vectordb containing the [CT-RATE](https://huggingface.co/datasets/ibrahimhamamci/CT-RATE) dataset. A number of attributes about this dataset, including its metadata schema, are hard-coded into the application prototype.

## Vectorizer service
The application needs to utilize a vectorizer service to encode the user's queries. It is currently configured to work with a [custom CT-CLIP service](https://github.com/larkspur-ai/CT-CLIP/blob/main/app.py), but any service implementing a corresponding `/latents` endpoint may be used. Be sure to set the appropriate `VECTORIZER_URL` env var.

## Environment
You will need to set up the following environment variables, which may be done via an `.env.local` file at the root of the application, or as environment variables on your server.
```
WEAVIATE_SCHEME=http
WEAVIATE_HOST=localhost:8080
VECTORIZER_URL=http://localhost
GOOGLE_GENERATIVE_AI_API_KEY=<your key>
GOOGLE_API_KEY=$GOOGLE_GENERATIVE_AI_API_KEY #Langchain and Vercel use different variables for Google API key
OPENAI_API_KEY=<your key>
ANTHROPIC_API_KEY=<your key> # Not in use yet
```

Optional variables that can come in handy for debugging:
```
DEBUG=true
LANCHAIN_VERBOSE=true
LANGCHAIN_API_KEY=<your key>
LANGCHAIN_TRACING_V2=true
LANGCHAIN_CALLBACKS_BACKGROUND=true
LANGCHAIN_ENDPOINT="https://api.smith.langchain.com"
```

### Some useful commands

To run in development mode, execute the following. Or, use VS Code "Run and Debug" panel, where the `launch.json` configures Client and Server debugging.
```
npm run dev
```

To build container image for amd and arm architectures:
```
docker buildx build --push --platform linux/amd64,linux/arm64  --tag katealpert/explorer:latest .
```

To update deprecated dependencies, being mindful of peer dependencies. (Install `ncu` with `npm install -g npm-check-updates`)
```
ncu --deprecated -u --peer
npm install
```

### Some thoughts as we move out of POC
Managing streamables (Vercel AI RSC streamable values and streamable UI) is a bit cumbersome. If you don't close all the streams properly, you can run into issues maxing out the TCP connections open for the origin (you'll see fetch requests for your server actions stalling in Dev Tools Network tab, and ultimately "failed to fetch" errors in Console). It's hard to keep track of all the open streamables, and it's also tough to know if you've left them open vs they legitmately took some time to update because they were waiting on an API call or something.

# The Scout Explorer v2 Service

This is a Next.js application that uses [Vercel AI](https://vercel.com/ai) and [Langchain](https://js.langchain.com/v0.2/docs/introduction/) to build an agentic application for data exploration through natural language querying and RAG.

The app is using Nextjs 15, which uses the [React 19 RC](https://nextjs.org/blog/next-15#react-19):

> Although React 19 is still in the RC phase, our extensive testing across real-world applications and our close work with the React team have given us confidence in its stability. The core breaking changes have been well-tested and won't affect existing App Router users. Therefore, we've decided to release Next.js 15 as stable now, so your projects are fully prepared for React 19 GA.

The app is also using [Auth.js](https://authjs.dev/getting-started), which is still in beta. We probably want to swap to [NextAuth](https://next-auth.js.org/) or some other auth library. I just started here because I was following the example in [Vercel chatbot](https://github.com/vercel/ai-chatbot).

## Weaviate and CT-RATE

Currently, the application expects to query a Weaviate vectordb containing the [CT-RATE](https://huggingface.co/datasets/ibrahimhamamci/CT-RATE) dataset. A number of attributes about this dataset, including its metadata schema, are hard-coded into the application prototype.

## Vectorizer service

The application needs to utilize a vectorizer service to encode the user's queries. It is currently configured to work with a [custom CT-CLIP service](https://github.com/larkspur-ai/CT-CLIP/blob/main/app.py), but any service implementing a corresponding `/latents` endpoint may be used. Be sure to set the appropriate `VECTORIZER_URL` env var.

## Deployment

Unlike the v1 prototype, there is no helm chart set up for the explorer-v2 service. This is for two reasons:

1. Authjs requires an `AUTH_SECRET` env var. At build time, nextjs performs a prerendering step that requires this variable be defined. I don't want this value baked into the image (we want it to be set at runtime), so more research is needed to understand best practice.
1. It now requires postgres, which needs to be initialized per the steps below. This is not a blocker, but will take some time to sort out (e.g.: how do we configure postgres in k8s - operator?, how do we run the initialization - helm hooks?, etc.). Now didn't feel like the time to tackle these questions.

So, for now, there's a simple `docker-compose.yaml` included to stand up a postgres and persist its data.

### Setting up for development

#### Environment

You will need to set up the following environment variables, which may be done via an `.env.local` file at the root of the application for development, or as environment variables on your server.

```
POSTGRES_URL=postgres://postgres:postgres@localhost:5433
# Generate a random secret: https://generate-secret.vercel.app/32 or `openssl rand -base64 32`
AUTH_SECRET=
WEAVIATE_SCHEME=http
# Or, use the AWS Weaviate
WEAVIATE_HOST=localhost:8080
# We can swap to a LoadBalancer service on AWS or you can port forward
VECTORIZER_URL=http://localhost
AZURE_RESOURCE_NAME=scout-openai
AZURE_API_KEY=<your key>
```

Optional variables that can come in handy for debugging LLM work. You will need to create a LangSmith account first:

```
DEBUG=true
LANCHAIN_VERBOSE=true
LANGCHAIN_API_KEY=<your key>
LANGCHAIN_TRACING_V2=true
LANGCHAIN_CALLBACKS_BACKGROUND=true
LANGCHAIN_ENDPOINT="https://api.smith.langchain.com"
```

#### Dependencies

1. Install `pnpm`: `npm install -g pnpm`
1. Install dependencies: `pnpm install` (or `pnpm install --frozen-lockfile` if you want to use my exact state)
1. I was running into issues with missing opentelemetry dependencies until I ran `pnpm build`. I'm not sure what's going on with this, I'm not sure if you'll need to do it. To be investigated.

#### Database

1. Start up the docker-compose stack: `docker-compose up -d`
1. From this application directory, run: `pnpm db:migrate`. This should execute the SQL from `lib/drizzle` to set up your database. You can run `pnpm db:studio` for a GUI interface to explore the database, or just exec onto the postgres container and use `psql`. You'll notice that we're just adding tables to the default database, which is gross and temporary. (It would probably be trivial to add a db create step in docker-compose and then update the `POSTGRES_URL` to point to that, as opposed to using the default.)
1. If you make changes to the `db/schema.ts`, you'll need to run `pnpm db:generate` to generate the migration SQL and then `pnpm db:migrate` to execute the migration on your db.

## Some useful commands

To run in development mode, execute the following. Or, use VS Code "Run and Debug" panel, where the `launch.json` configures Client and Server debugging.

```
pnpm dev
```

To build container image for amd and arm architectures:

```
docker buildx build --push --platform linux/amd64,linux/arm64  --tag katealpert/explorer-v2:latest .
```

To update deprecated dependencies, being mindful of peer dependencies. (Install `ncu` with `npm install -g npm-check-updates`)

```
ncu --deprecated -u --peer
pnpm install
```

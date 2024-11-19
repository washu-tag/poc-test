import { auth } from '@/app/(auth)/auth';
import {
  deleteDatasetsByIdAfterTimestamp,
  getDatasetById,
  getDatasetsBySearchId,
} from '@/db/queries';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('searchId');

  if (!id) {
    return Response.json('Missing searchId', { status: 400 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return Response.json('Unauthorized', { status: 401 });
  }

  const datasets = await getDatasetsBySearchId({ id });

  // TODO auth check

  if (datasets.length === 0) {
    return Response.json('Not Found', { status: 404 });
  }

  return Response.json(datasets, { status: 200 });
}

// export async function POST(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const id = searchParams.get('id');

//   if (!id) {
//     return new Response('Missing id', { status: 400 });
//   }

//   const session = await auth();

//   if (!session) {
//     return new Response('Unauthorized', { status: 401 });
//   }

//   const { content, title }: { content: string; title: string } =
//     await request.json();

//   if (session.user && session.user.id) {
//     const dataset = await saveDataset({
//       id,
//       userId: session.user.id,
//     });

//     return Response.json(dataset, { status: 200 });
//   } else {
//     return new Response('Unauthorized', { status: 401 });
//   }
// }

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const { timestamp }: { timestamp: string } = await request.json();

  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const dataset = await getDatasetById({ id });

  if (dataset.userId !== session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  await deleteDatasetsByIdAfterTimestamp({
    id,
    timestamp: new Date(timestamp),
  });

  return new Response('Deleted', { status: 200 });
}

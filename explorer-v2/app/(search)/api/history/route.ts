import { auth } from '@/app/(auth)/auth';
import { getSearchesByUserId } from '@/db/queries';

export async function GET() {
  const session = await auth();

  if (!session || !session.user) {
    return Response.json('Unauthorized!', { status: 401 });
  }

  const searches = await getSearchesByUserId({ id: session.user.id! });
  return Response.json(searches);
}

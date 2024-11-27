import { cookies } from 'next/headers';

import { DEFAULT_MODEL_NAME, models } from '@/ai/models';
import { Search } from '@/components/search';
import { generateUUID } from '@/lib/utils';

export default async function Page() {
  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;

  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id || DEFAULT_MODEL_NAME;

  return <Search key={id} id={id} selectedModelId={selectedModelId} />;
}

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { weaviateManager } = await import('@/lib/weaviate/weaviate');
    await weaviateManager.initialize();
  }
}

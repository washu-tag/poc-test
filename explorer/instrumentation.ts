export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { weaviateManager } = await import('@/lib/weaviate');
    await weaviateManager.initialize();
  }
}

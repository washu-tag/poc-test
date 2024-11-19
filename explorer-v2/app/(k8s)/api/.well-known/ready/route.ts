export async function GET() {
  return new Response(null, {
    status: 200, // Would prefer 204, but https://github.com/vercel/next.js/issues/49005
  });
}

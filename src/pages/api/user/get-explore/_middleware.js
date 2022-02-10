export default async function middleware(req, ev) {
  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({
        message: "Only GET requests on this route.",
      }),
      {
        status: 405,
      }
    );
  }
}

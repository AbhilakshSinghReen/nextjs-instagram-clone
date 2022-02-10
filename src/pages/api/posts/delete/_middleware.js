export default async function middleware(req, ev) {
  if (req.method !== "DELETE") {
    return new Response(
      JSON.stringify({
        message: "Only DELETE requests on this route.",
      }),
      {
        status: 405,
      }
    );
  }
}

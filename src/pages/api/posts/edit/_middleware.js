export default async function middleware(req, ev) {
  if (req.method !== "PATCH") {
    return new Response(
      JSON.stringify({
        message: "Only PATCH requests on this route.",
      }),
      {
        status: 405,
      }
    );
  }
}

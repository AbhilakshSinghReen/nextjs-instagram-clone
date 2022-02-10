export default async function middleware(req, ev) {
  if (req.method !== "PUT") {
    return new Response(
      JSON.stringify({
        message: "Only PUT requests on this route.",
      }),
      {
        status: 405,
      }
    );
  }
}

export default async function middleware(req, ev) {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({
          message: "Only POST requests on this route.",
        }),
        {
          status: 405,
        }
      );
    }
  }
  
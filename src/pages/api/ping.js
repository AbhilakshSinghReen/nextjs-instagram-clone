export default function handler(req, res) {
  console.log("Somebody just pinged us.");

  if (req.method !== "GET") {
    return res.status(405).send({
      message: "Only GET requests on this route.",
    });
  }

  res.status(200).json({
    message: "Server is online.",
  });
}

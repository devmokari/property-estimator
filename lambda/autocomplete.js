const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

const BASE_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
};

const AUTOCOMPLETE_ENDPOINT =
  "https://api.geoapify.com/v1/geocode/autocomplete";

exports.handler = async (event) => {
  const method =
    event?.requestContext?.http?.method || event?.httpMethod || "GET";

  if (method === "OPTIONS") {
    return {
      statusCode: 204,
      headers: BASE_HEADERS,
      body: "",
    };
  }

  if (method !== "GET") {
    return {
      statusCode: 405,
      headers: BASE_HEADERS,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  if (!GEOAPIFY_API_KEY) {
    return {
      statusCode: 500,
      headers: BASE_HEADERS,
      body: JSON.stringify({ message: "Geoapify API key is not configured." }),
    };
  }

  const query = event?.queryStringParameters?.text || "";
  const searchText = query.trim();

  if (!searchText) {
    return {
      statusCode: 400,
      headers: BASE_HEADERS,
      body: JSON.stringify({ message: "Query parameter 'text' is required." }),
    };
  }

  try {
    const url = new URL(AUTOCOMPLETE_ENDPOINT);
    url.searchParams.set("text", searchText);
    url.searchParams.set("apiKey", GEOAPIFY_API_KEY);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const body = await response.text();
      return {
        statusCode: response.status,
        headers: BASE_HEADERS,
        body: JSON.stringify({
          message: "Failed to fetch suggestions from Geoapify.",
          details: body,
        }),
      };
    }

    const payload = await response.json();
    return {
      statusCode: 200,
      headers: {
        ...BASE_HEADERS,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: BASE_HEADERS,
      body: JSON.stringify({ message: "Autocomplete lookup failed.", error: error.message }),
    };
  }
};

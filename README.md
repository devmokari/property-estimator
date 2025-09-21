# property-estimator

## Backend configuration

Autocomplete suggestions are now proxied through the backend so the Geoapify
API key is never exposed to the browser. Configure the backend (e.g. the AWS
Lambda behind `API_URL`) with the following environment variable:

| Variable           | Description                              |
| ------------------ | ---------------------------------------- |
| `GEOAPIFY_API_KEY` | Geoapify API key used for autocomplete.  |

The Lambda function should expose a `GET /autocomplete` route that invokes the
code in `lambda/autocomplete.js`. The handler reads the API key from the
environment variable, calls Geoapify, and returns the JSON payload directly to
the frontend. Remember to redeploy the Lambda after updating the environment
variable so the new configuration takes effect.

For local development you can set the environment variable before running the
Lambda locally. An `.env.example` file is provided at the project root—copy it
to `.env` and update the placeholder value, or export the variable manually:

```bash
export GEOAPIFY_API_KEY=your-key-here
```

If you deploy the backend somewhere else (e.g. Express, API Gateway), ensure
the same route and environment variable are configured so `app.js` can reach
`<API_URL>/autocomplete?text=...` for address suggestions.
 

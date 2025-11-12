// This file contains the configuration for your AWS services.

// --- INSTRUCTIONS FOR A MODERN DEPLOYMENT (e.g., AWS Amplify) ---
// We will use an environment variable to store the API Gateway endpoint. This is more secure
// and flexible than hardcoding the URL directly in the code.

// 1. FOR LOCAL DEVELOPMENT:
//    - Create a file named `.env.local` in the root directory of your project.
//    - Inside `.env.local`, add the following line, replacing the URL with your actual endpoint:
//      VITE_API_GATEWAY_ENDPOINT=https://ab12cd34ef.execute-api.your-region.amazonaws.com/v1/upload-url

// 2. FOR PRODUCTION (AWS AMPLIFY):
//    - In your Amplify application settings, go to "Environment variables".
//    - Add a variable with the key `VITE_API_GATEWAY_ENDPOINT`.
//    - Set the value to your final, production API Gateway Invoke URL.

// The `import.meta.env.VITE_...` is how the Vite build tool (used by this project)
// exposes environment variables to your frontend code. We access it safely using
// optional chaining to prevent the application from crashing at startup if the
// variable is not defined.
export const API_GATEWAY_ENDPOINT = (import.meta as any).env?.VITE_API_GATEWAY_ENDPOINT;

if (!API_GATEWAY_ENDPOINT) {
  console.warn("WARNING: VITE_API_GATEWAY_ENDPOINT is not defined. File uploads will fail. Please check your .env.local file or Amplify build settings.");
}

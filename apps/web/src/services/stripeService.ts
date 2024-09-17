import axiosInstance from "./axios.config";

export async function createSetupIntent(accessToken: string) {
  try {
    const response = await axiosInstance.get(
      "/api/stripe/create-setup-intent",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data.setup_intent.client_secret; // Return the client secret directly
  } catch (error) {
    console.error("Error creating setup intent:", error);
    throw error;
  }
}

export async function createCustomerSession(accessToken: string) {
  try {
    const response = await axiosInstance.get("/api/stripe/create-session", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.customer;
  } catch (error) {
    console.error("Error creating customer session:", error);
    throw error;
  }
}

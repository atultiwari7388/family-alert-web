export const sendAlertMessage = async (
  phoneNumbers: string[],
  messageBody: string
) => {
  const apiUrl =
    "https://us-central1-familyalert-dev.cloudfunctions.net/sendAlertMessage";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumbers, messageBody }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("API call successful:", data);
    } else {
      console.error("API call failed:", response.status, await response.text());
    }
  } catch (error) {
    console.error("Error calling API:", error);
  }
};

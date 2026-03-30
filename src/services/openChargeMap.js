const API_KEY = "405819b5-00f9-4be7-8859-aca6826db1fb";

export async function fetchChargeStations() {
  const url = `https://api.openchargemap.io/v3/poi/?output=json&countrycode=GB&maxresults=50&key=${API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch charge station data");
  }

  const data = await response.json();
  return data;
}
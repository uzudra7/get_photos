interface PhotoData {
  total: number;
  total_pages: number;
  results: [];
}

export async function getData(
  query: string,
  pagenumber: number
): Promise<PhotoData | null> {
  try {
    const response = await fetch(
      "https://api.unsplash.com/search/photos?client_id=YprTx_IEAmMisfAjGuUUxNP6Tx05v7lt1dfHVvbFJ80&query=" +
        query +
        "&per_page=30" +
        "&page=" +
        pagenumber
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const jsonData: PhotoData = await response.json();
    return jsonData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

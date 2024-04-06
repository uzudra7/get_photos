"use client";
import { useEffect, useState } from "react";
import { getData } from "./_apis/get";
import Styles from "./page.module.css";

interface ImageData {
  id: string;
  slug: string;
  description: string;
  urls: {
    small_s3: string;
    raw: string;
  };
}

interface PhotoData {
  total: number;
  total_pages: number;
  results: [];
}

interface finalmetadata {
  query: string;
  id: string;
  slug: string;
  description: string;
  urls: { raw: string };
  placeHolderTag: string;
}

export default function Home() {
  const [checkedImages, setCheckedImages] = useState<string[]>([]);
  const [images, setImages] = useState<ImageData[]>([]);
  const [total_pages, setTotal_pages] = useState<number>(0);
  const [query, setQuery] = useState<string>("");
  const [oldQuery, setOldQuery] = useState<string>("");
  const [pagenumber, setPagenumber] = useState<number>(1);
  const [placeHolderTag, setPlaceHolderTag] = useState<string>("");

  const handleImageClick = (imageId: string) => {
    if (checkedImages.includes(imageId)) {
      setCheckedImages(checkedImages.filter((id) => id !== imageId));
    } else {
      setCheckedImages([...checkedImages, imageId]);
    }
  };

  const fetchData = async () => {
    setCheckedImages([]);
    window.scrollTo({ top: 0 });
    if (query != oldQuery) {
      setPagenumber(1);
      setOldQuery(query);
    }

    const data: PhotoData | null = await getData(query, pagenumber);
    if (!data) return [];
    setTotal_pages(data.total_pages);
    return data.results.map((image: ImageData) => ({
      id: image.id,
      slug: image.slug,
      description: image.description,
      urls: {
        small_s3: image.urls.small_s3,
        raw: image.urls.raw,
      },
    })) as ImageData[];
  };

  const queryFetchHandaler = () => {
    fetchData().then((data) => setImages(data));
  };

  const downloadCsv = () => {
    const selectedImagesData = images.filter((image) =>
      checkedImages.includes(image.id)
    );
    const finalData: finalmetadata[] = selectedImagesData.map((image) => ({
      query: query,
      id: image.id,
      slug: image.slug,
      description: image.description,
      urls: { raw: image.urls.raw },
      placeHolderTag: placeHolderTag,
    }));
    console.log(finalData);

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imagesData: finalData }),
    };

    // API route
    const apiRoute = "http://122.166.152.38:3001/save-images-csv";

    // Make fetch request
    fetch(apiRoute, requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Data:", data);
        // Handle response data as needed
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        // Handle errors
      });
    // const headings = [
    //   "ID",
    //   "Slug",
    //   "Description",
    //   "Raw URL",
    //   "place holder tag",
    // ];
    // const csvContent =
    //   "data:text/csv;charset=utf-8," +
    //   [headings.join(",")]
    //     .concat(
    //       selectedImagesData.map((image) =>
    //         [
    //           image.id,
    //           image.slug,
    //           image.description,
    //           image.urls.raw,
    //           placeHolderTag,
    //         ].join(",")
    //       )
    //     )
    //     .join("\n");

    // const encodedUri = encodeURI(csvContent);
    // const link = document.createElement("a");
    // link.setAttribute("href", encodedUri);
    // link.setAttribute("download", "images.csv");
    // document.body.appendChild(link);
    // link.click();
  };

  function nextPageHandaler() {
    if (pagenumber < total_pages) {
      setPagenumber(pagenumber + 1);
    }
  }
  function prevPageHandaler() {
    if (pagenumber > 1) {
      setPagenumber(pagenumber - 1);
    }
  }

  useEffect(() => {
    queryFetchHandaler();
  }, [pagenumber]);

  const gridItems = images.map((image, index) => (
    <div
      key={image.id}
      className="relative flex justify-center items-center"
      style={{ height: "180px" }}
    >
      <input
        type="checkbox"
        id={`checkbox_${image.id}`}
        checked={checkedImages.includes(image.id)}
        onChange={() => handleImageClick(image.id)}
        className="absolute top-0 right-0  mr-3 m-4 md:mr-7"
        style={{ width: "1.5em", height: "1.5em" }}
      />
      <img
        src={image.urls.small_s3}
        alt={image.description}
        className="cursor-pointer rounded-xl"
        onClick={() => handleImageClick(image.id)}
        loading="lazy"
        style={{ width: "13.33em", height: "10em" }}
      />
    </div>
  ));

  return (
    <main className="overflow-x-hidden">
      <div className="flex p-6 items-center">
        <h1 className="text-3xl md:text-5xl font-bold text-center ml-10">
          Photos
        </h1>
        <h1 className="text-2xl font-bold text-center ml-10">
          Page {pagenumber}/{total_pages}{" "}
        </h1>{" "}
      </div>
      <div className="mb-4 flex flex-col lg:flex-row lg:flex">
        <input
          className="w-1/2 md:w-1/4 ml-10 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="query"
          type="text"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query"
        />
        <input
          className="w-1/2  md:w-1/4 ml-10 md:mt-0 mt-5 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="placeholdertag"
          type="text"
          onChange={(e) => setPlaceHolderTag(e.target.value)}
          placeholder="Enter your place holder tag"
        />
      </div>
      <div>
        <button
          className="ml-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={() => {
            queryFetchHandaler();
          }}
        >
          Submit
        </button>
      </div>
      <div
        className={` ${Styles.gridContainer} mx-auto  gap-4 md:gap-10 mt-5 px-6 flex justify-center`}
      >
        {gridItems}
      </div>
      <div className="flex py-10">
        <button
          className="ml-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={() => {
            prevPageHandaler();
          }}
        >
          prev
        </button>
        <button
          onClick={downloadCsv}
          className=" md:ml-auto md:mx-0 md:mr-5 mx-auto bg-blue-500  hover:bg-blue-700 text-white font-bold py-2 px-4  rounded focus:outline-none focus:shadow-outline"
        >
          Download{" "}
          {checkedImages.length == 0 ? "" : "(" + checkedImages.length + ")"}
        </button>
        <button
          className="mr-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={() => {
            nextPageHandaler();
          }}
        >
          next
        </button>
      </div>
    </main>
  );
}

import { useState } from "react";
import axios from "axios";
import AWS from "aws-sdk";

function App() {
  const [url1, setURL1] = useState("");
  const [url2, setURL2] = useState("");
  const [url3, setURL3] = useState("");
  const [query, setQuery] = useState("");
  const [queryResponse, setQueryResponse] = useState("");
  const [urlStatus, setUrlStatus] = useState(false);
  const [language, setLanguage] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [playing, setPlaying] = useState(false);
  const [source, setSource] = useState("");


  AWS.config.update(awsConfig);
  const polly = new AWS.Polly();

  const translateText = async (queryResponse, language) => {
    setLoading(true);
    const params = {
      OutputFormat: "mp3",
      Text: queryResponse,
      LanguageCode: language,
      VoiceId: "Aditi", // Voice for the translated text
    };

    try {
      const data = await polly.synthesizeSpeech(params).promise();
      const audioBlob = new Blob([data.AudioStream], { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);
    } catch (error) {
      console.error("Error translating text:", error);
    } finally {
      setLoading(false);
    }
  };

  const audio = new Audio();

  const startAudio = async () => {
    setPlaying(true);
    audio.src = audioUrl;
    await audio.load();
    audio.play();
  };

  const stopAudio = () => {
    setPlaying(false);
    audio.pause();
    audio.currentTime = 0;
  };

  const handleTranslate = async () => {
    await translateText(queryResponse, language);
  };


  const handleProcess = async () => {
    let jsonData = [];
    if (url1 !== "") jsonData.push(url1);
    if (url2 !== "") jsonData.push(url2);
    if (url3 !== "") jsonData.push(url3);

    const requestBody = {
      urls: jsonData,
    };
    try {
      const response = await axios.post(
        "http://localhost:8000/getURLs",
        requestBody
      );
      setUrlStatus(true);
      // console.log("Response:", response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleAnswer = async () => {
    if (query !== "") {
      const requestBody = {
        query: query,
      };
      try {
        const response = await axios.post(
          "http://localhost:8000/getResponse",
          requestBody
        );
        // console.log("Response:", response.data);
        const answer = response.data.response;
        const source = response.data.source;
        const language = response.data.language_code + "-IN";
        setLanguage(language);
        console.log(response.data);
        setQueryResponse(answer);
        setSource(source);
        setUrlStatus(true);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handleSummary = async () => {
    try {
      const response = await axios.post("http://localhost:8000/getSummary");
      console.log("Response:", response.data);
      setQueryResponse(response.data.response);
      console.log("Language is : "+language);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="app-name h-screen">
      <div className="head h-1/6 pt-3">
        <div className="app-name flex items-center justify-center">
          <h1 className="text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl ">
            InvestSmart
          </h1>
        </div>
        <div className="small-tag flex items-center justify-center">
          <p className="mt-3 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48">
            Transform finance articles into instant insights with just a Link..😎
          </p>
        </div>
      </div>
      <div className="App w-screen h-3/6 pt-3 bg-white flex flex-wrap">
        <div className="main-urls pl-11 pt-5  w-2/5 border-r-2">
          <div className="url1 mb-5 w-3/4">
            <label
              htmlFor="url1"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Enter 1st URL
            </label>
            <input
              type="url"
              name="url1"
              onChange={(e) => {
                setURL1(e.target.value);
              }}
              placeholder="First URL"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
          <div className="url2 mt-5 mb-5 w-3/4">
            <label
              htmlFor="url2"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Enter 2nd URL
            </label>
            <input
              type="url"
              name="url2"
              onChange={(e) => {
                setURL2(e.target.value);
              }}
              placeholder="Second URL"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
          <div className="url3 mt-5 mb-5 w-3/4">
            <label
              htmlFor="url3"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Enter 3rd URL
            </label>
            <input
              type="url"
              name="url3"
              onChange={(e) => {
                setURL3(e.target.value);
              }}
              placeholder="Third URL"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
          <div className="button ml-36">
            {urlStatus && (
              <p className="-mx-16">URL Processed Successfully!!!✅✅</p>
            )}
            <button
              type="button"
              onClick={handleProcess}
              className="mt-2 text-white bg-gray-800 hover:bg-gray-900 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700py-3 px-4 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50 disabled:pointer-events-none"
            >
              Process
            </button>
          </div>
        </div>
        <div className="main-query w-3/5 pl-10 pr-11">
          <div class="m-5">
            <label
              for="large-input"
              class="block mb-2 text-base font-medium text-gray-900"
            >
              Enter Query/Prompt
            </label>
            <textarea
              type="text"
              id="large-input"
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              placeholder="Write your prompt here.."
              class="h-52 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
          <div className="submit-button pl-96">
            <button
              type="button"
              onClick={handleAnswer}
              className="mr-5 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700py-3 px-4 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50 disabled:pointer-events-none"
            >
              Answer
            </button>
            <button
              type="button"
              onClick={handleSummary}
              className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700py-3 px-4 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50 disabled:pointer-events-none"
            >
              Summary
            </button>
          </div>
        </div>
      </div>
      <div className="answer h-2/6 pl-9 pr-9  w-screen">
        <div className="final-answer-space ">
          <p className="text-black"></p>
          <label
            for="large-input"
            class="block mb-2 text-xl font-semibold text-gray-900"
          >
            Response:
          </label>
          <textarea
            type="text"
            id="large-input"
            disabled
            value={queryResponse}
            class="h-32 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          />
          {urlStatus && <a href={source} target="_blank">Link</a>}
          <div className="mt-2">
            <button
            className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
            onClick={startAudio} disabled={!audioUrl || playing}>
              Start
            </button>
            {/* <button
            className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
            onClick={stopAudio} disabled={!audioUrl || !playing}>
              Stop
            </button> */}
            <button
            className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
            onClick={handleTranslate}>Translate</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

import React, { RefObject } from "react";
import { FiPaperclip, FiSend, FiSquare } from "react-icons/fi";
import { EncodedImage } from "./message";

export const CopilotForm = ({
  isExpanded,
  images,
  input,
  messageActive,
  handleFileChange,
  setInput,
  handleSubmission,
  abort,
  textInputRef
}: {
  isExpanded: boolean;
  images: EncodedImage[];
  input: string;
  messageActive: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setInput: (input: string) => void;
  handleSubmission: () => void;
  abort: () => void;
  textInputRef: RefObject<HTMLInputElement>;
}) => {
  return (
    <div
      className={`p-4 border-t bg-gray-100 rounded-b-lg ${isExpanded ? "" : "hidden"}`}
    >
      <p className="text-sm mb-2 text-gray-600">
        Find data with the requested characteristics. If you include an image,
        please explain how you wish to use it to inform the query.
      </p>
      {images && (
        <div className="flex flex-wrap mb-2">
          {images.map((encodedImage, index) => (
            <div key={index} className="w-1/4 p-1">
              <img
                src={`${encodedImage.mime},${encodedImage.image}`}
                alt={`Preview ${index}`}
                className="w-full h-auto rounded"
              />
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center">
        <label
          className="btn mr-2 bg-blue-500 text-white rounded-full p-2"
          title="Upload"
        >
          <FiPaperclip />
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            multiple
            disabled={messageActive}
          />
        </label>
        <input
          className="flex-grow bg-white border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          disabled={messageActive}
          placeholder="Enter your search..."
          autoFocus
          ref={textInputRef}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && input) {
              handleSubmission();
            }
          }}
        />
        <button
          title="Send"
          className="btn ml-2 bg-blue-500 text-white rounded-full p-2"
          onClick={handleSubmission}
          disabled={messageActive}
        >
          <FiSend />
        </button>
        <button
          type="button"
          title="Stop"
          className="btn ml-2 bg-red-500 text-white rounded-full p-2"
          onClick={abort}
        >
          <FiSquare />
        </button>
      </div>
    </div>
  );
};

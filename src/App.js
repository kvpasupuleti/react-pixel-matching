import React, { useState, useEffect } from "react";
import pixelmatch from "pixelmatch";
import "./style.css";

export default function App() {
  const [img1Val, setImg1Val] = useState(
    "https://images.pexels.com/photos/355508/pexels-photo-355508.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
  );
  const [img2Val, setImg2Val] = useState(
    "https://res.cloudinary.com/kvpasupuleti/image/upload/v1737192653/Untitled_design_7_hy9rgy.png"
  );

  const [differencePixels, setDifferencePixels] = useState(null);

  const prepareImageData = async (onPrepareImageData) => {
    const getImageData = async (imageId) => {
      const img = document.getElementById(imageId);

      if (!img) {
        console.error(`Image with ID ${imageId} not found`);
        return null;
      }

      img.crossOrigin = "anonymous";

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const processImage = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);

        return { data: imageData.data, width, height };
      };

      return img.complete
        ? processImage()
        : await new Promise((resolve) => {
            img.onload = () => resolve(processImage());
          });
    };

    Promise.all(["img-1", "img-2"].map(getImageData)).then(([data1, data2]) => {
      if (data1 && data2) {
        if (data1.width === data2.width && data1.height === data2.height) {
          const dimensions = { width: data1.width, height: data1.height };
          onPrepareImageData(data1.data, data2.data, dimensions);
        } else {
          console.error(
            "Image dimensions do not match",
            data1.width,
            data1.height,
            data2.width,
            data2.height
          );
        }
      }
    });
  };

  const onClickCompare = async () => {
    const onPrepareImageData = (image1Data, image2Data, dimensions) => {
      if (image1Data && image2Data) {
        const { width, height } = dimensions;

        const diffCanvas = document.getElementById("canvas");
        diffCanvas.width = width;
        diffCanvas.height = height;
        const diffCtx = diffCanvas.getContext("2d");
        const diffImage = diffCtx.createImageData(width, height);

        const diffPixels = pixelmatch(
          image1Data,
          image2Data,
          diffImage.data,
          width,
          height,
          {
            threshold: 0.1
          }
        );

        console.log(`Difference Pixels: ${diffPixels}`);

        setDifferencePixels(diffPixels);

        // Display the diff image
        diffCtx.putImageData(diffImage, 0, 0);
        const resultContainer =
          document.getElementsByClassName("result-container")[0];
        resultContainer.appendChild(diffCanvas);
      } else {
        console.warn("Images are not loaded yet");
      }
    };
    await prepareImageData(onPrepareImageData);
  };

  return (
    <div>
      <h1>Image Comparison with Pixelmatch</h1>
      <div>
        <div className="input-container">
          <div className="input-label-wrapper">
            <label for="input-1">Image 1</label>
            <input
              id="input-1"
              onChange={(e) => {
                setImg1Val(e.target.value);
              }}
              value={img1Val}
            />
          </div>

          <div className="input-label-wrapper">
            <label for="input-2">Image 2</label>
            <input
              onChange={(e) => {
                setImg2Val(e.target.value);
              }}
              value={img2Val}
            />
          </div>
        </div>
      </div>

      <div className="image-container">
        <img src={img1Val} id="img-1" alt="Image 1" />
        <div className="vertical-separator"></div>
        <img src={img2Val} id="img-2" alt="Image 2" />
      </div>

      <div className="compare-button-container">
        <button className="compare-button" onClick={onClickCompare}>
          Compare
        </button>
        <p>
          <b>Note: </b>Both images should be of the same size
        </p>
      </div>
      <div className="result-container">
        <h1>Result</h1>
        <h3>Difference Pixels : {differencePixels}</h3>
        <canvas id="canvas"></canvas>
      </div>
    </div>
  );
}

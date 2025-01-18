import React, { useState, useEffect } from 'react';
import pixelmatch from 'pixelmatch';
import './style.css';

export default function App() {
  const [img1Data, setImg1Data] = useState(null);
  const [img2Data, setImg2Data] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [differencePixels, setDifferencePixels] = useState(null);

  useEffect(() => {
    const getImageData = async (imageId) => {
      const img = document.getElementById(imageId);

      if (!img) {
        console.error(`Image with ID ${imageId} not found`);
        return null;
      }

      img.crossOrigin = 'anonymous';

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

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

    Promise.all(['img-1', 'img-2'].map(getImageData)).then(([data1, data2]) => {
      if (data1 && data2) {
        if (data1.width === data2.width && data1.height === data2.height) {
          setDimensions({ width: data1.width, height: data1.height });
          setImg1Data(data1.data);
          setImg2Data(data2.data);
        } else {
          console.error(
            'Image dimensions do not match',
            data1.width,
            data1.height,
            data2.width,
            data2.height
          );
        }
      }
    });
  }, []);

  const onClickCompare = () => {
    if (img1Data && img2Data) {
      const { width, height } = dimensions;

      const diffCanvas = document.createElement('canvas');
      diffCanvas.width = width;
      diffCanvas.height = height;
      const diffCtx = diffCanvas.getContext('2d');
      const diffImage = diffCtx.createImageData(width, height);

      const diffPixels = pixelmatch(
        img1Data,
        img2Data,
        diffImage.data,
        width,
        height,
        {
          threshold: 0.1,
        }
      );

      console.log(`Difference Pixels: ${diffPixels}`);

      setDifferencePixels(diffPixels);

      // Display the diff image
      diffCtx.putImageData(diffImage, 0, 0);
      document.body.appendChild(diffCanvas);
    } else {
      console.warn('Images are not loaded yet');
    }
  };

  return (
    <div>
      <h1>Image Comparison with Pixelmatch</h1>
      <button onClick={onClickCompare}>Compare</button>
      <img
        src="https://res.cloudinary.com/kvpasupuleti/image/upload/v1737185829/elephant_image_1_lpg9d5.png"
        id="img-1"
        alt="Image 1"
      />
      <img
        src="https://res.cloudinary.com/kvpasupuleti/image/upload/v1737185829/elephant_image_2_bpzgys.png"
        id="img-2"
        alt="Image 2"
      />
      <h3>Difference Pixels : {differencePixels}</h3>
    </div>
  );
}

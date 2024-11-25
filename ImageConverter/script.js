const imageInput = document.getElementById('imageInput');
const effects = document.getElementById('effects');
const applyEffectButton = document.getElementById('apply');
const goBackButton = document.getElementById('goBack');
const uploadSection = document.getElementById('uploadSection');
const canvasSection = document.getElementById('canvasSection');
const originalCanvas = document.getElementById('originalCanvas');
const processedCanvas = document.getElementById('processedCanvas');
const originalCtx = originalCanvas.getContext('2d');
const processedCtx = processedCanvas.getContext('2d');

const OUTPUT_HEIGHT = 300;
const OUTPUT_WIDTH = 300;

let originalImage = null;

imageInput.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = function () {

        const aspectRatio = img.width / img.height;
        let scaledWidth = OUTPUT_WIDTH;
        let scaledHeight = OUTPUT_HEIGHT;

        if (aspectRatio > 1) {
            // Wider than tall
            scaledHeight = OUTPUT_WIDTH / aspectRatio;
        } else {
            // Taller than wide
            scaledWidth = OUTPUT_HEIGHT * aspectRatio;
        }

        // Set canvas to fixed output dimensions
        processedCanvas.width = originalCanvas.width = OUTPUT_WIDTH;
        processedCanvas.height = originalCanvas.height = OUTPUT_HEIGHT;

        // Draw scaled image to both canvases
        originalCtx.clearRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
        originalCtx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

        originalImage = originalCtx.getImageData(0, 0, scaledWidth, scaledHeight);
    };

    img.onerror = function () {
        alert('Failed to load image.');
    };
});

applyEffectButton.addEventListener('click', function () {
    if (!originalImage) {
        alert('Please upload an image first.');
        return;
    }

    const selectedEffect = effects.value;
    const processedImage = processedCtx.createImageData(originalImage);
    processedImage.data.set(originalImage.data);

    if (selectedEffect === 'grayscale') {
        applyGrayscale(processedImage);   
    } else if (selectedEffect === 'blurred') {
        blurImage(processedImage)
    }
    processedCtx.putImageData(processedImage, 0, 0);

    uploadSection.classList.add('hidden');
    canvasSection.classList.remove('hidden');
});


goBackButton.addEventListener('click', function () {
    uploadSection.classList.remove('hidden');
    canvasSection.classList.add('hidden');
});



function applyGrayscale(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        data[i] = data[i + 1] = data[i + 2] = gray;
    }
}

function blurImage(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    const tempData = new Uint8ClampedArray(data.slice()); // Robust copy
    const kernelSize = 5; // 3x3 kernel
    const halfKernel = Math.floor(kernelSize / 2);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0,
                g = 0,
                b = 0,
                count = 0;

            // Iterate over the kernel
            for (let ky = -halfKernel; ky <= halfKernel; ky++) {
                for (let kx = -halfKernel; kx <= halfKernel; kx++) {
                    const px = x + kx;
                    const py = y + ky;

                    // Check if within bounds
                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        const index = (py * width + px) * 4;
                        r += tempData[index];
                        g += tempData[index + 1];
                        b += tempData[index + 2];
                        count++;
                    }
                }
            }

            const index = (y * width + x) * 4;
            data[index] = r / count;       // Average red
            data[index + 1] = g / count;  // Average green
            data[index + 2] = b / count;  // Average blue
            // Leave alpha channel unchanged
        }
    }
}




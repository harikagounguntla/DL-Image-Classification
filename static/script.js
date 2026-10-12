const imageInput = document.getElementById("image");
const preview = document.getElementById("preview");
const camera = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const startCamera = document.getElementById("startCamera");
const takePhoto = document.getElementById("takePhoto");
const cameraMessage = document.getElementById("cameraMessage");
const uploadBox = document.getElementById("uploadBox");
const wasteForm = document.getElementById("wasteForm");

let cameraStream = null;
let previewUrl = null;

// Display the selected image
function showPreview(file) {
    if (!file || !file.type.startsWith("image/")) {
        cameraMessage.textContent =
            "Please select a valid image file.";
        return false;
    }

    // Release the previous preview URL
    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
    }

    previewUrl = URL.createObjectURL(file);
    preview.src = previewUrl;
    preview.style.display = "block";

    if (uploadBox) {
        uploadBox.classList.add("has-image");
    }

    cameraMessage.textContent =
        "Image selected. Click Analyze Waste to predict.";

    return true;
}

// Handle image selection
imageInput.addEventListener("change", function () {
    const file = this.files[0];

    if (!file) {
        preview.style.display = "none";
        preview.removeAttribute("src");

        if (uploadBox) {
            uploadBox.classList.remove("has-image");
        }

        return;
    }

    if (!showPreview(file)) {
        imageInput.value = "";
        preview.style.display = "none";
        preview.removeAttribute("src");
    }
});

// Drag-and-drop image upload
if (uploadBox) {
    uploadBox.addEventListener("dragover", function (event) {
        event.preventDefault();
        uploadBox.classList.add("drag-over");
    });

    uploadBox.addEventListener("dragleave", function () {
        uploadBox.classList.remove("drag-over");
    });

    uploadBox.addEventListener("drop", function (event) {
        event.preventDefault();
        uploadBox.classList.remove("drag-over");

        const file = event.dataTransfer.files[0];

        if (!file || !file.type.startsWith("image/")) {
            cameraMessage.textContent =
                "Please drop a valid image file.";
            return;
        }

        const transfer = new DataTransfer();
        transfer.items.add(file);
        imageInput.files = transfer.files;

        imageInput.dispatchEvent(
            new Event("change", { bubbles: true })
        );
    });
}

// Validate the image before submitting to Flask
wasteForm.addEventListener("submit", function (event) {
    if (!imageInput.files || imageInput.files.length === 0) {
        event.preventDefault();

        cameraMessage.textContent =
            "Please upload or capture a waste image first.";
    }
});

// Open the device camera
startCamera.addEventListener("click", async function () {
    if (!navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia) {
        cameraMessage.textContent =
            "Camera unavailable. Please use image upload.";
        return;
    }

    try {
        stopCamera();

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false
        });

        camera.srcObject = cameraStream;
        camera.style.display = "block";

        await camera.play();

        takePhoto.style.display = "inline-block";

        cameraMessage.textContent =
            "Camera ready. Click Take Photo when ready.";

    } catch (error) {
        stopCamera();

        camera.style.display = "none";
        takePhoto.style.display = "none";

        cameraMessage.textContent =
            "Could not open camera. Allow camera permission or use image upload.";
    }
});

// Capture a photo and prepare it for prediction
takePhoto.addEventListener("click", function () {
    if (!cameraStream ||
        !camera.videoWidth ||
        !camera.videoHeight) {
        cameraMessage.textContent =
            "Please wait for the camera to start.";
        return;
    }

    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(
        camera,
        0,
        0,
        canvas.width,
        canvas.height
    );

    canvas.toBlob(function (blob) {
        if (!blob || blob.size === 0) {
            cameraMessage.textContent =
                "Could not capture photo. Please try again.";
            return;
        }

        const photo = new File(
            [blob],
            "camera-photo.jpg",
            { type: "image/jpeg" }
        );

        const transfer = new DataTransfer();
        transfer.items.add(photo);

        imageInput.files = transfer.files;

        showPreview(photo);

        stopCamera();

        camera.style.display = "none";
        takePhoto.style.display = "none";

    }, "image/jpeg", 0.9);
});

// Stop the camera safely
function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(function (track) {
            track.stop();
        });
        cameraStream = null;
    }
    camera.srcObject = null;
}

// Release the camera when leaving the page
window.addEventListener("pagehide", function () {
    stopCamera();

    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        previewUrl = null;
    }
});
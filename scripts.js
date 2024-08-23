document.getElementById('generateBtn').addEventListener('click', async () => {
    const prompt = document.getElementById('prompt').value;
    let width = parseInt(document.getElementById('width').value);
    let height = parseInt(document.getElementById('height').value);

    width = Math.floor(width / 8) * 8;
    height = Math.floor(height / 8) * 8;

    const API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell";
    const API_KEY = "Bearer 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";

    const loadingContainer = document.getElementById('loading-container');
    const loadingProgress = document.getElementById('loading-progress');
    const loadingText = document.getElementById('loading-text');
    const loadingTime = document.getElementById('loading-time');
    const timeLeftText = document.getElementById('time-left');
    const imageContainer = document.getElementById('image-container');

    try {
        loadingContainer.classList.remove('hidden');
        imageContainer.innerHTML = '';

        let estimatedTime = calculateEstimatedTime(width, height);
        timeLeftText.textContent = `${estimatedTime}s`;
        loadingTime.classList.remove('hidden');

        let progress = 0;
        let interval = setInterval(() => {
            if (progress < 100) {
                progress += 10;
                loadingProgress.style.width = `${progress}%`;
                loadingText.textContent = `Loading... ${progress}%`;
            } else {
                clearInterval(interval);
                loadingText.textContent = "Finishing...";
            }
        }, 1000);

        const bodyData = {
            inputs: prompt,
            parameters: {
                width: width,
                height: height
            }
        };

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bodyData)
        });

        if (!response.ok) {
            throw new Error(`API request failed with status code ${response.status}: ${await response.text()}`);
        }

        const reader = response.body.getReader();
        const chunks = [];
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
        }

        const blob = new Blob(chunks);
        const imageUrl = URL.createObjectURL(blob);

        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        imageContainer.appendChild(imgElement);

        addToLibrary(imageUrl);

        loadingContainer.classList.add('hidden');
    } catch (error) {
        loadingContainer.classList.add('hidden');
        alert("An error occurred: " + error.message);
    }
});

function calculateEstimatedTime(width, height) {
    return Math.max(5, Math.ceil((width * height) / 1000000));
}

function addToLibrary(imageUrl) {
    const libraryContainer = document.getElementById('library-container');
    const imgElement = document.createElement('img');
    imgElement.src = imageUrl;
    imgElement.alt = "Library Image";
    imgElement.addEventListener('click', () => showImageModal(imageUrl));
    libraryContainer.appendChild(imgElement);
}

function openTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-button');

    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(button => button.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');
    document.querySelector(`.tab-button[onclick="openTab('${tabName}')"]`).classList.add('active');
}

function showImageModal(imageUrl) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <img src="${imageUrl}" alt="Expanded Image">
        </div>
    `;
    document.body.appendChild(modal);

    const closeButton = modal.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

const tableBody = document.getElementById("anime-list");

function loadAndResizeImage(imageSrc, callback) {
    const img = new Image();
    img.src = imageSrc;
    
    img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 1024;
        canvas.height = 256;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const resizedImageSrc = canvas.toDataURL('image/png', 0.7);
        callback(resizedImageSrc);
    };

    img.onerror = function () {
        console.error(`Failed to load image: ${imageSrc}`);
    };
}

fetch('animeList.json')
    .then(response => response.json())
    .then(animeList => {
        animeList.forEach((anime, index) => {
            let row = document.createElement("tr");
            row.className = "anime-row";

            loadAndResizeImage(`images/${anime.banner}`, function(resizedImage) {
                row.style.backgroundImage = `url(${resizedImage})`;
            });

            row.innerHTML = `
                <td>${index + 1}</td>  <!-- Serial number -->
                <td>${anime.title}</td>
                <td>${anime.genre}</td>
                <td>${anime.rating}</td>
                <td>${anime.review}</td>
                <td>${anime.status}</td>
            `;

            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error("Error fetching anime list:", error);
    });


const tableBody = document.getElementById("anime-list");

fetch('animeList.json')
    .then(response => response.json())
    .then(animeList => {
        animeList.forEach((anime, index) => {
            let row = document.createElement("tr");
            row.className = "anime-row";
            row.style.backgroundImage = `url('images/${anime.banner}')`;

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

animeList.forEach((anime, index) => {
    let row = document.createElement("tr");
    row.className = "anime-row";
    row.style.backgroundImage = `url('images/${anime.banner}')`; 

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

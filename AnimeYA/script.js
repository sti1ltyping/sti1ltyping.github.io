const animeList = [
    {
        title: "Death Note",
        genre: "Thriller, Supernatural",
        rating: 9.0,
        review: "A psychological battle between a detective and a high school genius.",
        status: "Completed",
        banner: "death_note.png"
    },
    {
        title: "High School DxD",
        genre: "Ecchi, Fantasy",
        rating: 7.0,
        review: "Action-packed anime with supernatural and fanservice elements.",
        status: "Ongoing",
        banner: "high_school_dxd.png"
    },
];

const tableBody = document.getElementById("anime-list");

animeList.forEach(anime => {
    let row = document.createElement("tr");
    row.className = "anime-row";
    row.style.backgroundImage = `url('images/${anime.banner}')`;

    row.innerHTML = `
        <td><img src="images/${anime.banner}" alt="${anime.title}" width="100" /></td>
        <td>${anime.title}</td>
        <td>${anime.genre}</td>
        <td>${anime.rating}</td>
        <td>${anime.review}</td>
        <td>${anime.status}</td>
    `;

    tableBody.appendChild(row);
});

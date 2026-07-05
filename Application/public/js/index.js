/* document.addEventListener('DOMContentLoaded', () => {
    const videoGrid = document.getElementById('video-grid');
    const searchInput = document.getElementById('search-input');

    // Load initial videos
    fetch('/videos')
        .then(res => res.json())
        .then(videos => displayVideos(videos))
        .catch(err => console.error('Error loading videos:', err));

    // Search functionality ???
    searchInput.addEventListener('input', (e) => {
        fetch(`/videos/search?q=${encodeURIComponent(e.target.value)}`)
            .then(res => res.json())
            .then(displayVideos);
    });

    function displayVideos(videos) {
        videoGrid.innerHTML = videos.map(video => `
            <div class="video-thumbnail">
                <a href="/viewpost.html?id=${video.id}">
                    <img src="${video.thumbnail_url}" alt="${video.title}">
                    <h3>${video.title}</h3>
                    <p>${video.views} views</p>
                </a>
            </div>
        `).join('');
    }
});*/

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'CSC 317 App', name:"[Insert your name here]" });
});

module.exports = router;
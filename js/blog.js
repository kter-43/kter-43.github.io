let posts = [];

async function fetchPosts() {
    const response = await fetch('blogData.json');
    posts = await response.json();
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    displayPostList(posts);
    if (posts.length > 0) {
        loadPost(posts[0]);
    }
}

function displayPostList(postArray) {
    const postList = document.getElementById('postList');
    postList.innerHTML = '';
    postArray.forEach(post => {
        const link = document.createElement('a');
        link.textContent = post.title;
        link.className = 'post-link';
        link.onclick = () => loadPost(post);
        postList.appendChild(link);
    });
}

async function loadPost(post) {
    document.getElementById('postMeta').innerHTML = `
        <h2>${post.title}</h2>
        <p><strong>Author:</strong> ${post.author}</p>
        <p><strong>Tags:</strong> ${post.tags.join(', ')}</p>
    `;
    const response = await fetch(post.link);
    const markdown = await response.text();
    document.getElementById('postContent').innerHTML = marked.parse(markdown);
    document.getElementById('postImage').innerHTML = post.image ? `<img src="${post.image}" alt="Post Image">` : '';
}

document.getElementById('searchBar').addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const filteredPosts = posts.filter(post => post.tags.some(tag => tag.toLowerCase().includes(query)));
    displayPostList(filteredPosts);
});

fetchPosts();

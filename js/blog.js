
fetch('blogData.json')
  .then(response => response.json())
  .then(posts => {
    const titlesList = document.getElementById('blog-titles');
    const detailsDiv = document.getElementById('blog-details');

    function showPost(idx) {
      const post = posts[idx];
      detailsDiv.innerHTML = `
        <h2>${post.title}</h2>
        <p><strong>Author:</strong> ${post.author}</p>
        <p><strong>Tags:</strong> ${post.tags.join(', ')}</p>
        <div>${post.text
          .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
          .replace(/## (.*?)\n/g, '<h3>$1</h3>')
          .replace(/- (.*?)(\n|$)/g, '<li>$1</li>')
          .replace(/\n/g, '<br>')}</div>
        ${post.image ? `<img src="images/${post.image}" alt="${post.title}" style="max-width: 600px; margin-top: 16px;">` : ''}
      `;
    }

    function renderTitles(filteredPosts) {
      titlesList.innerHTML = '';
      filteredPosts.forEach((post, idx) => {
        const li = document.createElement('li');
        li.textContent = post.title;
        li.style.cursor = 'pointer';
        li.onclick = () => showPost(posts.indexOf(post));
        titlesList.appendChild(li);
      });
    }

    renderTitles(posts);
    if (posts.length > 0) showPost(0);

    document.getElementById('tag-search').addEventListener('input', function() {
      const query = this.value.toLowerCase();
      const filtered = posts.filter(post =>
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
      renderTitles(filtered);
      if (filtered.length > 0) {
        showPost(posts.indexOf(filtered[0]));
      } else {
        detailsDiv.innerHTML = '<p>No posts found for this tag.</p>';
      }
    });
  });


fetch('links.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('image-grid');
    data.images.forEach(item => {
      const link = document.createElement('a');
      link.href = item.link;
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt || '';
      link.appendChild(img);
      container.appendChild(link);
    });
  })
  .catch(error => console.error('Error loading images:', error));

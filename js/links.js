fetch('links.json')
      .then(response => response.json())
      .then(data => {
        const container = document.getElementById('image-grid');
        const contaiNav = document.getElementById('navigation');
        data.images.forEach(item => {
          const link = document.createElement('a');
          link.href = item.link;
          const img = document.createElement('img');
          img.src = item.src;
          img.alt = item.alt || '';
          link.appendChild(img);
          container.appendChild(link);
          const nav = document.createElement('a');
          nav.href = item.link;
          nav.className = 'kter-bar-item kter-button kter-padding-large kter-hover-deep-purple kter-text-deep-purple';
          nav.textContent = item.text;
          contaiNav.appendChild(nav);
        });
      })
      .catch(error => console.error('Error loading images:', error));

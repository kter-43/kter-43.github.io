
fetch('video.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('video-tables');
    data.video.forEach(item => {
      // Create table
      const table = document.createElement('table');
      table.innerHTML = `
        <tr>
          <td class="title-cell"><h4>${item.title}</h4></td>
          <td class="audio-cell">        
            <video width="320" height="240" controls>
                <source src="video/${item.mp4}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
          </td>
        </tr>
        <tr>
          <td colspan="2" class="composer-notes">${item.Composer}</td>
        </tr>
        <tr>
          <td colspan="2" class="composer-notes">${item.Notes}</td>
        </tr>
      `;
      container.appendChild(table);

      // Add a gap between tables
      const gap = document.createElement('div');
      gap.className = 'gap';
      container.appendChild(gap);
    });
  })
  .catch(error => {
    document.getElementById('music-tables').textContent = 'Error loading video data.';
    console.error(error);
  });

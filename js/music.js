
fetch('music.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('music-tables');
    data.audio.forEach(item => {
      // Create table
      const table = document.createElement('table');
      table.innerHTML = `
        <tr>
          <td class="title-cell"><h4>${item.title}</h4></td>
          <td class="composer-notes">${item.Composer}</td>class="audio-cell">        
            <audio controls>
              <source src="audio/${item.mp3}" type="audio/mp3">
              Your browser does not support the audio element.
            </audio>
          </td>
        </tr>
        <tr>
          <td colspan="2" class="composer-notes">${item.Notes}</td>
        </tr>
        <tr>
          <td colspan="2" class="audio-cell">        
            <audio controls>
              <source src="audio/${item.mp3}" type="audio/mp3">
              Your browser does not support the audio element.
            </audio>
          </td>
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
    document.getElementById('music-tables').textContent = 'Error loading music data.';
    console.error(error);
  });


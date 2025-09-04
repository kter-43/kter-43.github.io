
function startGalleryFromFile() {
  // Option 1: Get JSON filename from data attribute
  const galleryDiv = document.getElementById('gallery');
  const jsonFile = galleryDiv.getAttribute('data-json');

  // Option 2: Get JSON filename from input element
  // const jsonFile = document.getElementById('jsonFileName').value;

  fetch(jsonFile)
    .then(response => response.json())
    .then(data => {
      let index = 0;
      function updateTable() {
        const item = data[index];
        const tableHTML = `
          <table border="1" style="width:100%; max-width:700px; margin:auto;">
            <tr>
              <td><h2>${item.Title}</h2></td>
              <td>${item.Wood}</td>
            </tr>
            <tr>
              <td colspan="2" style="text-align:center;">
                <img src="images/${item.source}"    </td>
            </tr>
            <tr>
              <td colspan="2">${item.Notes}</td>
            </tr>
          </table>
        `;
        galleryDiv.innerHTML = tableHTML;
        index = (index + 1) % data.length;
      }
      updateTable();
      setInterval(updateTable, 5000);
    })
    .catch(error => {
      galleryDiv.innerHTML = "<p>Error loading gallery data.</p>";
      console.error(error);
    });
}

window.onload = startGalleryFromFile;

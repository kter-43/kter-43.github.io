
async function loadImages(jsonFileName) {
  try {
    const response = await fetch(jsonFileName);
    const data = await response.json();
    const carousel = document.getElementById('carousel');

    data.images.forEach((filename, index) => {
      const img = document.createElement('img');
      img.src = `images/${filename}`;
      if (index === 0) img.classList.add('active');
      carousel.appendChild(img);
    });

    let current = 0;
    const images = carousel.querySelectorAll('img');
    setInterval(() => {
      images[current].classList.remove('active');
      current = (current + 1) % images.length;
      images[current].classList.add('active');
    }, 3000);
  } catch (error) {
    console.error('Error loading images:', error);
  }
}

loadImages();
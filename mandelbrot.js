window.onload = function() {
  function Complex(x, y) {
    this.x = x;
    this.y = y;
    this.mult = function (z) {
      let this_x = this.x;
      let z_x = z.x;
      this.x = z.x * this.x - z.y * this.y;
      this.y = z.y * this_x + z_x * this.y;
    }
    this.sum = function (z) {
      this.x += z.x;
      this.y += z.y;
    }
    this.abs = function () {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
  }

  function draw(imageData, width, height) {
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let i = 0;
        let z = new Complex(0, 0);
        let c = new Complex(-2 + 3 * x / width, -1 + 2 * y / height);
        while (z.abs() < 2 && i < 255) {
          i++;
          z.mult(z);
          z.sum(c);
        }

        let indx = (y * width + x) * 4;
        imageData.data[indx] = 255 - i;
        imageData.data[indx+1] = imageData.data[indx];
        imageData.data[indx+2] = imageData.data[indx];
        imageData.data[indx+3] = 255;
      }
    }
  }
  
  function drawWrapper(canvas, draw) {
    let context = canvas.getContext("2d");
    let imageData = context.createImageData(canvas.width, canvas.height);
    draw(imageData, canvas.width, canvas.height);
    context.putImageData(imageData, 0, 0);
  }

  drawWrapper(document.getElementById("picture"), draw);
};
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('weierstrassCanvas');
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }
    const ctx = canvas.getContext('2d');

    // Adjust canvas size based on its CSS-defined size for sharper rendering
    const canvasWidth = canvas.offsetWidth;
    const canvasHeight = canvas.offsetHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Weierstrass function parameters
    const a = 0.5; // 0 < a < 1
    const b = 3;   // b is a positive odd integer. For classic non-differentiability, ab > 1 + 3/2 * PI
                   // For visual purposes, these simpler values work well.
    const N = 10;  // Number of terms in the sum (more terms = more detail, more computation)

    let time = 0; // Time variable for animation

    function weierstrassValue(x, phase) {
        let sum = 0;
        for (let n = 0; n < N; n++) {
            sum += Math.pow(a, n) * Math.cos(Math.pow(b, n) * Math.PI * (x + phase));
        }
        return sum;
    }

    function drawWeierstrass() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#7a6a58'; // Earthy brown color for the plot line

        const scaleX = 50; // How much to scale the x-axis (zoom level)
        const scaleY = 50; // How much to scale the y-axis (amplitude)
        const offsetX = canvasWidth / 2; // Center the plot horizontally
        const offsetY = canvasHeight / 2; // Center the plot vertically

        // Determine the range of x values to plot based on canvas width
        // Plotting from roughly x = -canvasWidth/(2*scaleX) to x = canvasWidth/(2*scaleX)
        // The '2' here is arbitrary, adjust for desired visible range
        const xRange = canvasWidth / scaleX / 2; 

        ctx.moveTo(0, offsetY + scaleY * weierstrassValue(-xRange, time));

        for (let pixelX = 0; pixelX < canvasWidth; pixelX++) {
            // Map pixel coordinate to function's x coordinate
            // The (pixelX - offsetX) / scaleX part maps pixel to a scaled x
            // We want x to go from -xRange to xRange as pixelX goes from 0 to canvasWidth
            let funcX = (pixelX / canvasWidth) * (2 * xRange) - xRange;
            let y = weierstrassValue(funcX, time);
            ctx.lineTo(pixelX, offsetY - scaleY * y); // Invert y for canvas coordinates
        }
        ctx.stroke();
    }

    function animate() {
        time += 0.005; // Speed of the "rotation" / phase shift
        drawWeierstrass();
        requestAnimationFrame(animate); // Loop the animation
    }

    // Ensure canvas dimensions are set before starting animation
    if (canvasWidth > 0 && canvasHeight > 0) {
        animate();
    } else {
        // Fallback or wait for canvas to be laid out if dimensions are zero initially
        // This can happen if CSS takes time to apply. A more robust solution might use ResizeObserver.
        console.warn("Canvas dimensions might not be ready. Retrying once.");
        setTimeout(() => {
            const newCanvasWidth = canvas.offsetWidth;
            const newCanvasHeight = canvas.offsetHeight;
            if(newCanvasWidth > 0 && newCanvasHeight > 0) {
                canvas.width = newCanvasWidth;
                canvas.height = newCanvasHeight;
                animate();
            } else {
                console.error("Failed to get canvas dimensions for Weierstrass plot.");
            }
        }, 100);
    }

    // Optional: Redraw on window resize to keep it crisp
    window.addEventListener('resize', () => {
        const newCanvasWidth = canvas.offsetWidth;
        const newCanvasHeight = canvas.offsetHeight;
        canvas.width = newCanvasWidth;
        canvas.height = newCanvasHeight;
        // No need to restart animate() as it uses the updated canvasWidth/Height
        // but if offsetX/Y calculations depend on initial setup not tied to draw, reconsider
    });
});
# Deep Mandelbrot

Fractal viewer with WebGL and perturbation theory acceleration in [web page](https://munrocket.github.io/deep-mandelbrot/)

### Features

- [X] Deep zoom (beta version 10^-31)
- [X] Webgl parallel processing
- [X] Perturbation theory
- [X] Double.js float
- [X] Logarithmic search for reference orbit
- [X] Julia set minimap

![Deep-Mandelbrot](https://munrocket.github.io/deep-mandelbrot/img/example.png)

### 2do
- [ ] Rotation
- [ ] Ping pong render
- [ ] Better mobile support
- [ ] Additional optimization (Mariani algorithm / progressive render / dem)

### References

1. Jussi Harkonen. *On Smooth Fractal Coloring Techniques*. [[pdf](http://jussiharkonen.com/files/on_fractal_coloring_techniques(lo-res).pdf)]
2. Javier Barrallo, Damien Jones. *Coloring algorithms for dynamical systems in the complex plane*. [[pdf](http://math.unipa.it/~grim/Jbarrallo.PDF)]
3. Bruce Dawson. *Faster Fractals Through Algebra*. [[url](https://randomascii.wordpress.com/2011/08/13/faster-fractals-through-algebra/)]
4. K.I. Martin. *Superfractalthing math.* [[pdf](http://www.superfractalthing.co.nf/sft_maths.pdf)]
5. Robert Munafo. *Speed Improvements* [[url](https://mrob.com/pub/muency/speedimprovements.html)]
6. Claude Heiland-Allen. *Adaptive super-sampling using distance estimate.* [[url](http://mathr.co.uk/blog/2014-11-22_adaptive_supersampling_using_distance_estimate.html)]
7. Arnaud Cheritat *Mandelbrot set* [[url](https://www.math.univ-toulouse.fr/~cheritat/wiki-draw/index.php/Mandelbrot_set#Normal_map_effect)]
8. M.F. Barnsley, R.L. Devaney, B.B. Mandelbrot. *The Science of Fractal Images.* [[pdf](https://becca.ooo/i-c-the-light/resources/the_science_of_fractal_images.pdf)]

[//]: # "*Adaptive Parallel Computation with CUDA Dynamic Parallelism* [[url](https://devblogs.nvidia.com/introduction-cuda-dynamic-parallelism/#disqus_thread)]"
[//]: # "Vizit Solutions. *Unleash Your Inner Supercomputer.* [[url](http://www.vizitsolutions.com/portfolio/webgl/gpgpu/)]"
[//]: # "*Numerical Methods for Finding Periodic Orbits* [[url](http://www.scholarpedia.org/article/Periodic_orbit#Numerical_Methods_for_Finding_Periodic_Orbits)]"
[//]: # "*Mandelbrot exterior coloring* https://en.wikibooks.org/wiki/Fractals/Iterations_in_the_complex_plane/demm"
[//]: # "Claude Heiland-Allen. *Perturbation techniques applied to the Mandelbrot set* [[url](https://mathr.co.uk/mandelbrot/perturbation.pdf)]"
# Deep Mandelbrot

Famous fractal with deep zoom in [web page](https://munrocket.github.io/deep-mandelbrot/)

### Features

- [X] Deep zoom (beta version 10^-31)
- [X] Webgl parallel processing
- [X] Perturbation theory
- [X] Double.js float
- [X] Logarithmic search for reference orbit

### 2do
- [ ] Pack orbit in texture / check max vertex uniform ([[1mp](https://m.habr.com/post/303142/)])
- [ ] Gracefull degradation zoom
- [ ] Webgl profiler: EXT_disjoint_timer_query
- [ ] Use another arbitrary float library for deeper zoom
- [ ] Cute UI

### References

1. Jussi Harkonen. *On Smooth Fractal Coloring Techniques*. [[pdf](http://jussiharkonen.com/files/on_fractal_coloring_techniques(lo-res).pdf)]
2. Javier Barrallo, Damien Jones. *Coloring algorithms for dynamical systems in the complex plane*. [[pdf](http://math.unipa.it/~grim/Jbarrallo.PDF)]
3. Bruce Dawson *Faster Fractals Through Algebra*. [[url](https://randomascii.wordpress.com/2011/08/13/faster-fractals-through-algebra/)]
4. K.I. Martin. *Superfractalthing math.* [[pdf](http://www.superfractalthing.co.nf/sft_maths.pdf)]
5. Robert Munafo *Adjacency Optimization* [[url](https://mrob.com/pub/muency/adjacencyoptimization.html)]
6. Claude Heiland-Allen. *Adaptive super-sampling using distance estimate.* [[url](http://mathr.co.uk/blog/2014-11-22_adaptive_supersampling_using_distance_estimate.html)]
7. Wikibook *Pictures of Julia and Mandelbrot Sets* [[pdf](https://upload.wikimedia.org/wikipedia/commons/4/47/Pictures_of_Julia_and_Mandelbrot_Sets.pdf)]

[//]: # "*Numerical Methods for Finding Periodic Orbits* [[url](http://www.scholarpedia.org/article/Periodic_orbit#Numerical_Methods_for_Finding_Periodic_Orbits)]"
[//]: # "*Newton-Raphson zooming.* [[url](http://www.fractalforums.com/index.php?topic=25029.msg98438#msg98438)]"
[//]: # "*Mandelbrot set* [[url](https://www.math.univ-toulouse.fr/~cheritat/wiki-draw/index.php/Mandelbrot_set#Deep_zooms_and_log-potential_scale)]"
[//]: # "Coloring orbit trap: http://www.bugman123.com/Fractals/"
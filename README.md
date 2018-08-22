# Mandelbrot Set

Simple version of famous fractal in [web page](http://htmlpreview.github.io/?https://github.com/munrocket/mandelbrot-set/blob/master/main.html)

### Features

- [X] Zoom in / zoom out
- [X] 2 color pallete
- [X] 5 colorizing algorithm
- [X] Optimization (only 3 multiplication in cycle)
- [X] Series approximation for deep zooms

![](https://i.imgur.com/s1xeMoy.png)

### Smoothing 
The Hubbard-Douady potential G(c) is G(c) = log Z/2^n, and G'(c) = Z'/ Z /2^n
We can calculate Z' -> 2·Z·Z' + 1
Distance is |G(c)|/|G'(c)| = 2*|Z|/|Z'|·log|Z|

### References

1. Javier Barrallo, Damien Jones. *Coloring algorithms for dynamical systems in the complex plane*. [[pdf](http://math.unipa.it/~grim/Jbarrallo.PDF)]
2. Jussi Harkonen. *On Smooth Fractal Coloring Techniques.* [[pdf](http://jussiharkonen.com/files/on_fractal_coloring_techniques(lo-res).pdf)]
3. Bruce Dawson *Faster Fractals Through Algebra* [[url](https://randomascii.wordpress.com/2011/08/13/faster-fractals-through-algebra/)]
4. K.I. Martin. *Superfractalthing math.* http://www.superfractalthing.co.nf/sft_maths.pdf
5. Jonathan Shewchuk. Adaptive Precision Floating-Point Arithmetic and Fast Robust Geometric Predicates. 1997 [[PDF](https://people.eecs.berkeley.edu/~jrs/papers/robustr.pdf)]
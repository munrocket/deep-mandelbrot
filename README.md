# Mandelbrot Set

Simple version of famous fractal in [web page](http://htmlpreview.github.io/?https://github.com/munrocket/mandelbrot-set/blob/master/main.html)

### Features

- [X] Zoom in / zoom out
- [X] Optimization (only 3 multiplication in cycle)
- [X] 2 color scheme
- [X] 2 smooth algorithm

![](https://i.imgur.com/s1xeMoy.png)

### Smoothing 
The Hubbard-Douady potential G(c) is G(c) = log Z/2^n, and G'(c) = Z'/ Z /2^n
We can calculate Z' -> 2·Z·Z' + 1
Distance is |G(c)|/|G'(c)| = |Z|·log|Z|/|Z'|

### References

1. *Faster Fractals Through Algebra* [[url](https://randomascii.wordpress.com/2011/08/13/faster-fractals-through-algebra/)]
2. Javier Barrallo, Damien Jones. *Coloring algorithms for dynamical systems in the complex plane*. [[PDF](http://math.unipa.it/~grim/Jbarrallo.PDF)]
3. Distance estimation [link](http://www.iquilezles.org/www/articles/distancefractals/distancefractals.htm)
4. K.I. Martin. *Superfractalthing math.* http://www.superfractalthing.co.nf/sft_maths.pdf
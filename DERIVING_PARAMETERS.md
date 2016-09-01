Deriving the parameters
=======================

Just some quick BS math.  Too much work put into things I don't understand!  Yay!  All for the sake of silly hobbies.

- [Paper about the Koya-Goshu Growth Function](http://file.scirp.org/Html/2-2860008_38842.htm) - I got the monomolecular growth function from here.  And twiddled with it.
- [Ontogeny of sexual size dimorphism in the spotted hyena](http://jmammal.oxfordjournals.org/content/94/6/1298) - I took their pretty graph with real data and scribbled all over it.

To start with, the averages actually vary by geographic location.  These are the broad averages from across all of Africa, which is pretty effin huge.  The dimorphism is still present, though.

Data:
- t (in months)
- scale (in the range of (0, 1))

```
Average Female
------------------------------------
t  | scale    | k         | scale (back-calced)
---|----------|-----------|----------|-----------
0  | 0.205253 | (~0.135?) | 0.205253 | 0
5  | 0.594016 | 0.134342  | 0.595349 | +0.001333
20 | 0.950802 | 0.139108  | 0.946589 | -0.004213
35 | 0.991758 | 0.130537  | 0.992950 | +0.001192
++ | 1.000000 | n/a       | n/a
```

Note: 

We're just going to assume B = 1.  A = 1 since the scale range is (0, 1). (though it may vary once we start dicking with things.)

- `S = A * (1 - B * e^(-k * t))`

Issue: If t=0 has a non-zero size, this doesn't work.
Resolution: Need to solve for B at t = 0.

- `S = 0.205253`
- `A = 1.0`
- `t = 0`
- `S = A * (1 - B * e^(-k * t))`
- `S = A * (1 - B * e^0)`
- `S = A * (1 - B)`
- `S/A = 1 - B`
- `B = 1 - S/A`
- `0.205253 = (1 - B * e^0)`
- `0.205253 = 1 - B`
- `B = 1 - 0.205253`
- `B = 0.794747`

This leaves k.

- `S = A * (1 - B * e^(-k * t))`
- `S / A = 1 - B * e^(-k * t)`
- `B * e^(-k * t) = 1 - S / A`
- `e^(-k * t) = (1 - S / A) / B`
- `-k * t = ln( (1 - S / A) / B )`
- `-k = ln( (1 - S / A) / B ) / t`
- `k = (- ln( (1 - S / A) / B ) / t)`

Note this doesn't give us anything at t = 0... Herp.

It seems to fluctuate around 0.130 and 0.140.  So, I'll just pick k = 0.135.

This seems to work pretty well.  The calculated values are higher where their estimated k is lower, and lower where it's heigher.  It's accurate to two decimals, which is good enough for our needs.

Now, this is for the average female hyena.  The male starts out the same, but grows up to be smaller.

### Male Average

Now, we could draw more lines on the graph, but since S0[f] == S0[m], I'm going to just scale the domain of `[S0[f], A[f]]` `[S0[f], A[m]]` and be done with it.

The A of the average male is 0.991758, about a 1% difference.  (curious.)

This yields a B of 0.793041.

```
Average Male
------------------------------------
t  | scale    | k         | scale (calced, k=0.120)
---|----------|-----------|----------|-----------
0  | 0.205253 | (~0.120?) | 0.205253 | 0
5  | 0.589984 | 0.131936  | 0.560115 | -0.029869
20 | 0.943070 | 0.131703  | 0.920408 | -0.022662
35 | 0.983601 | 0.110819  | 0.979964 | -0.003637
++ | 0.991758 | n/a       | n/a
```

```calc
obj tscale { t, scale };
define tscale( t, scale ) {
	local x;
	obj tscale x;
	x.t = t;
	x.scale = scale;
	return x;
}
scales_m = list( tscale( 5, 0.589984 ), tscale( 20, 0.943070 ), tscale( 35, 0.983601 ) );
A_m = 0.991758;
B_m = 0.793041;
for( i = 0; i < size( scales_m ); ++i ) {
	print k( scales_m[[ i ]].t, scales_m[[ i ]].scale, B_m );
}
```

As can be seen here, the differences between the calculated figures and the scaled figures, in the middle, often differ by greater than 0.02!  That's (estimated scale - 2%)!  The problem is that, with this graph, for the same time scale, unless we have an A[L] somewhere, we can't very well move the graph around, we'll get different fits.



Better Parameters?
------------------

Going back to [the Koya-Goshu](http://file.scirp.org/Html/2-2860008_38842.htm) formula, we see that A[L] appears in the generalized form just at the outside:

- `f(t) = A[L] + (A - A[L]) * (1 - B e^( -k ((t - µ) / d) ))^m`

Since we already discarded a number of things over there, we could just stick A[L] back in, though technically this is incorrect as A[L] is an asymptote, not just a lower bounds.

However, we do already have an A[L], which is `0.205253`.  Again, though, this is technically incorrect, as A[L] is supposed to represent the starting point of growth, which for mammals begins at conception rather than birth.

But, BS!  So, this gives us this.

- `S = A[L] + (A - A[L]) * (1 - B * e^(-k * t))`

To get B at t=0,

- `S = A[L] + (A - A[L]) * (1 - B * e^(-k * t))`
- `S - A[L] = (A - A[L]) * (1 - B * e^(-k * t))`
- `(S - A[L]) / (A - A[L]) = 1 - B * e^(-k * t)` (Hmm that looks familiar...)
- `B * e^(-k * t) = 1 - (S - A[L]) / (A - A[L])`
- `B * e^(-k * 0) = 1 - (S - A[L]) / (A - A[L])`
- `B = 1 - (S - A[L]) / (A - A[L])` (Ah, yep.  I guess Aµ = S0?  At least for monomolecular/brody.)

To solve for k we get this,

- `S = A[L] + (A - A[L]) * (1 - B * e^(-k * t))`
- `S - A[L] = (A - A[L]) * (1 - B * e^(-k * t))`
- `(S - A[L]) / (A - A[L]) = 1 - B * e^(-k * t)`
- `B * e^(-k * t) = 1 - (S - A[L]) / (A - A[L])`
- `e^(-k * t) = (1 - (S - A[L]) / (A - A[L])) / B`
- `-k * t = ln( (1 - (S - A[L]) / (A - A[L])) / B )`
- `-k = ln( (1 - (S - A[L]) / (A - A[L])) / B ) / t`
- `k = (- ln( (1 - (S - A[L]) / (A - A[L])) / B ) / t)`

```calc
A_L = 0.205253;
```

### A Slight Backtracking Digression

Part way through redefining these, I think I see a source of errors.  k() isn't parametrized to A!  It's still pretending A=1!  Which is just wrong for males.  Putting that back in gives us the same k values, to 5 places even!  So there's one source.

```
Average Male
------------------------------------
t  | scale    | k         | scale (calced, k=0.120)
---|----------|-----------|----------|-----------
0  | 0.205253 | (~0.135?) | 0.205253 | 0
5  | 0.589984 | 0.134342  | 0.591304 | +0.001320
20 | 0.943070 | 0.139108  | 0.938901 | -0.004169
35 | 0.983601 | 0.130535  | 0.984781 | +0.001180
++ | 0.991758 | n/a       | n/a
```

Look at that!  It's better!  Amazing!

### Back to Our Show

But I already have the new B0 and k functions, so, how bout I do it anyway?

Well, if `B = 1 - (S0 - A_L) / (A - A_L)`, and `A_L = S`, `B = 1`.  Huh.

The figures from this process aren't that appreciably different, though.

```
Average Female
------------------------------------
t  | scale    | k         | scale (back-calced)
---|----------|-----------|----------|-----------
0  | 0.205253 | ~0.135662 | 0.205253 | 0
5  | 0.594016 | 0.134342  | 0.594666 | +0.00065
20 | 0.950802 | 0.139109  | 0.946227 | -0.004575
35 | 0.991758 | 0.130537  | 0.992866 | +0.001108
++ | 1.000000 | n/a       | n/a
```

```
Average Male
------------------------------------
t  | scale    | k         | scale (back-calced)
---|----------|-----------|----------|-----------
0  | 0.205253 | ~0.135662 | 0.205253 | 0
5  | 0.589984 | 0.134342  | 0.590626 | +0.000642
20 | 0.943070 | 0.139109  | 0.938542 | -0.004528
35 | 0.983601 | 0.130537  | 0.984698 | +0.001097
++ | 0.991758 | n/a       | n/a
```

And... if I run everything in a file with A_L = 0, then I get the exact same numbers?  Weird.

I think it's notable that while A changes, k does not. (until we start dicking around with time, but we could shove that into another parameter.)




Appendix: Calc Function Definitions
-----------------------------------

Some function definitions for the `calc` program.

```calc
define B0( A, S ) = 1 - S/A
define k( t, S, B ) = (- ln( (1 - S) / B ) / t)
define k( t, S, A, B ) = (- ln( (1 - S/A) / B ) / t)
define k_A( t, S, A ) = k( t, S, B0( A, S ) )
## Functions that take into account an A_L.  Note how they are the same when A_L = 0.
define B0( A, A_L, S ) = 1 - (S - A_L) / (A - A_L)
define k( t, S, A, A_L, B ) = (- ln( (1 - (S - A_L) / (A - A_L)) / B ) / t)

define k_f( t, S ) = (- ln( (1 - S) / 0.794747 ) / t)
## A = 1, B = ~0.794747, k = ~0.135
define hyena_f( t ) = (1 - 0.794747 * exp(-0.135 * t))
define monomolecular( t, A, B, k ) = A * (1 - B * exp(-k * t))
## With A_L...
define monomolecular( t, A, A_L, B, k ) = A_L + (A - A_L) * (1 - B * exp(-k * t))


## Some niceties
obj tscale { t, scale };
define tscale( t, scale ) {
	local x;
	obj tscale x;
	x.t = t;
	x.scale = scale;
	return x;
}
```



Idly...

- `S = A[L] + (A - A[L]) * (1 - B * e^(-k * t))`
- `let E = (1 - B * e^(-k * t))`
- `S = A[L] + (A - A[L]) * E`
- `S = A[L] + A * E - A[L] * E`
- `S - A * E = A[L] - A[L] * E`
- `S - A * E = A[L] * (1 - E)`
- `(S - A * E) / (1 - E) = A[L]`
- `A[L] = (S - A * E) / (1 - E)`

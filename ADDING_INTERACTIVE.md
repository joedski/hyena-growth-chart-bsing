Adding Interactive Things
=========================

This is going to be a bodge job because I'm lazy and it seems like it's easier to add extra handles outside of nv than it does in it.  (it probably isn't.)

We need to know a few things first:
- The drawing bounds of the displayed graphs, not counting the axes.
- The value ranges displayed within those bounds.



Gathering the Data
------------------

### Drawing Bounds

These are easy to get, thankfully.

```js
let selChartCanvas = () => d3.select( '#my-chart' );
let chartSize = () => ({
	width: parseFloat( selChartCanvas().style( 'width' ) ),
	height: parseFloat( selChartCanvas().style( 'height' ) ),
});

// ...

let size = chartSize();
let margin = { ...chart.margin() };

let drawingBounds = {
	x: margin.left,
	y: margin.top,
	width: size.width - margin.left - margin.right,
	height: size.height - margin.top - margin.bottom,
};

drawingBounds.x2 = drawingBounds.x + drawingBounds.width;
drawingBounds.y2 = drawingBounds.y + drawingBounds.height;
```

### Value Ranges

This one can't be gotten straight from the nv chart, alas, though we do have all the data necessary to find these.

By default, nv charts find the minimum and maximum of each axis and scale the graphics to fit that, filling the screen with the data as much as possible.  This means we can do a similar process to find these on our own.  Duplicated work but oh well.

You can also force nv charts to show certain ranges or points, which you have to specify yourself, which means you already know that info.

This means you can do something like this:

```js
// The graphed view must include at least this yRange.
let yRangeForce = [ 0, 1.5 ];
let data = whatever();

//...
let yRange = d3.extent( yRangeForce );
let yRangeFromData = d3.extent( data, d => d.value );
let yRangeActual = [
	Math.min( yRange[ 0 ], yRangeFromData[ 0 ] ),
	Math.max( yRange[ 1 ], yRangeFromData[ 1 ] ),
];
```

The x values for my case are even simpler, because I already have a known time span.

```js
let xRangeActual = [
	0, // birth
	TIME_SPAN, // last value we care about.
];
```

### In Total

Now that we have the ranges, we can use d3's scales to set up the value conversions.

```js
let xValueToPixel = d3.scale.linear()
	.range( xRangeActual )
	.domain([ drawingBounds.x, drawingBounds.x2 ])
	;

// We range the graph y values from the bottom, but svg is in screen coords, so we have to invert the direction.
let yValueToPixel = d3.scale.linear()
	.range( yRangeActual )
	.domain([ drawingBounds.y2, drawingBounds.y ])
	;
```



Handles
-------

Now that we have our scalers, we can easily convert from data coords to canvas coords and back.

We want two handles per hyena: the "grown up" one (sexual maturity is reached at 3 years old in normal hyenas) and the "birth size" one, which is the average natural birth size (Note: c-section would technically not affect this since that's usually used to extract a baby prematurely.  In Shana's case, however, it was done close to natural birth to lessen discomfort.  I assume the natural bacterial cultures were added back in since someone no doubt came from the future where that's been well studied.)

Now, we can place the "grown up" handle on the graph if we want to, but actually a far more useful value is the full growth asypmtote A, so the handle will actually be there.  Fortunately, at 36 months, a normal hyena's just about there.

Anyway, with the scalers, this is a cinch.

```js
let T_MATURE = 36;
let handleMaturePosOf = dataSet => ({
	x: xValueToPixel( T_MATURE ),
	y: yValueToPixel( dataSet.A ),
});
```

Although, more likely, we'll have this:

```js
let handleParameters = handlePos => ({
	t: xValueToPixel.invert( handlePos.x ),
	A: xValueToPixel.invert( handlePos.y ),
});
```

Actually, we'll probably use both.  Former to initially position the handle, the latter to propagate the edits back to the data proper.

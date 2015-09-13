$(document).ready(function(){

	$.getJSON("data/timelineData.json")
	.done(function(timelineData){
		var lanes = timelineData.lanes,
			laneLength = lanes.length,
			items = timelineData.items,
			timeBegin = timelineData.timeBegin,
			timeEnd = timelineData.timeEnd;

		var m = {"top":20, "right":15, "bottom":15, "left":120}, //margins
			w = 960 - m.right - m.left, //width
			h = 500 - m.top - m.bottom,
			miniHeight = laneLength * 12 + 50,
			mainHeight = h - miniHeight - 50;

		//scales
		var x = d3.scale.linear()
				.domain([timeBegin, timeEnd+100])
				.range([0, w]);
		var x1 = d3.scale.linear()
				.range([0, w]);
		var y1 = d3.scale.linear()
				.domain([0, laneLength])
				.range([0, mainHeight]);
		var y2 = d3.scale.linear()
				.domain([0, laneLength])
				.range([0, miniHeight]);

		var chart = d3.select("#timeline")
					.append("svg")
					.attr("width", w + m.right
		 + m.left)
					.attr("height", h + m.top + m.bottom)
					.attr("class", "chart");

		chart.append("defs").append("clipPath")
			.attr("id", "clip")
			.append("rect")
			.attr("width", w)
			.attr("height", mainHeight);

		var main = chart.append("g")
					.attr("transform", "translate(" + m.left + "," + m.top + ")")
					.attr("width", w)
					.attr("height", mainHeight)
					.attr("class", "main");

		var mini = chart.append("g")
					.attr("transform", "translate(" + m.left + "," + (mainHeight + m.top) + ")")
					.attr("width", w)
					.attr("height", miniHeight)
					.attr("class", "mini");

		//main lanes and texts
		main.append("g").selectAll(".laneLines")
			.data(items)
			.enter().append("line")
			.attr("x1", m.right
	)
			.attr("y1", function(d) {return y1(d.lane);})
			.attr("x2", w)
			.attr("y2", function(d) {return y1(d.lane);})
			.attr("stroke", "lightgray")

		main.append("g").selectAll(".laneText")
			.data(lanes)
			.enter().append("text")
			.text(function(d) {return d;})
			.attr("x", -m.right
	)
			.attr("y", function(d, i) {return y1(i + .5);})
			.attr("dy", ".5ex")
			.attr("text-anchor", "end")
			.attr("class", "laneText");

		//mini lanes and texts
		mini.append("g").selectAll(".laneLines")
			.data(items)
			.enter().append("line")
			.attr("x1", m.right
	)
			.attr("y1", function(d) {return y2(d.lane);})
			.attr("x2", w)
			.attr("y2", function(d) {return y2(d.lane);})
			.attr("stroke", "lightgray");

		mini.append("g").selectAll(".laneText")
			.data(lanes)
			.enter().append("text")
			.text(function(d) {return d;})
			.attr("x", -m.right
	)
			.attr("y", function(d, i) {return y2(i + .5);})
			.attr("dy", ".5ex")
			.attr("text-anchor", "end")
			.attr("class", "laneText");

		var itemRects = main.append("g")
							.attr("clip-path", "url(#clip)");

		//mini item rects
		mini.append("g").selectAll("miniItems")
			.data(items)
			.enter().append("rect")
			.attr("class", function(d) {return "miniItem" + d.lane;})
			.attr("x", function(d) {return x(d.start);})
			.attr("y", function(d) {return y2(d.lane + .5) - 5;})
			.attr("width", function(d) {return x(d.end - d.start);})
			.attr("height", 10);

		//mini labels
		mini.append("g").selectAll(".miniLabels")
			.data(items)
			.enter().append("text")
			.text(function(d) {return d.id;})
			.attr("x", function(d) {return x(d.start);})
			.attr("y", function(d) {return y2(d.lane + .5);})
			.attr("dy", ".5ex");

		//brush
		brush = d3.svg.brush()
							.x(x)
							.on("brush", display);

		mini.append("g")
			.attr("class", "x brush")
			.call(brush)
			.selectAll("rect")
			.attr("y", 1)
			.attr("height", miniHeight - 1);

		display();

		function display() {
			var rects, labels,
				minExtent = brush.extent()[0],
				maxExtent = brush.extent()[1],
				visItems = items.filter(function(d) {return d.start < maxExtent && d.end > minExtent;});

			mini.select(".brush")
				.call(brush.extent([minExtent, maxExtent]));

			x1.domain([minExtent, maxExtent]);

			//update main item rects
			rects = itemRects.selectAll("rect")
			        .data(visItems, function(d) { return d.id; })
				.attr("x", function(d) {return x1(d.start);})
				.attr("width", function(d) {return x1(d.end) - x1(d.start);});
			
			rects.enter().append("rect")
				.attr("class", function(d) {return "miniItem" + d.lane;})
				.attr("x", function(d) {return x1(d.start);})
				.attr("y", function(d) {return y1(d.lane)+2;})
				.attr("width", function(d) {return x1(d.end) - x1(d.start);})
				.attr("height", function(d) {return .8 * y1(1);});

			rects.exit().remove();

			//update the item labels
			labels = itemRects.selectAll("text")
				.data(visItems, function (d) { return d.id; })
				.attr("x", function(d) {return x1(Math.max(d.start, minExtent) + 2);});

			labels.enter().append("text")
				.text(function(d) {return d.id;})
				.attr("x", function(d) {return x1(Math.max(d.start, minExtent));})
				.attr("y", function(d) {return y1(d.lane + .5)+2;})
				.attr("text-anchor", "start");

			labels.exit().remove();

		}
		
	})
	.error(function(error){
		console.log("ERROR!! " + error.statusText);
	});




});
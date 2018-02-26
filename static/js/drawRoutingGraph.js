// JS file containing code for generating confluent drawings

// global variables
var svgRoute,
    widthRoute,
    heightRoute,
    simulationRoute;

function setUpSVG_routingGraph() {
    svgRoute = d3.select("#routingGraph");
    widthRoute = +svgRoute.attr("width");
    heightRoute = +svgRoute.attr("height");

    simulationRoute = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) { return d.id; }))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(widthRoute / 2, heightRoute / 2));
}

function genRoutingGraph(graph) {

    // set Up SVG
    setUpSVG_routingGraph();
    // Get the routing graph from the module data
    var routingGraph = graphToRoutingGraph(graph)
    drawRoutingGraph(routingGraph);
}


function drawRoutingGraph(graph) {
    // draw the routing graph
    var line = d3.radialLine()
        .curve(d3.curveBundle.beta(0.85))
        .radius(function (d) { return d.y; })
        .angle(function (d) { return d.x });

    var link = svgRoute.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line");

    var node = svgRoute.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("fill", function (d) { return d.isRouting ? "#7EC0EE" : "#333333" })
        .attr("r", 4.5)
        .call(d3.drag()
            .on("start", dragstartedRoute)
            .on("drag", draggedRoute)
            .on("end", dragendedRoute));

    node.append("title")
        .text(function (d) { return d.id; });

    simulationRoute
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulationRoute.force("link")
        .links(graph.links);

    function ticked() {
        link
            .attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

        node
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; });
    }
}

function dragstartedRoute(d) {
    if (!d3.event.active) simulationRoute.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function draggedRoute(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragendedRoute(d) {
    if (!d3.event.active) simulationRoute.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

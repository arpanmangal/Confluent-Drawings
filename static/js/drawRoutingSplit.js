// JS file containing code for generating confluent drawings

var svgRouteSplit,
    widthRouteSplit,
    heightRouteSplit,
    simulationRouteSplit;

function setUp_svgRouteSplit() {
    svgRouteSplit = d3.select("#routingGraphSplit");
    widthRouteSplit = +svgRouteSplit.attr("width");
    heightRouteSplit = +svgRouteSplit.attr("height");

    simulationRouteSplit = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) { return d.id; }))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(widthRouteSplit / 2, heightRouteSplit / 2));
}

function genRoutingGraphSplit(graph) {
    // set up the svg
    setUp_svgRouteSplit();

    // Get the routing graph from the module data
    var routingGraphSplit = graphToRoutingGraphSplit(graph);
    drawRoutingGraphSplit(routingGraphSplit);
}

function graphToRoutingGraphSplit2(graph, cb) {
    var routingGraph = {};

    // Push the nodes
    routingGraph.nodes = graph.nodes;
    // mark each node as not routingNode
    routingGraph.nodes.forEach(function (elem) {
        elem.isRouting = false;
    });

    graph.PGmodules.forEach(function (elem) {
        routingGraph.nodes.push({
            "id": elem.id,
            "isRouting": true
        }); // Each module is a routing node
    });

    // Push the edges
    routingGraph.links = graph.PGlinks;
    graph.PGmodules.forEach(function (elem) {
        var elemNodes = elem.elements.nodes;
        var elemModules = elem.elements.modules;

        // Edges from current module to child nodes
        elemNodes.forEach(function (e) {
            routingGraph.links.push({
                "source": elem.id,
                "target": e
            });
        });

        // Edges from current module to child modules
        elemModules.forEach(function (e) {
            routingGraph.links.push({
                "source": elem.id,
                "target": e
            });
        });

    });

    // everything done
    cb(routingGraph);
}

function genRoutingGraphSplitted(PGmodules, PGlinks) {
    var nodes = graph.nodes;
    var links = graph.links;

    // generate the total number of edges
    var edges = [];
}

function drawRoutingGraphSplit(graph) {
    // draw the routing graph
    var line = d3.radialLine()
        .curve(d3.curveBundle.beta(0.85))
        .radius(function (d) { return d.y; })
        .angle(function (d) { return d.x });

    var link = svgRouteSplit.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line");

    var node = svgRouteSplit.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("fill", function (d) { return d.isRouting ? "#7EC0EE" : "#333333" })
        .attr("r", 4.5)
        .call(d3.drag()
            .on("start", dragstartedRouteSplit)
            .on("drag", draggedRouteSplit)
            .on("end", dragendedRouteSplit));

    node.append("title")
        .text(function (d) { return d.id; });

    simulationRouteSplit
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulationRouteSplit.force("link")
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

function dragstartedRouteSplit(d) {
    if (!d3.event.active) simulationRouteSplit.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function draggedRouteSplit(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragendedRouteSplit(d) {
    if (!d3.event.active) simulationRouteSplit.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

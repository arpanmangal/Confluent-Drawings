// This file contains functions for making the routing graph

function graphToRoutingGraph(graph, cb) {
    var routingGraph = {};
    routingGraph.actualLinks = graph.links;

    // Push the nodes
    routingGraph.nodes = graph.nodes;
    // mark each node as not routingNode
    routingGraph.nodes.forEach(function (elem) {
        elem.isRouting = false;
    });
    // console.log(graph.modules);

    graph.PGmodules.forEach(function (elem) {
        routingGraph.nodes.push({
            "id": elem.id,
            "isRouting": true
        }); // Each module is a routing node
    });

    // Push the edges
    routingGraph.links = graph.PGlinks;
    graph.PGmodules.forEach(function (elem) {
        // console.log(elem);
        var elemNodes = elem.elements.nodes;
        var elemModules = elem.elements.modules;

        // console.log(elemNodes);
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

    var reverseEdges = [];
    routingGraph.links.forEach (function (link) {
        reverseEdges.push({
            "source": link.source,
            "target": link.target
        });
    });
    reverseEdges.forEach (function (edge) {
        routingGraph.links.push(edge);
    });

    // routingGraph.links.push({
    //     "source": "ran",
    //     "target": "na"
    // })
    // everything done
    return routingGraph;
}

function graphToRoutingGraphSplit(graph) {
    var PGmodules = graph.PGmodules; // PG Modules
    var PGlinks = graph.PGlinks; // PG edges
    var graphNodes = graph.nodes; // Actual nodes
    var graphLinks = graph.links; // Actual links

    var Nodes = {};

    // Add the routing nodes
    PGmodules.forEach(function (module) {

        if (!Nodes[module.id]) {
            Nodes[module.id] = {
                "isRouting": true,
                "internal": {},
                "external": {}
            };
        }

        var elemNodes = module.elements.nodes;
        var elemModules = module.elements.modules;

        // Edges from current module to child nodes
        elemNodes.forEach(function (e) {
            Nodes[module.id].internal[e] = 1;
        });

        // Edges from current module to child modules
        elemModules.forEach(function (e) {
            Nodes[module.id].internal[e] = 1;
            if (!Nodes[e]) Nodes[e] = {
                "isRouting": true,
                "internal": {},
                "external": {}
            };
            Nodes[e].external[module.id] = 1;
            console.log ("adding ext edge between " + e + " and " + module.id);
        });

        // console.log (obj);

        // Nodes[module.id] = obj;
    });

    // Add the actual nodes
    graphNodes.forEach(function (node) {
        Nodes[node.id] = {
            "isRouting": false,
            "internal": {},
            "external": {}
        };
    })

    // Computing external links
    PGlinks.forEach(function (link) {
        (Nodes[link.source].external)[link.target] = 1;
        (Nodes[link.target].external)[link.source] = 1;
    })

    // Split the routing nodes having internal >= 2 and external >= 2
    var splitedNodes = {};
    var splitedLinks = [];

    console.log (Nodes);
    for (var id in Nodes) {
        var node = Nodes[id];

        if (!node.isRouting) {
            // not a routing node
            var targets = Object.keys(node.external);
            targets.forEach(function (target) {
                splitedLinks.push({
                    "source": id,
                    "target": target
                });
            });

            splitedNodes[id] = 1;
        } else {
            // a routing node
            var internalNodes = Object.keys(node.internal);
            var externalNodes = Object.keys(node.external);

            // if both >= 2 then split the node
            if (internalNodes.length >= 2 && externalNodes.length >= 2) {
                console.log("splitting " + id);

                // split it
                var node1 = {
                    "id": id + "#1"
                };
                var node2 = {
                    "id": id + "#2"
                };

                // push the nodes
                splitedNodes[node1.id] = 2;
                splitedNodes[node2.id] = 2;

                // add the edges
                internalNodes.forEach(function (target) {
                    splitedLinks.push({
                        "source": node1.id,
                        "target": target
                    });
                });

                externalNodes.forEach(function (target) {
                    splitedLinks.push({
                        "source": node2.id,
                        "target": target
                    })
                });

                splitedLinks.push({
                    "source": node1.id,
                    "target": node2.id
                })
            } else {
                // no splitting required
                // push the nodes
                splitedNodes[id] = 2;

                // add the edges
                internalNodes.forEach(function (target) {
                    splitedLinks.push({
                        "source": id,
                        "target": target
                    });
                });

                externalNodes.forEach(function (target) {
                    splitedLinks.push({
                        "source": id,
                        "target": target
                    })
                });

            }
        }
    }

    // done analysing the nodes
    // clean edges
    var newLinks = [];
    splitedLinks.forEach (function (link) {
        if (splitedNodes[link.target]) {
            // valid link => add it to the links array
            newLinks.push(link);
        }
    });
    
    var nodeArr =[];//= Object.keys(splitedNodes);
    // // console.log (nodeArr);
    // var nodeObjArr = [];
    // nodeArr.forEach (function (node) {
    //     nodeObjArr.push({"id": node, "isRouting": Nodes ()})
    // });
    console.log(splitedNodes);
    for (var id in splitedNodes) {
        nodeArr.push({
            "id": id,
            "isRouting": (splitedNodes[id] == 2)
        });
    }

    var splitedGraph = {
        "nodes": nodeArr,
        "links": newLinks,
        "actualLinks": graphLinks
    };
    console.log(splitedGraph);
    // cb(splitedGraph);
    return splitedGraph;
}
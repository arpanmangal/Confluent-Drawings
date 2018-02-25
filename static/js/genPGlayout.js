var moduleData = {
    "PGmodules": null,
    "PGlinks": null
};

function getPGlayout(pathToJsonFile, powergraphgridlayout) {
    var colans = cola;
    function powerGraph2() {
        var d3cola = colans.d3adaptor();//.jaccardLinkLengths(10, 0.5).avoidOverlaps(true);//.size([width, height]);
        // var svg = makeSVG();
        d3.json(pathToJsonFile, function (error, graph) {
            var powerGraph;
            d3cola.nodes(graph.nodes).links(graph.links).powerGraphGroups(function (d) {
                powerGraph = d;
                // powerGraph.groups.forEach(function (v) {
                //     v.padding = 20;
                // });
            }).start(10, 10, 10);
            // var group = svg.selectAll(".group").data(powerGraph.groups).enter().append("rect").attr("rx", 8).attr("ry", 8).attr("class", "group").style("fill", function (d, i) {
            //     return color(i);
            // });
            console.log(powerGraph);
            // Get PG Modules
            var modules = [];
            powerGraph.groups.forEach(function (group) {
                // group is an object

                // add the current module
                modules.push({
                    "id": "Group" + group.id,
                    "elements": {
                        "nodes": [],
                        "modules": []
                    }
                });

                // add the child nodes
                if (group.leaves) {
                    group.leaves.forEach(function (leaf) {
                        modules[modules.length - 1].elements.nodes.push("" + leaf.name);
                    });
                }

                // add the child modules
                // console.log(group);
                if (group.groups) {
                    group.groups.forEach(function (childGrp) {
                        modules[modules.length - 1].elements.modules.push("Group" + childGrp.id);
                    });
                };
            });

            // console.log(modules);
            moduleData.PGmodules = modules;


            // Get PG Links
            var PGlinks = [];
            powerGraph.powerEdges.forEach(function (Pedge) {
                // add the power edge to PGlinks
                PGlinks.push({
                    "source": Pedge.source.name || ("Group" + Pedge.source.id),
                    "target": Pedge.target.name || ("Group" + Pedge.target.id)
                });
            });

            // console.log(PGlinks);
            moduleData.PGlinks = PGlinks;
        });

        d3.json(pathToJsonFile, function (error, graph) {
            // add nodes and links
            moduleData["nodes"] = [];
            moduleData["links"] = graph.links;
            graph.nodes.forEach(function (node) {
                moduleData.nodes.push({
                    "id": node.name
                });
            });
        });
    }
    powerGraph2();

    // console.log(powergraphgridlayout);
    // console.log(iter++);

    // console.log(powerGraph.groups);
    // function getGroupts
};

//# sourceMappingURL=powergraphgridlayout.js.map
console.log('hi');
// setTimeout(() => {
//     console.log(moduleData);
//     d3.json("graphdata/n7e23.json", function (error, graph) {
//         if (error) throw error;

//         console.log(graph);
//     });
// }, 3000);

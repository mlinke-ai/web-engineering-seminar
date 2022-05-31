var width = 1900;
var height = 1900;
var dot_size = 3;
var dot_color = "#9ecae1";

var embarkment = {
    S: "Southampton",
    C: "Cherbourg",
    Q: "Queenstown",
}

var fares = {};
var ages = {};

var canvas = d3.select("#canvas")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
var bubble_chart = canvas.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var histogram = d3.select("#histogram")
    .append("svg")
    .attr("width", width)
    .attr("height", 500)

var size_age_scale = d3.scaleLinear().domain([0, 80]).range([0, 15]);
var size_fare_scale = d3.scaleLinear().domain([0, 512]).range([0, 15]);

var x_embarked_scale = d3.scalePoint().domain(["S", "C", "Q"]).range([-(width / 2) + 100, (width / 2) - 100]);
var x_parch_scale = d3.scaleLinear().domain([0, 6]).range([-(width / 2) + 100, (width / 2) - 100]);
var x_pclass_scale = d3.scaleLinear().domain([1, 3]).range([-(width / 2) + 100, (width / 2) - 100]);
var x_sex_scale = d3.scalePoint().domain(["male", "female"]).range([-(width / 2) + 100, (width / 2) - 100]);
var x_sibsp_scale = d3.scaleLinear().domain([0, 8]).range([-(width / 2) + 100, (width / 2) - 100]);
var x_survived_scale = d3.scalePoint().domain([true, false]).range([-(width / 2) + 100, (width / 2) - 100]);

var y_embarked_scale = d3.scalePoint().domain(["S", "C", "Q"]).range([-(height / 2) + 100, (height / 2) - 100]);
var y_parch_scale = d3.scaleLinear().domain([0, 6]).range([-(height / 2) + 100, (height / 2) - 100]);
var y_pclass_scale = d3.scaleLinear().domain([1, 3]).range([-(height / 2) + 100, (height / 2) - 100]);
var y_sex_scale = d3.scalePoint().domain(["male", "female"]).range([-(height / 2) + 100, (height / 2) - 100]);
var y_sibsp_scale = d3.scaleLinear().domain([0, 8]).range([-(height / 2) + 100, (height / 2) - 100]);
var y_survived_scale = d3.scalePoint().domain([true, false]).range([-(height / 2) + 100, (height / 2) - 100]);

var color_age_scale = d3.scaleSequential(d3.interpolateRdYlGn).domain([0, 80]);
var color_embarked_scale = d3.scaleQuantize().domain(["S", "C", "Q"]).range(["#1676b6", "#ff7f00", "#24a222"]);
var color_fare_scale = d3.scaleSequential(d3.interpolateRdYlGn).domain([0, 512]);
var color_parch_scale = d3.scaleQuantize(d3.schemeDark2).domain([0, 6]);
var color_pclass_scale = d3.scaleQuantize(d3.schemeDark2).domain([1, 3]);
var color_sex_scale = d3.scaleOrdinal().domain(["male", "female"]).range(["#377eb8", "#e41a1c"]);
var color_sibsp_scale = d3.scaleQuantize(d3.schemeDark2).domain([0, 8]);
var color_survived_scale = d3.scaleOrdinal().domain([true, false]).range(["#377eb8", "#e41a1c"]);

var x_force = d3.forceX(function (d) {
    return 0
}).strength(function (d) {
    return 0.05
});

var x_force_embarked = d3.forceX(function (d) {
    return x_embarked_scale(d.Embarked)
}).strength(function (d) {
    return 0.05
});

var x_force_parch = d3.forceX(function (d) {
    return x_parch_scale(d.Parch)
}).strength(function (d) {
    return 0.05
});

var x_force_pclass = d3.forceX(function (d) {
    return x_pclass_scale(d.Pclass)
}).strength(function (d) {
    return 0.05
});

var x_force_sex = d3.forceX(function (d) {
    return x_sex_scale(d.Sex)
}).strength(function (d) {
    return 0.05
});

var x_force_sibsp = d3.forceX(function (d) {
    return x_sibsp_scale(d.SibSp)
}).strength(function (d) {
    return 0.05
});

var x_force_survived = d3.forceX(function (d) {
    return x_survived_scale(d.Survived)
}).strength(function (d) {
    return 0.05
});

var y_force = d3.forceY(function (d) {
    return 0
}).strength(function (d) {
    return 0.05
});

var y_force_embarked = d3.forceY(function (d) {
    return y_embarked_scale(d.Embarked)
}).strength(function (d) {
    return 0.05
});

var y_force_parch = d3.forceY(function (d) {
    return y_parch_scale(d.Parch)
}).strength(function (d) {
    return 0.05
});

var y_force_pclass = d3.forceY(function (d) {
    return y_pclass_scale(d.Pclass)
}).strength(function (d) {
    return 0.05
});

var y_force_sipsb = d3.forceY(function (d) {
    return y_sibsp_scale(d.SibSp)
}).strength(function (d) {
    return 0.05
});

var y_force_sex = d3.forceY(function (d) {
    return y_sex_scale(d.Sex)
}).strength(function (d) {
    return 0.05
});

var y_force_survived = d3.forceY(function (d) {
    return y_survived_scale(d.Survived)
}).strength(function (d) {
    return 0.05
});

var collide_force = d3.forceCollide(function (d) {
    return dot_size + 1
}).strength(0.9)
    .iterations(2);

var collide_force_fare = d3.forceCollide(function (d) {
    return size_fare_scale(d.Fare) + 1
}).strength(0.9)
    .iterations(2);

var collide_force_age = d3.forceCollide(function (d) {
    return size_age_scale(d.Age) + 1
}).strength(0.9)
    .iterations(2);

var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", "0");

var simulation = d3.forceSimulation()
    .force("x_force", x_force)
    .force("y_force", y_force)
    .force("collide", collide_force);

d3.csv("dataset/titanic.csv", function (datapoint) {
    datapoint.Age = parseFloat(datapoint.Age);
    // datapoint.Cabin = datapoint.Cabin;
    // datapoint.Embarked = datapoint.Embarked;
    datapoint.Fare = parseFloat(datapoint.Fare);
    datapoint.FirstName = datapoint.Name.split(", ")[1];
    datapoint.LastName = datapoint.Name.split(", ")[0];
    // datapoint.Name = datapoint.Name
    datapoint.PassengerId = parseInt(datapoint.PassengerId);
    datapoint.Parch = parseInt(datapoint.Parch);
    datapoint.Pclass = parseInt(datapoint.Pclass);
    // datapoint.Sex = datapoint.Sex;
    datapoint.SibSp = parseInt(datapoint.SibSp);
    datapoint.Survived = parseInt(datapoint.Survived) == 1;
    // datapoint.Ticket = datapoint.Ticket;
    if (datapoint.Age !== datapoint.Age) { } else {
        if (ages[parseInt(datapoint.Age)]) {
            ages[parseInt(datapoint.Age)] += 1;
        } else {
            ages[parseInt(datapoint.Age)] = 1;
        }
    }
    if (datapoint.Fare !== datapoint.Fare) { } else {
        if (fares[parseInt(datapoint.Fare)]) {
            fares[parseInt(datapoint.Fare)] += 1;
        } else {
            fares[parseInt(datapoint.Fare)] = 1;
        }
    }
    return datapoint;
}).then(function (dataset) {
    var circles = bubble_chart.selectAll(".passenger")
        .data(dataset)
        .enter()
        .append("circle")
        .text(function (d) { return d.PassengerId })
        .attr("class", "passenger")
        .attr("r", dot_size)
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("fill", dot_color)
        .on("mouseover", function (e, d) {
            tooltip.transition()
                .duration(100)
                .style("opacity", 1);
        })
        .on("mousemove", function (e, d) {
            tooltip.html("Passenger ID: " + d.PassengerId +
                "<br>Name: " + d.FirstName + " " + d.LastName +
                "<br>Sex: " + d.Sex +
                "<br>Age: " + d.Age +
                "<br>Cabin: " + d.Cabin +
                "<br>Embarked: " + embarkment[d.Embarked] +
                "<br>Fare: " + d.Fare +
                "<br>Number of Parents / Children: " + d.Parch +
                "<br>Number of Siblings / Spouses: " + d.SibSp +
                "<br>Survived: " + d.Survived +
                "<br>Ticket: " + d.Ticket)
                .style("top", (e.y - 10) + "px")
                .style("left", (e.x + 10) + "px");
        })
        .on("mouseout", function (e, d) {
            tooltip.transition()
                .duration(100)
                .style("opacity", 0);
        });
    d3.select("#x_group_select").on("change", function (v) {
        if (v.target.value === "none") {
            canvas.selectAll(".x_axis").remove();
            simulation.force("x_force", x_force)
                .alpha(1)
                .restart();
        } else if (v.target.value === "embarked") {
            canvas.selectAll(".x_axis").remove();
            canvas.append("g")
                .attr("class", "x_axis")
                .attr("transform", "translate(" + width / 2 + "," + (height - 20) + ")")
                .call(d3.axisBottom().scale(x_embarked_scale).tickFormat(function (d) { return embarkment[d] }));
            simulation.force("x_force", x_force_embarked)
                .alpha(1)
                .restart();
        } else if (v.target.value === "parch") {
            canvas.selectAll(".x_axis").remove();
            canvas.append("g")
                .attr("class", "x_axis")
                .attr("transform", "translate(" + width / 2 + "," + (height - 20) + ")")
                .call(d3.axisBottom().scale(x_parch_scale));
            simulation.force("x_force", x_force_parch)
                .alpha(1)
                .restart();
        } else if (v.target.value === "pclass") {
            canvas.selectAll(".x_axis").remove();
            canvas.append("g")
                .attr("class", "x_axis")
                .attr("transform", "translate(" + width / 2 + "," + (height - 20) + ")")
                .call(d3.axisBottom().scale(x_pclass_scale));
            simulation.force("x_force", x_force_pclass)
                .alpha(1)
                .restart();
        } else if (v.target.value === "sibsp") {
            canvas.selectAll(".x_axis").remove();
            canvas.append("g")
                .attr("class", "x_axis")
                .attr("transform", "translate(" + width / 2 + "," + (height - 20) + ")")
                .call(d3.axisBottom().scale(x_sibsp_scale));
            simulation.force("x_force", x_force_sibsp)
                .alpha(1)
                .restart();
        } else if (v.target.value === "sex") {
            canvas.selectAll(".x_axis").remove();
            canvas.append("g")
                .attr("class", "x_axis")
                .attr("transform", "translate(" + width / 2 + "," + (height - 20) + ")")
                .call(d3.axisBottom().scale(x_sex_scale));
            simulation.force("x_force", x_force_sex)
                .alpha(1)
                .restart();
        } else if (v.target.value === "survived") {
            canvas.selectAll(".x_axis").remove();
            canvas.append("g")
                .attr("class", "x_axis")
                .attr("transform", "translate(" + width / 2 + "," + (height - 20) + ")")
                .call(d3.axisBottom().scale(x_survived_scale));
            simulation.force("x_force", x_force_survived)
                .alpha(1)
                .restart();
        } else {
            console.error("Unknown value of x_group_select!");
            canvas.selectAll(".x_axis").remove();
            simulation.force("x_force", x_force)
                .alpha(1)
                .restart();
        }
    });
    d3.select("#y_group_select").on("change", function (v) {
        if (v.target.value === "none") {
            canvas.selectAll(".y_axis").remove();
            simulation.force("y_force", y_force)
                .alpha(1)
                .restart();
        } else if (v.target.value === "embarked") {
            canvas.selectAll(".y_axis").remove();
            canvas.append("g")
                .attr("class", "y_axis")
                .attr("transform", "translate(" + (width - 100) + "," + height / 2 + ")")
                .call(d3.axisRight().scale(y_embarked_scale).tickFormat(function (d) { return embarkment[d] }));
            simulation.force("y_force", y_force_embarked)
                .alpha(1)
                .restart();
        } else if (v.target.value === "parch") {
            canvas.selectAll(".y_axis").remove();
            canvas.append("g")
                .attr("class", "y_axis")
                .attr("transform", "translate(" + (width - 100) + "," + height / 2 + ")")
                .call(d3.axisRight().scale(y_parch_scale));
            simulation.force("y_force", y_force_parch)
                .alpha(1)
                .restart();
        } else if (v.target.value === "pclass") {
            canvas.selectAll(".y_axis").remove();
            canvas.append("g")
                .attr("class", "y_axis")
                .attr("transform", "translate(" + (width - 100) + "," + height / 2 + ")")
                .call(d3.axisRight().scale(y_pclass_scale));
            simulation.force("y_force", y_force_pclass)
                .alpha(1)
                .restart();
        } else if (v.target.value === "sibsp") {
            canvas.selectAll(".y_axis").remove();
            canvas.append("g")
                .attr("class", "y_axis")
                .attr("transform", "translate(" + (width - 100) + "," + height / 2 + ")")
                .call(d3.axisRight().scale(y_sibsp_scale));
            simulation.force("y_force", y_force_sipsb)
                .alpha(1)
                .restart();
        } else if (v.target.value === "sex") {
            canvas.selectAll(".y_axis").remove();
            canvas.append("g")
                .attr("class", "y_axis")
                .attr("transform", "translate(" + (width - 100) + "," + height / 2 + ")")
                .call(d3.axisRight().scale(y_sex_scale));
            simulation.force("y_force", y_force_sex)
                .alpha(1)
                .restart();
        } else if (v.target.value === "survived") {
            canvas.selectAll(".y_axis").remove();
            canvas.append("g")
                .attr("class", "y_axis")
                .attr("transform", "translate(" + (width - 100) + "," + height / 2 + ")")
                .call(d3.axisRight().scale(y_survived_scale));
            simulation.force("y_force", y_force_survived)
                .alpha(1)
                .restart();
        } else {
            console.error("Unknown value of y_group_select!");
            canvas.selectAll(".y_axis").remove();
            simulation.force("y_force", y_force)
                .alpha(1)
                .restart();
        }
    })
    d3.select("#size_select").on("change", function (v) {
        if (v.target.value === "none") {
            circles.attr("r", dot_size);
            simulation.force("collide", collide_force)
                .alpha(1)
                .restart();
        } else if (v.target.value === "age") {
            circles.attr("r", function (d) { return size_age_scale(d.Age) });
            simulation.force("collide", collide_force_age)
                .alpha(1)
                .restart();
        } else if (v.target.value === "fare") {
            circles.attr("r", function (d) { return size_fare_scale(d.Fare) });
            simulation.force("collide", collide_force_fare)
                .alpha(1)
                .restart();
        } else {
            console.error("Unknown value of size_select!");
            circles.attr("r", dot_size);
            simulation.force("collide", collide_force)
                .alpha(1)
                .restart();
        }
    });
    d3.select("#color_select").on("change", function (v) {
        if (v.target.value === "none") {
            circles.attr("fill", dot_color);
        } else if (v.target.value === "age") {
            circles.attr("fill", function (d) { return color_age_scale(d.Age) });
        } else if (v.target.value == "embarked") {
            circles.attr("fill", function (d) { return color_embarked_scale(d.Embarked) });
        } else if (v.target.value === "fare") {
            circles.attr("fill", function (d) { return color_fare_scale(d.Fare) });
        } else if (v.target.value === "parch") {
            circles.attr("fill", function (d) { return color_parch_scale(d.Parch) });
        } else if (v.target.value === "pclass") {
            circles.attr("fill", function (d) { return color_pclass_scale(d.Pclass) });
        } else if (v.target.value === "sex") {
            circles.attr("fill", function (d) { return color_sex_scale(d.Sex) });
        } else if (v.target.value === "sibsp") {
            circles.attr("fill", function (d) { return color_sibsp_scale(d.SibSp) });
        } else if (v.target.value === "survived") {
            circles.attr("fill", function (d) { return color_survived_scale(d.Survived) });
        } else {
            console.error("Unknown value of color_select");
            circles.attr("fill", dot_color);
        }
    });
    d3.select("#histogram_select").on("change", function (v) {
        if (v.target.value === "none") {
            histogram.selectAll("g").remove();
        } else if (v.target.value === "age") {
            histogram.selectAll("g").remove();
            let x_bar_scale = d3.scaleLinear()
                .domain([Object.keys(ages).sort(function (a, b) { parseInt(a) - parseInt(b) })[0], Object.keys(ages).sort(function (a, b) { parseInt(a) - parseInt(b) })[Object.keys(ages).length - 1]])
                .range([0, width - 100]);
            let y_bar_scale = d3.scaleLinear().domain([0, d3.max(Object.values(ages))]).range([470, 0]);
            let x_bar_axis = histogram.append("g")
                .attr("class", "x_bar_axis")
                .attr("transform", "translate(30,480)")
                .call(d3.axisBottom(x_bar_scale));
            let y_bar_axis = histogram.append("g")
                .attr("class", "y_bar_axis")
                .attr("transform", "translate(20,0)")
                .call(d3.axisLeft(y_bar_scale));
            let bar_chart = histogram.append("g")
                .attr("class", "bar_chart")
                .attr("transform", "translate(30,0)");
            bar_chart.selectAll(".bar")
                .data(Object.keys(ages).sort(function (a, b) { parseInt(a) - parseInt(b) }))
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("fill", dot_color)
                .attr("x", function (d) { return x_bar_scale(d) })
                .attr("y", function (d) { return y_bar_scale(ages[d]) })
                .attr("width", 22)
                .attr("height", function (d) { return 470 - y_bar_scale(ages[d]) });
        } else if (v.target.value === "fare") {
            histogram.selectAll("g").remove();
            let x_bar_scale = d3.scaleLinear()
                .domain([Object.keys(fares).sort(function (a, b) { parseInt(a) - parseInt(b) })[0], Object.keys(fares).sort(function (a, b) { parseInt(a) - parseInt(b) })[Object.keys(fares).length - 1]])
                .range([0, width - 100]);
            let y_bar_scale = d3.scaleLinear().domain([0, d3.max(Object.values(fares))]).range([470, 0]);
            let x_bar_axis = histogram.append("g")
                .attr("class", "x_bar_axis")
                .attr("transform", "translate(40,480)")
                .call(d3.axisBottom(x_bar_scale));
            let y_bar_axis = histogram.append("g")
                .attr("class", "y_bar_axis")
                .attr("transform", "translate(30,0)")
                .call(d3.axisLeft(y_bar_scale));
            let bar_chart = histogram.append("g")
                .attr("class", "bar_chart")
                .attr("transform", "translate(40,0)");
            bar_chart.selectAll(".bar")
                .data(Object.keys(fares).sort(function (a, b) { parseInt(a) - parseInt(b) }))
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("fill", dot_color)
                .attr("x", function (d) { return x_bar_scale(d) })
                .attr("y", function (d) { return y_bar_scale(fares[d]) })
                .attr("width", 3)
                .attr("height", function (d) { return 470 - y_bar_scale(fares[d]) });
        } else {
            console.error("Unknown value of histogram_select");
            histogram.selectAll("g").remove();
        }
    });
    simulation.nodes(dataset).on("tick", ticked);
    function ticked() {
        circles.attr("cx", function (d) { return d.x }).attr("cy", function (d) { return d.y });
    };
});
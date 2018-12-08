// @TODO: YOUR CODE HERE!
var svgWidth = 800;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3.select("#scatter")
.append("svg")
.attr("class","svg-content")
.attr("preserveAspectRatio", "xMinYMin meet")
.attr("viewBox", "0 0 800 500");

var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);

var chosenXAxis = "poverty";
var chosenYAxis = "healthcare"

function xScale(incomeData, chosenXAxis) {
    var xLinearScale = d3. scaleLinear()
    .domain([d3.min(incomeData, d => d[chosenXAxis])*0.9,d3.max(incomeData, d => d[chosenXAxis])*1.1])
    .range([0,width]);
    return xLinearScale;
};

function yScale(incomeData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
    .domain([d3.min(incomeData, d => d[chosenYAxis])*0.9,d3.max(incomeData, d => d[chosenYAxis])*1.1])
    .range([height,0]);
    return yLinearScale;
}

function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
    return xAxis;
};

function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
    .duration(1000)
    .call(leftAxis);
    return yAxis;
};

function renderCircles(circlesGroup, newXScale, newYSCale, chosenXAxis, chosenYAxis) {
    circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYSCale(d[chosenYAxis]));
    return circlesGroup;
};

function renderText(textGroup, newXScale, newYSCale, chosenXAxis, chosenYAxis) {
    textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYSCale(d[chosenYAxis])+3);
    return textGroup;
};

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
        if (chosenXAxis === "age") {
            var xLabel = `Age: ${d[chosenXAxis]}`}
        else if (chosenXAxis === "income") {
            var xLabel = `Household Income: ${d[chosenXAxis]}`}
        else {
            var xLabel = `Poverty: ${d[chosenXAxis]}%`};
    
        if (chosenYAxis === "healthcare") {
            var yLabel = `Lacks Healthcare: ${d[chosenYAxis]}%`}
        else if (chosenYAxis === "smokes") {
            var yLabel = `Smokese: ${d[chosenYAxis]}%`}
        else {
            var yLabel = `Obesity: ${d[chosenYAxis]}%`};
        return (`${d.state}<br>${xLabel}<br>${yLabel}`);
    });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
    })
    .on("mouseout", function(data, index) {
        toolTip.hide(data);
    });

    return circlesGroup;
};

d3.csv("/assets/data/data.csv").then(function(incomeData) {
    incomeData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.smokes = +data.smokes;
        data.income = +data.income;
        data.obesity = +data.obesity;
    });

    var xLinearScale = xScale(incomeData, chosenXAxis);

    var yLinearScale = yScale(incomeData, chosenYAxis);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    var yAxis = chartGroup.append("g")
    .call(leftAxis);

    var circlesGroup = chartGroup.append("g")
    .selectAll("circle")
    .data(incomeData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r","10")
    .attr("fill", "skyBlue");

    var textGroup = chartGroup.append("g")
    .selectAll("text")
    .data(incomeData)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", (d => yLinearScale(d[chosenYAxis])+3))
    .text(d => d.abbr)
    .attr("font-size", "10px")
    .attr("font-family","sans-serif")
    .attr("text-anchor", "middle")
    .attr("fill", "white");

    var toolTipGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup)

    var yLabelsGroup = chartGroup.append("g")
    .attr("transform","rotate(-90)");

    var healthcareLabel = yLabelsGroup.append("text")
    .attr("y", 0 - margin.left + 70)
    .attr("x", 0 -(height / 2))
    .attr("value", "healthcare")
    .classed("active", true)
    .text("Lacks Healthcare (%)");

    var smokesLabel = yLabelsGroup.append("text")
    .attr("y", 0 - margin.left + 50)
    .attr("x", 0 -(height / 2))
    .attr("value", "smokes")
    .classed("inactive", true)
    .text("Smokes (%)");

    var obesityLabel = yLabelsGroup.append("text")
    .attr("y", 0 - margin.left + 30)
    .attr("x", 0 -(height / 2))
    .attr("value", "obesity")
    .classed("inactive", true)
    .text("Obese (%)");

    var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`)

    var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty")
    .classed("active", true)
    .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age")
    .classed("inactive", true)
    .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income")
    .classed("inactive", true)
    .text("Household income (Median)");


    xLabelsGroup.selectAll("text")
    .on("click", function() {
        var xValue = d3.select(this).attr("value");
        if (xValue !== chosenXAxis) {
            chosenXAxis = xValue;
            xLinearScale = xScale(incomeData, chosenXAxis);
            circlesGroup = renderCircles(circlesGroup,xLinearScale, yLinearScale, chosenXAxis,chosenYAxis);
            textGroup = renderText(textGroup,xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);
            xAxis = renderXAxes(xLinearScale, xAxis);
            toolTipGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        };

        if (chosenXAxis === "age") {
            povertyLabel
            .classed("active", false)
            .classed("inactive", true);
            ageLabel
            .classed("active", true)
            .classed("inactive", false);
            incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "income") {
            povertyLabel
            .classed("active", false)
            .classed("inactive", true);
            ageLabel
            .classed("active", false)
            .classed("inactive", true);
            incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
        else {
            povertyLabel
            .classed("active", true)
            .classed("inactive", false);
            ageLabel
            .classed("active", false)
            .classed("inactive", true);
            incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
    });

    yLabelsGroup.selectAll("text")
    .on("click", function() {
        var yValue = d3.select(this).attr("value");
        if (yValue !== chosenYAxis) {
            chosenYAxis = yValue;
            yLinearScale = yScale(incomeData, chosenYAxis);
            circlesGroup = renderCircles(circlesGroup,xLinearScale, yLinearScale, chosenXAxis,chosenYAxis);
            textGroup = renderText(textGroup,xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);
            yAxis = renderYAxes(yLinearScale, yAxis);
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        };

        if (chosenYAxis === "smokes") {
            healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
            smokesLabel
            .classed("active", true)
            .classed("inactive", false);
            obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "healthcare") {
            healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
            smokesLabel
            .classed("active", false)
            .classed("inactive", true);
            obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
            healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
            smokesLabel
            .classed("active", false)
            .classed("inactive", true);
            obesityLabel
            .classed("active", true)
            .classed("inactive", false);
        }
        
    });
});
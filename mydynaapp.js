/// Declare globals for support functions
var margin = {}
var width = 100
var height = 100
var xaxisName = ""
var yaxisName = ""
var y2axisName = ""
var tooltipTitle = ""
var Rval =0
//


/**
* This uses D3 and SVG to create a Simple, clean scatter plot
* It requires the data source to be a CSV file with column headers
* a tooltip will be shown when the mouse moves over a scatter point
* displaying some tooltip title and coordinates.  This routine
* could be further generalized by passing three or more parameters
* this routine also has some additional functionality built into it so that
* there are transitions that occur
* @param {path of csvfile} csvfile 
* @param {csv column name of first x axis} xaxisname 
* @param {csv column name of second x axis} x2axisname 
* @param {csv column name of y axis} yaxisname 
* @param {csv column name of tooltip title} tooltiptitle 
* @param {string for title name} title 
* @param {The Html element .class or #id designated in the HTML for this} htmldiv 
* @param {width in pixels of chart} cwidth 
* @param {height in pixels of chart} cheight 
* @param {String for Y axis title} yaxisTitle 
* @param {String for X axis title} xaxisTitle 
* @param {Secondary xAxis Title} x2axisTitle
* @param {top margin number in pixels} tm 
* @param {right margin number in pixels} rm 
* @param {bottom margin number in pixels} bm 
* @param {left margin number in pixels} lm 
*/
function DynamicScatter(csvfile, xaxisname, x2axisname, yaxisname, tagname, tooltiptitle, title, htmldiv, cwidth, cheight, yaxisTitle, xaxisTitle, x2axisTitle, tm, rm, bm, lm) {

  var svgWidth = cwidth;
  var svgHeight = cheight;
  xaxisName = xaxisname //note case difference
  yaxisName = yaxisname
  x2axisName = x2axisname
  tooltipTitle = tooltiptitle
  tagName = tagname
  margin = {
    top: tm,
    right: rm,
    bottom: bm,
    left: lm
  };

  width = svgWidth - margin.left - margin.right;
  height = svgHeight - margin.top - margin.bottom;

  // Create an SVG wrapper, append an SVG group that will hold our chart,
  // and shift the latter by left and top margins.
  var svg = d3
    .select(htmldiv)
    .html("")
    .append("svg")
    .attr("id", "SVG_Main_Chart")

    .attr("width", svgWidth)
    .attr("height", svgHeight);
  // .attr("fill", "brown")
  // .attr("opacity", ".7");
  // Append to within the SVG wrapper; the outermost group to which we will had more sub groups ie xaxis, cirlegroup and so ont
  // That way we can address each subgroup as a hole and change properties of run methods
  var chartGroup = svg.append("g") //the chart itself,nudged over my margin left and margin top with in the svgWidth and svgHeight
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params
  var chosenXAxisLabel = xaxisname;



  // Retrieve data from the CSV file and execute everything below
  d3.csv(csvfile).then(function (csvData, err) {
    if (err) throw err;

    // parse data into separate arrays for each column, converting to a number
    csvData.forEach(function (data) {
      data[xaxisname] = +data[xaxisname];
      data[yaxisname] = +data[yaxisname];
      //data[x2axisname] = +data[x2axisname];
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(csvData, chosenXAxisLabel);

    // Create y scale function
    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(csvData, d => d[yaxisname])]) //gets max value of yaxisname from csvData
      .range([height, 0]).nice();

    // Create initial axis functions -- a D# function!! to create axis
    var bottomAxis = d3.axisBottom(xLinearScale);//These are DEFINED FUNCTIONS, remember FUNCTION
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // append y axis
    chartGroup.append("g")
      .call(leftAxis);

    // append initial circles
    let csize = 15
    var circlesGroup = chartGroup.selectAll("circle")
      .exit().remove()
      .data(csvData)

      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxisLabel]))
      .attr("cy", d => yLinearScale(d[yaxisname]))
      .attr("r", csize)
      .attr("fill", "brown")
      .attr("opacity", ".7");

    var textGroup = chartGroup.selectAll("text")
    textGroup.exit().remove()  //this is the equivalent of Flush or Reset
      .data(csvData)
      .enter()
      .append("text")
      .attr("fill", "yellow")
      .attr("x", d => xLinearScale(d[chosenXAxisLabel]))
      .attr("y", d => yLinearScale(d[yaxisname]) + csize / 2)
      .text(function (d) { return d[tagname] })
      .attr("text-anchor", "middle")

      .attr("font-size", "14");
    // Create group for  2 x- axis labels
    var labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var hairLengthLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", xaxisname) // value to grab for event listener
      .classed("active", true)
      .attr("font-weight", "bold")
      .attr('font-size', '18')
      .text(xaxisTitle);

    var albumsLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", x2axisname) // value to grab for event listener
      .attr("font-weight", "bold")
      .classed("inactive", true)
      .text(x2axisTitle);

    // append y axis
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .classed("axis-text", true)
      .attr("font-weight", "bold")
      .attr('font-size', '18')
      .text(yaxisTitle);

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxisLabel, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
      .on("click", function () {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxisLabel) {

          // replaces chosenXAxisLabel with value
          chosenXAxisLabel = value;

          // console.log(chosenXAxisLabel)

          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(csvData, chosenXAxisLabel);

          // updates x axis with transition
          xAxis = renderAxes(xLinearScale, xAxis);

          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxisLabel);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxisLabel, chartGroup);

          // changes classes to change bold text
          // if (chosenXAxisLabel === x2axisName) {
          //   albumsLabel
          //     .classed("active", true)
          //     .classed("inactive", false);
          //   hairLengthLabel
          //     .classed("active", false)
          //     .classed("inactive", true);
          // }
          // else {
          //   albumsLabel
          //     .classed("active", false)
          //     .classed("inactive", true);
          //   hairLengthLabel
          //     .classed("active", true)
          //     .classed("inactive", false);
          // }
        }
      });
  }).catch(function (error) {
    console.log(error);
  });
} //end if of main function



// function used for updating x-scale var upon click on axis label
function xScale(csvData, chosenXAxisLabel) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(csvData, d => d[chosenXAxisLabel]) * 0.8,
    d3.max(csvData, d => d[chosenXAxisLabel]) * 1.2
    ])
    .range([0, width]).nice();

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(500)
    .call(bottomAxis);

  return xAxis;
}


// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxisLabel) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxisLabel]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxisLabel, selGroup) {
  chosenXAxisLabel=xaxisName
  // if (chosenXAxisLabel === xaxisName) {
  //   var label = xaxisName;
  // }
  // else {
  //   var label = x2axisName;
  // }

  var toolTip =  d3.tip().attr("class", "d3-tip").style("right", "15px").direction('e').offset([80+"cx", -60+"cy"])
  
    .html(function (d) {
      return (`${d[tooltipTitle]}<br>${xaxisName} 
      ${d[xaxisName]}<br>${yaxisName} 
      ${d[yaxisName]} <br>${"R: "} ${Rval}`);
 
    });

  selGroup.call(toolTip);

  selGroup.on("mousemove", function (data) {
    toolTip.show(data,this);
    
    // selGroup.style('top', (d3.event.pageY + 10)+'px')
    //     .style('left', (d3.event.pageX + 10)+'px');
    //     console.log(d3.event.pageY + 10,d3.event.pageX + 10)
       
  })
   // onmouseout event
    // .on("mouseout", function (data) {
      
    //    toolTip.hide()
    // });

  return selGroup;
}

//rockband,hair_length,num_hits,num_albums
//function DynamicScatter(csvfile,xaxisname,x2axisname,yaxisname,tooltiptitle,title,htmldiv,cwidth,cheight,xaxisTitle,yaxisTitle,x2axisTitle,tm,rm,bm,lm)
//

function makeCorrelagram(csvFile, allVar) {

  // Dimension of the whole chart. Only one size since it has to be square
  var m = 20
  var sz = 650
  var marginWhole = { top: m, right: m, bottom: m, left: m },
    sizeWhole = sz - marginWhole.left - marginWhole.right
 //Intialize comment area by cleaning it out
    d3.select(".article")
     .html("")
  // Create the svg area
  var svg = d3.select("#correlagram")
    .append("svg")
    .attr("width", sizeWhole + marginWhole.left + marginWhole.right)
    .attr("height", sizeWhole + marginWhole.top + marginWhole.bottom)
    .attr("id", "Master_Correlagram")
    .append("g")
    .attr("transform", "translate(" + marginWhole.left + "," + marginWhole.top + ")");

  d3.csv(csvFile).then(function (csvData) {

    // What are the numeric variables in this dataset? How many do I have
    //var allVar =["poverty", "age", "income", "healthcare","healthcareLow","healthcareHigh","obesity","obesityLow","obesityHigh","smokes","smokesLow","smokesHigh"]
    //var allVar =["poverty", "age", "income", "healthcare" ,"obesity","smokes" ]

    var numVar = allVar.length
   
    // Now I can compute the size of a single chart
    mar = 0
    size = sizeWhole / numVar


    // ----------------- //
    // Scales
    // ----------------- //

    // Create a scale: gives the position of each pair each variable
    var position = d3.scalePoint()
      .domain(allVar)
      .range([0, sizeWhole - size])

    // Color scale: give me a specie name, I return a color



    var color = "green"

    // ------------------------------- //
    // Add variable names = diagonal
    // ------------------------------- //
    for (i in allVar) {
      for (j in allVar) {
        // If var1 == var2 i'm on the diagonal, otherwisee I skip
        if (i != j) { continue; }
        // Add text
        var var1 = allVar[i]
        var var2 = allVar[j]
        svg
          .append('g')
          .attr("transform", "translate(" + position(var1) + "," + position(var2) + ")")
          .append('text')
          .attr("x", size / 2)
          .attr("y", size / 2)
          .text(var1)
          .attr("text-anchor", "middle")
          .attr("font-size", "18")

      }
    }

    // ------------------------------- //
    // Add charts
    // ------------------------------- //
    let cntr=0
    for (i in allVar) {
      for (j in allVar) {
      cntr = cntr+1
        // Get current variable name (column identifiers)
        var var1 = allVar[i]
        var var2 = allVar[j]
console.log(var1,var2)
        // If var1 == var2 i'm on the diagonal, I skip that
        if (var1 === var2) { continue; }
       
  //take the columns var1 and var2 and put them into an array list for the statistics'
  var xarr=[]
  var yarr=[]
  csvData.forEach(function (data) {
    xarr.push(+data[var1]); 'bracket identification'
    yarr.push(+data[var2]);
  // console.log(data[var1],data[var2])
  });
   // parse data into separate arrays for each column, converting to a number
       
        // Add X Scale of each graph
        xextent = d3.extent(csvData, function (d) { return +d[var1] })
        var x = d3.scaleLinear()
          .domain(xextent).nice()
          .range([0, size - 2 * mar]);

        // Add Y Scale of each graph
        yextent = d3.extent(csvData, function (d) { return +d[var2] })
        var y = d3.scaleLinear()
          .domain(yextent).nice()
          .range([size - 2 * mar, 0]);
          let R =getPearsonCorrelation(xarr,yarr)
Rval =R.toFixed(2)
        // Add a 'g' at the right position for each minichart
        var tmp = svg
        
          .append('g')
          .classed("SVGMiniChart", true)
          .attr("id", var1 + "|" + var2+"|"+ R) //this tags the mini chart with the lists used to build it so that when the chart is click it can retrieve that data
          .attr("transform", "translate(" + (position(var1) + mar) + "," + (position(var2) + mar) + ")")
          .on("click", function () {
            // get value of selection
            let chartid = d3.select(this).attr("id")
            var vspl = chartid.split("|")
            DynamicScatter(csvFile, vspl[0], vspl[1], vspl[1], 'abbr', 'abbr', 'none', '#scatter', 650, 650, capFirst(vspl[1]), capFirst(vspl[0]), " ", 50, 10, 100, 50)
            // console.log(chartid)
            // console.log(vspl[0])
            // console.log(vspl[1])
            // console.log(R)
          });
        // Add X and Y axis in tmp
        tmp.append("g")
          .attr("transform", "translate(" + 0 + "," + (size - mar * 2 - 2) + ")")
          .call(d3.axisBottom(x).ticks(2));
        tmp.append("g")
          .call(d3.axisLeft(y).ticks(2));


        // tmp.append("g")
        // .call(d3.axisRight(y).ticks(2));
        // tmp.append("g")
        // .call(d3.axisTop(x).ticks(3));

        // Add circle
        var c = 'tomato'
        let colors = ['red', 'green', 'purple', 'cyan', 'blue', 'black', 'grey', 'orange', 'darkgrey', 'tomato']
        //console.log("Absolute Value of Correlation:", Math.abs(R))
        NR = Math.abs(R)
        if (NR < 0.5) {

          c = 'darkgrey';
        }
        else if ((NR > 0.5) && (NR < .7)) {
          c = 'purple';
        }
        else if (NR > .7) {
          c = 'green';
         d3.select('div','.article')  //in the html'
             .append("h2").text("Charts of interest are:")
             .append("h4").text(capFirst(var1) + " vs " + capFirst(var2)  +   " R value: "+ R.toFixed(2)).attr("color","green")
             
            // .appendHTML("<h2>"+ var1 + " vs " + var2 + R + "</h2>"); 
        
            console.log()

        }
      
function capFirst(s){
  return (s[0].toUpperCase() + s.slice(1))
}
         
        tmp
          .selectAll("myCircles")
          .exit().remove()  //this is the equivalent of Flush or Reset
          .data(csvData)
          .enter()
          .append("circle")
          .attr("cx", function (d) { return x(+d[var1]) })
          .attr("cy", function (d) { return y(+d[var2]) })
         
          .attr("r", 4)
            
          .attr("fill", c)
          
         
      }
    }
  }).catch(function (error) {
    console.log(error);
  });


  /*
 *  Source: http://stevegardner.net/2012/06/11/javascript-code-to-calculate-the-pearson-correlation-coefficient/
 */
function getPearsonCorrelation(x, y) {
  let shortestArrayLength = 0;

  if(x.length == y.length) {
      shortestArrayLength = x.length;
  } else if(x.length > y.length) {
      shortestArrayLength = y.length;
      console.error('x has more items in it, the last ' + (x.length - shortestArrayLength) + ' item(s) will be ignored');
  } else {
      shortestArrayLength = x.length;
      console.error('y has more items in it, the last ' + (y.length - shortestArrayLength) + ' item(s) will be ignored');
  }

  let xy = [];
  let x2 = [];
  let y2 = [];

  for(let i=0; i<shortestArrayLength; i++) {
      xy.push(x[i] * y[i]);
      x2.push(x[i] * x[i]);
      y2.push(y[i] * y[i]);
  }

  let sum_x = 0;
  let sum_y = 0;
  let sum_xy = 0;
  let sum_x2 = 0;
  let sum_y2 = 0;

  for(let i=0; i< shortestArrayLength; i++) {
      sum_x += x[i];
      sum_y += y[i];
      sum_xy += xy[i];
      sum_x2 += x2[i];
      sum_y2 += y2[i];
  }

  let step1 = (shortestArrayLength * sum_xy) - (sum_x * sum_y);
  let step2 = (shortestArrayLength * sum_x2) - (sum_x * sum_x);
  let step3 = (shortestArrayLength * sum_y2) - (sum_y * sum_y);
  let step4 = Math.sqrt(step2 * step3);
  let answer = step1 / step4;

  return answer;
}

}

// For making this collapsible tree;
// I have taken inspiration from this website: https://observablehq.com/@d3/collapsible-tree
// After making the basic tree, I have added Tooltip,Tooltip Bargraph,Filter,Zoomable functions

// This Collapsible tree is showing ;
// The Sales Analysis of each Category,Sub-Category and Top 10 Products of the Superstore data along with 
// Sales over Years bar graph on the tooltip and Region Filter Slicer

// Fetching the data from json file 
// Data is ready for making collapsible tree

fetch('JimiPatel.json')
          .then(response => response.json())
          .then(data => {

// Declaring the global data;As I have 5 root node==>each represents the filter option (Helps while making the filter)

let globalData = data;
    
  // This will create and update the chart when called 

const chart = (data) => {

// Function to sort categories,subcategories and products by Sales value from high to low

const sortByValue = (a, b) => b.value - a.value;

// Sorting the categories by total sales 

data.children.sort(sortByValue);

// Sorting subcategories within each category by total sales 

data.children.forEach(category => {
  category.children.sort(sortByValue);
  // Sorting products within each subcategory by total sales 
  category.children.forEach(subcategory => {
    subcategory.children.sort(sortByValue);
    // Keeping only the top 10 products as we have more than 3500 products 
    subcategory.children = subcategory.children.slice(0, 10);
  });
});

// I have global data; It has 5 root node for each filter option
// I am creating tree each time the filter changes 
// Therefore, removing the previous SVG ==>in order to make new collapsible tree     

d3.select("svg").remove();

// Deciding SVG canvas ==> height,width and margins

      width = 1300,
      height = 600,   
      marginTop = 200,
      marginRight = 100,
      marginBottom = 100,
      marginLeft = 550;

// Now this dx and dy is showing how the distance should be between each nodes
// Dx=making the tree branches in between space getting bigger (increasing the space vertically between nodes)
// Dy=making tree branches stretch out (increasing the space horizontally between nodes)
// Also arranges the data in tree like structure

      const root = d3.hierarchy(data);
      const dx = 20;
      const dy = 160;

// Just creating the Blueprint of the tree how the tree looks and where each node should be placed
// Also creating the branches to connect each nodes of the collapsible tree      

      const tree = d3.tree().nodeSize([dx, dy]);
      const diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);

// Creating the SVG canvas and setting the margins and height and width

      const svg = d3.select('body')
      .append("svg")
        .attr("width", width)
        .attr("height", dx)
        .attr("viewBox", [-marginLeft, -marginTop, width, dx])
        .attr("style", "max-width: 100%; height: auto; font: 11px sans-serif; user-select: none;");

// This is for the branches and its styling     

      const gLink = svg.append("g")
                        .attr("fill", "none")
                        .attr("stroke", "#555")
                        .attr("stroke-opacity", 1.5)
                        .attr("stroke-width", 1.9);

// Similarly this is for grouping the nodes on the tree 
// In the tree,nodes are representing the Category,Sub-Category and Products of the Superstore
// Changing cursor to pointer and also make that nodes==> pointer events such as mouseover and clickable   

      const gNode = svg.append("g")
        .attr("cursor", "pointer")
        .attr("pointer-events", "all");
      
// When collapsing and extending the tree,It should update and altkey is just setting the speed of it
// Crucial part is, Its collecting the data for nodes and link in order => to make the tree 
// Also descendants is just keeping all the nodes in order from root=>parent=>child 

      function updateTree(event, source) {
        const duration = event?.altKey ? 2500 : 250; 
        const nodes = root.descendants().reverse();
        const links = root.links();

// Now previously we have saved hierachy data into root,now we are using it
// Simply it will take the data and put it in a tree shape

        tree(root);

// By transversing tree left => right most node ,we are finding the tree height
        
        let left = root;
        let right = root;
        root.eachBefore(node => {
          if (node.x < left.x) left = node;
          if (node.x > right.x) right = node;
        });
        
        const height = right.x - left.x + marginTop + marginBottom;

// When any update takes place ==> the tree will change and how fast it should change by duration
// When collapsing or expanding ==> based on the categories,sub-categories and products ==> update will take place

        const transition = svg.transition()
          .duration(duration)
          .attr("height", height)
          .attr("viewBox", [-marginLeft, left.x - marginTop, width, height])
          .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));

// This line of code connect child to their parent node by looking for ids 

        const node = gNode.selectAll("g")
          .data(nodes, d => d.id);
        
// Adding a tooltip will provide more information for that particular node 
// Creating the tooltip and styling it 
// Also the bar chart is connected with html with an id

                var Tooltip = d3.select("body").append("div")
                    .style("opacity", 0)
                    .attr("class", "tooltip")
                    .style("background-color", "white")
                    .style("border", "solid")
                    .style("border-width", "2px")
                    .style("border-radius", "5px")
                    .style("padding", "5px");

// Initially hiding the nodes , However by clicking allow user to expand and collapse the tree by adding nodes
// Here, we are collapsing and expanding the nodes based on if the children is visible=>collapse else expands

            const nodeEnter = node.enter().append("g")
                .attr("transform", d => `translate(${source.y0},${source.x0})`)
                .attr("fill-opacity", 0)
                .attr("stroke-opacity", 0)
                .on("click", (event, d) => {
                            d.children = d.children ? null : d._children;
                            updateTree(event, d);
                            })

// Triggering the event when mouse is over nodes to show total sales and percentage of sales   

        .on("mouseover", function (event, d) {
                        const totalSales = Math.round(d.data.value) || 0;
                        const parentSales = d.parent ? Math.round(d.parent.data.value) || 0 : 0;
                        let percentage = 0;
                        if (parentSales !== 0 && d.parent) {
                            percentage = ((totalSales / parentSales) * 100).toFixed(2);
                        }

// Updating the tooltip with the Hovered node and its sales and percentages 
// Also styling it with font 

            d3.select("#nodeName")
                .text(`Node:${d.data.name}`)
                .style("font-size", "10px")
                .style("font-weight", "bold"); 

            d3.select("#totalSales")
                .text(`Sales: $ ${totalSales}, Percentage: ${percentage}%`)
                .style("font-size", "10px")
                .style("font-weight", "bold"); 

// Preparing the to create bar chart as I want to not only show that node's sales but 
// Also want to compare it to know the trend of sales for that node(Category/Sub-Category/Products) 

        const barGraphData = [
                { year: "2014", value: d.data["2014"] },
                { year: "2015", value: d.data["2015"] },
                { year: "2016", value: d.data["2016"] },
                { year: "2017", value: d.data["2017"] }
                ];

// Defining the bar width,height and padding 

// Calculate the width of each bar based on the number of data points and the padding
const barWidth = 50;
const barHeight = 100; 
const barPadding = 0.2;
const totalBarWidth = barWidth * barGraphData.length;
const totalPaddingWidth = barPadding * (barGraphData.length - 1);
const totalWidth = totalBarWidth + totalPaddingWidth;

// Adjusting the width of the SVG container to accommodate all bars and padding
const svgWidth = totalWidth;

// X-scale(Horizontally) and Y-scale(Vertically) help in positioning the bar chart           

        // Updateing the x scale range to cover the entire SVG width
            const xScale = d3.scaleBand()
                    .domain(barGraphData.map(d => d.year))
                    .range([0, svgWidth])
                    .padding(barPadding);


        const yScale = d3.scaleLinear()
                    .domain([0, d3.max(barGraphData, d => d.value) * 1.5]) 
                    .range([barHeight, 0]);

        // Using above scale we are making axis

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        // Defining the SVG

        const svg = d3.select("#barGraph")
                    .append("svg")
                    .attr("width", barWidth * barGraphData.length)
                    .attr("height", barHeight + 20);
                    

        // Now we are putting that previous made X-axis and Y-axis on the SVG

        svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(0," + barHeight + ")")
                .call(xAxis);

        svg.append("g")
                .attr("class", "y-axis")
                .call(yAxis);

        // Attaching the Bar to svg, also taking x and y scale into account for referring the bar width and height

        svg.selectAll(".bar")
                .data(barGraphData)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", d => xScale(d.year))
                .attr("y", d => yScale(d.value))
                .attr("width", xScale.bandwidth())
                .attr("height", d => barHeight - yScale(d.value))  
                .style("fill", "#40679e");

        // Adjusting the font size x-axis text 

            svg.selectAll(".x-axis text")
                .style("font-size", "10px"); 

        // Adding data labels on each bar which shows sales value and also rounded it for better visibility

            svg.selectAll(".bar-label")
                    .data(barGraphData)
                    .enter()
                    .append("text")
                    .attr("class", "bar-label")
                    .attr("x", (d, i) => xScale(d.year) + (xScale.bandwidth() / 2))
                    .attr("y", d => yScale(d.value) - 3) 
                    .attr("text-anchor", "middle")
                    .style("font-size", "10px")
                    .style("font-weight", "bold")
                    .text(d => `$${Math.round(d.value)}`);


        // Adding a title to the Bar

            svg.append("text")
                    .attr("x", (barWidth * barGraphData.length) / 2)
                    .attr("y", 12) 
                    .attr("text-anchor", "middle")
                    .style("font-size", "10px")
                    .style("font-weight", "bold")
                    .text("Sales by Year");

        // Positioning the tooltip based on mouse coordinates

        const tooltip = d3.select(".tooltip");
                tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px")
                .transition()
                .duration(200)
                .style("opacity", 1);
                })

        // when mouse moves away from the nodes, The tooltip disappears

        .on("mouseout", function (event, d) {
            // Hide the tooltip on mouseout
            d3.select(".tooltip")
                .transition()
                .duration(500)
                .style("opacity", 0);

            // Remove the SVG containing the bar graph
            d3.select("#barGraph").selectAll("svg").remove();
            });


// Defining colors to the Categories , Sub-Categories and Products

        const categoryColor = "#86A7FC"; 
        const subcategoryColor = "#7F9F80"; 
        const productColor = "#FF9843"; 

// Creating circles for each node ==> we will assign the color so that they can be easily distinguished 

        nodeEnter.append("circle")
          .attr("r", 3.5)
          .attr("fill", d => {
            if (d.depth === 0) return "pink"; 
            else if (d.depth === 1) return categoryColor; 
            else if (d.depth === 2) return subcategoryColor; 
            else return productColor; 
          })
          .attr("stroke-width", 10);

// Adding text so that we can read which node represents which Product
// Also adding the positioning, If has children ==> text will be on right side, otherwise left side
// d.data.name is way of telling which text will go with each node

        nodeEnter.append("text")
          .attr("dy", "0.31em")
          .attr("x", d => d._children ? -6 : 6)
          .attr("text-anchor", d => d._children ? "end" : "start")
          .text(d => d.data.name)
          .attr("stroke-linejoin", "round")
          .attr("stroke-width", 3)
          .attr("stroke", "white")
          .attr("paint-order", "stroke");

// Nodes which are appending the tree ==> looks like they are coming from parent node smoothly(by making opacity = 1)            

        const nodeUpdate = node.merge(nodeEnter).transition(transition)
          .attr("transform", d => `translate(${d.y},${d.x})`)
          .attr("fill-opacity", 1)
          .attr("stroke-opacity", 1);
 
// Nodes which are leaving the tree ==> go back to parent node smoothly(by making opacity = 0)          

        const nodeExit = node.exit().transition(transition).remove()
          .attr("transform", d => `translate(${source.y},${source.x})`)
          .attr("fill-opacity", 0)
          .attr("stroke-opacity", 0);

// Keeping track of all the branches so when needed (Expand-Collapse the tree)
// path.link is finding all the lines of the tree
// Each branches connecting to d.target

        const link = gLink.selectAll("path.link")
        .data(links, d => d.target.id);  

// Entering the new link         
// It is creating branches based on the depth of the tree 
// Initial position will be 0,0

        const linkEnter = link.enter().append("path")
        .attr("class", d => {

        if (d.target.depth === 1) return "link category";
        else if (d.target.depth === 2) return "link subcategory";
        else return "link product";

        })
        .attr("d", d => {
        const o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
        });

// Updating the existing link
// Merging existing branches with the new line by transitioning them smoothly

        link.merge(linkEnter).transition(transition)
          .attr("d", diagonal)
          .attr("stroke-width", 1.5)
          .attr("stroke", "#555")
          .attr("stroke-opacity", 0.4);
          
// Exiting the link 
// Similarly, Removing the branches with smooth transition

        link.exit().transition(transition).remove()
          .attr("d", d => {
            const o = { x: source.x, y: source.y };
            return diagonal({ source: o, target: o });
          });

// Saving the tree position  

        root.eachBefore(d => {
          d.x0 = d.x;
          d.y0 = d.y;
        });
      }

// Setting the root position     

      root.x0 = dy / 2;
      root.y0 = 0;

// Assigning the unique ID number and storing node children and sets the initial position of the tree

      root.descendants().forEach((d, i) => {
        d.id = i;
        d._children = d.children;
        if (d.depth && d.data.name.length !== 7) d.children = null;
      });
      
// Show updated tree visualisation by appending to the svg

      updateTree(null, root);
      document.body.appendChild(svg.node());
      return svg.node();
    };

// Region Dropdown => Appending to the body,has id which is connected with html    
// When one of any options selected ==> it will select the value from global data 
// As global data has 5 Root node which represents each Filter option

var regions = ["All", "South", "East", "West", "Central"]; 

// Creating a container for the label and dropdown
var filterContainer = d3.select("body").append("div")
    .attr("class", "filter-container");

// Creating a label for the filter dropdown
filterContainer.append("label")
    .attr("for", "region-dropdown")
    .text("Region:");

// Creating the dropdown menu
var regionDropdownFilter = filterContainer.append("select")
    .attr("id", "region-dropdown")
    .on("change", function () {
        var selectedRegion = d3.select(this).property("value");
        chart(globalData[selectedRegion]); 
    });

// Dynamically I am adding the options into the filter
regionDropdownFilter.selectAll("option")
    .data(regions)
    .enter().append("option")
    .attr("value", function (d) { return d; })
    .text(function (d) { return d; });

// Positioning the container with the filter options in the top right corner
var margin = { top: 170, right: 100 }; 
var containerWidth = filterContainer.node().getBoundingClientRect().width; 

filterContainer.style("position", "absolute")
    .style("top", margin.top + "px")
    .style("right", margin.right + "px");

// Initialize chart with data for "All" region
chart(globalData["All"]);
})
.catch(error => console.error('Error loading data:', error));



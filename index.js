const { 
  json, 
  select, 
  scaleBand, 
  scaleLinear,
  axisLeft, 
  axisBottom, 
  scaleThreshold,
  format,
} = d3;

const URL = [
  "https://raw.githubusercontent.com/",
  "freeCodeCamp/",
  "ProjectReferenceData/",
  "master/",
  "global-temperature.json"
].join("")

const colors =  [
  '#67001f',
  '#b2182b',
  '#d6604d',
  '#f4a582',
  '#fddbc7',
  '#f7f7f7',
  '#d1e5f0',
  '#92c5de',
  '#4393c3',
  '#2166ac',
  '#053061'
]


const months = [
  "January", 
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
]

json(URL)
  .then(({ baseTemperature, monthlyVariance }) => {
      select('#base-temperature')
          .text(baseTemperature)
          
  
      const data = monthlyVariance.map(({year, month, variance}) => {
         return { 
          year: year.toString(),
          temperature: +parseFloat(baseTemperature + variance).toFixed(1), 
          variance,
          month: months[month - 1]
         }
      });

  
      // svg 
      const margin = {
          left: 50, 
          right: 50, 
          top: 50, 
          bottom: 50
      }
  
      const width = window.innerWidth; 
      const height = window.innerHeight;
  
      const svg = d3.select("body")
                      .append('svg')
                      .attr('width', width - margin.left - margin.right)
                      .attr('height', height - margin.top - margin.bottom)
                      .attr('viewBox', [0,0,width, height])
  
      // Scales
  
      
      const xValue = d => d.year; 
      const yValue = d => d.month;
      const tValue = d => d.temperature
  
  
      const xScale = scaleBand()
                       .domain(data.map(xValue))
                       .range([margin.left, width - margin.right])
      
  
      const yScale = scaleBand()
                      .domain(data.map(yValue))
                      .range([margin.top, (height - margin.bottom)/2])





      const legendColors = [
          '#67001f',
          '#b2182b',
          '#d6604d',
          '#f4a582',
          '#fddbc7',
          '#f7f7f7',
          '#d1e5f0',
          '#92c5de',
          '#4393c3',
          '#2166ac',
          '#053061'
      ];

      const minTemp = Math.min(...data.map(tValue))
      const maxTemp = Math.max(...data.map(tValue))
      
      var tScale =  scaleThreshold()
                      .domain(
                        (function (min, max, count) {
                          var array = [];
                          var step = (max - min) / count;
                          for (var i = 1; i < count; i++) {
                            array.push(min + i * step);
                          }
                          return array;
                        })(minTemp, maxTemp, legendColors.length)
                      )
                      .range(legendColors.reverse());
      // Axis
      const xAxis = axisBottom(xScale)
      const yAxis = axisLeft(yScale)
  
      svg.append('g')
         .attr('id','x-axis')
         .attr('transform', `translate(0,${(height - margin.bottom)/2})`)
         .call(xAxis.tickValues(xScale.domain().map(year => year.endsWith('0') ? year: '')))
  
      svg.append('g')
         .attr('id','y-axis')
         .attr('transform', `translate(${margin.left},0)`)
         .call(yAxis)
  
    // const tip = tip().attr('id', 'tooltip');

    // svg.call(tip)

      svg
       .selectAll("rect")
       .data(data)
       .join("rect")
       .attr('class','cell')
       .attr('data-month', d => +d.month)
       .attr('data-year', d => +d.year)
       .attr('data-temp', d => +d.temperature)
       .attr('x', d => xScale(d.year))
       .attr('y', d => yScale(d.month))
       .attr('width',xScale.bandwidth())
       .attr('height',yScale.bandwidth())
       .attr('fill',d => tScale(d.temperature))
      //  .on('mouseover', tip.show)
      //  .on('mouseout', tip.hide)

      // heatmap legend 
      // shows the colors in the legend 
      // shows the tresholds representing each colors

      console.log(`Domain: ${tScale.domain().map(format('.1f'))}`)

     const legendScale = scaleLinear()
                          .domain([
                            minTemp,
                            maxTemp
                          ])
                          .range([0, 400])

      const legendAxis = axisBottom(legendScale)
                           
      const legend = svg.append('g').attr('id','legend')
                        .attr('transform',`translate(${0},${height - 300})`)

      const tresholdValues = tScale.domain();

      let coupledTreshold = [];

      for(i = 0; i < tresholdValues.length; i++){
        let nextValue = tresholdValues[i+1] ? tresholdValues[i+1] : maxTemp;
        coupledTreshold.push([tresholdValues[i],nextValue])
      }

      console.log(`Couples: ${JSON.stringify(coupledTreshold)}`)

      legend 
         .call(legendAxis    
          .tickValues(tScale.domain())
         .tickFormat(d3.format('.1f')))

      legend
        .selectAll('.legend')
        .data(coupledTreshold)
        .join('rect')
        .attr('x', d => legendScale(d[0]))
        .attr('y',-30)
        .attr('fill',d => tScale(d[0]))
        .attr('width',d => legendScale(d[1]) - legendScale(d[0]))
        .attr('height', 30)
        .attr('stroke', 'black')
        .attr('stroke-width',1)
          
tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d; });
     
      
  })
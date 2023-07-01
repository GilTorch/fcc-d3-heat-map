const { 
    json, 
    select, 
    range,extent,
    scaleOrdinal,
    schemePastel1, 
    schemeCategory10, 
    scaleBand, 
    scaleLinear,
    scaleTime, 
    axisLeft, 
    axisBottom, 
    ascending,
} = d3;

const URL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json" 

const colors =  [
    "#4575B4",
    "#74ADD1", 
    "#ABD9E9",
    "#E0F3F8",
    "#FEFFBF",
    "#FCE090",
    "#F8AE62",
    "#F46D43",
    "#D72F27",
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

        console.table(data)

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
                        .range([margin.top, height - margin.bottom])

        const tScale = scaleLinear()
                        .domain(extent(data,tValue))
                        .range(["white", "#69b3a2"])

        // Axis
        const xAxis = axisBottom(xScale)
        const yAxis = axisLeft(yScale)



        svg.append('g')
           .attr('transform', `translate(0,${height - margin.bottom})`)
           .call(xAxis.tickValues(xScale.domain().map(year => year.endsWith('0') ? year: '')))

        svg.append('g')
           .attr('transform', `translate(${margin.left},0)`)
           .call(yAxis)

        svg
         .selectAll("rect")
         .data(data)
         .join("rect")
         .attr('class','cell')
         .attr('x', d => xScale(d.year))
         .attr('y', d => yScale(d.month))
         .attr('width',xScale.bandwidth())
         .attr('height',yScale.bandwidth())
         .attr('fill',d => tScale(d.temperature))
        
    })
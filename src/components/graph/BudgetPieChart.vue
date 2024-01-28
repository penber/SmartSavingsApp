  <template>
    <div ref="pieChart" class="pieChart"></div>
    <div ref="tooltip" class="tooltip" style="opacity: 0;">
    <p>{{ tooltipContent }}</p>
  </div>


    <!-- Légende du camembert -->

  <div class="chart-legend">
      <div v-for="(data, index) in chartData" :key="index" class="legend-item">
        <span class="color-box" 
        :style="{ backgroundColor: getColor(index) }" 

        ></span>
        <span>{{ data.name }}</span>
      </div>
    </div>
    </template>
    
  <script>
  import * as d3 from 'd3';
  
  export default {
    props: {
      chartData: Array
    },
    
  computed: {
    limitedChartData() {
      return this.chartData.slice(0, 6);
    }
  },



    data() {
      return {
        tooltipContent: '',
        activeSlice: null, 
      };
    },
  
    watch: {
      chartData: {
        deep: true,
        handler() {
          this.drawChart();
        }
      }
    },
  
    mounted() {
      this.$nextTick(() => {
        if (this.$refs.pieChart) {
          this.drawChart();
        }
      });
    },
  
    methods: {
    drawChart() {
      const svgContainer = this.$refs.pieChart;
      d3.select(svgContainer).selectAll("*").remove();
      const data = this.chartData;
      const width = 250;
      const height = 250;
      const radius = Math.min(width*0.7, height *0.7) / 2;

      // Créer un SVG
      const svg = d3.select(this.$refs.pieChart)
        .append('svg')
        .attr('width', width)
        .attr('height', height )
        .append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);

      const pie = d3.pie().value(d => d.value);
      const arc = d3.arc().innerRadius(0).outerRadius(radius);

      svg.selectAll('path')
    .data(pie(data))
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', (d, i) => this.getColor(i)) 
    .on('click', this.onClick);

    },
    

   

    onClick(event, d) {

    if (this.activeSlice === d) {
        this.activeSlice = null;
        this.tooltipContent = '';
        this.$refs.tooltip.style.opacity = 0;
    } else {
        this.activeSlice = d;
        this.tooltipContent =  `
        ${d.data.name} 
        Valeur : ${d.data.value} CHF`;
        this.showTooltip(event);    
    }
    },

      showTooltip(event) {
        this.$refs.tooltip.style.opacity = 1;
        this.$refs.tooltip.style.left = `${event.pageX + 10}px`;
        this.$refs.tooltip.style.top = `${event.pageY + 10}px`;
    },
    getColor(index) {
      return d3.schemeCategory10[index % d3.schemeCategory10.length];
    },
    }
    }
  
  </script>
  
  <style>
  .pieChart {
    display:flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    max-width: 250px;
    height: 250px; 
  }


  .tooltip {
  position: absolute;
  text-align: center;
  padding: 8px;
  font-size: 13px;
  font-weight: 700;
  background: rgb(185, 185, 235);
  border: 2px solid rgb(255, 248, 248);
  border-radius: 8px;
  pointer-events: none;
  opacity: 0;
  color: rgb(2, 0, 0);
}


.color-box {
  display: inline-block;
  width: 15px;
  height: 15px;
  min-width: 15px;
  margin-right: 5px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  width: calc(100% / 3); /* Chaque élément prend un tiers de la largeur totale */
  box-sizing: border-box;
  padding: 5px;
}


.chart-legend {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-top: 20px;
}

  </style>
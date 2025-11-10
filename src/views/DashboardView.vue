<template>
  <div class="dashboard">
    <Header />
    
    <!-- Date Header -->
    <div class="date-header">
      <span class="date-arrow" @click="prevDate">‹</span>
      <span>{{ currentDate }}</span>
      <span class="date-arrow" @click="nextDate">›</span>
    </div>
    
    <div class="main-content">
      <!-- Title -->
      <div class="title-section">
        <h1 class="main-title">TOP LEVEL<br>DASHBOARD</h1>
        <p class="subtitle">Finance Overview</p>
      </div>

      <!-- Create Chart Button -->
      <button @click="openChartBuilder" class="create-chart-btn">
        <span class="btn-icon">➕</span>
        <span>Create New Chart</span>
      </button>

      <!-- Custom Charts -->
      <div v-for="(chart, index) in customCharts" :key="chart.id" class="custom-chart-wrapper">
        <DynamicChart 
          :config="chart" 
          @edit="editChart(index)"
          @delete="deleteChart(index)"
          @refresh="refreshChart(index)"
        />
      </div>

      <!-- Static Charts (Original) -->
      <!-- Revenue Card -->
      <div class="card card-blue">
        <div class="card-header">
          <h2 class="card-title">Revenue 2025</h2>
          <div class="legend">
            <span class="legend-item">
              <div class="legend-color" style="background: var(--primary-green)"></div>
              Revenue
            </span>
            <span class="legend-item">
              <div class="legend-color" style="background: var(--primary-blue)"></div>
              Expense
            </span>
          </div>
        </div>
        <div class="stats-row">
          <span class="stats-value">{{ revenue.total }}</span>
          <span :class="['stats-change', revenue.changeType]">{{ revenue.change }}</span>
          <span class="stats-description" style="margin: 0">{{ revenue.description }}</span>
        </div>
        <p class="stats-description">{{ revenue.subtitle }}</p>
        <div class="chart-container">
          <canvas ref="revenueChart"></canvas>
        </div>
      </div>

      <!-- Month Progress Card -->
      <div class="card card-dark">
        <div class="card-header">
          <h2 class="card-title">Month by month</h2>
          <span class="stats-change positive">{{ monthProgress.change }} vs last month</span>
        </div>
        <p class="stats-description">{{ monthProgress.subtitle }}</p>
        
        <div class="progress-circle">
          <canvas ref="monthProgressChart"></canvas>
          <div class="progress-center">
            <div class="progress-percentage">{{ monthProgress.percentage }}%</div>
            <div class="progress-label">Progress</div>
          </div>
        </div>

        <div class="month-list">
          <div class="month-item" v-for="(item, index) in monthProgress.months" :key="index">
            <div class="month-left">
              <div class="month-indicator"></div>
              <span class="month-name">{{ item.month }}</span>
            </div>
            <div class="month-right">
              <span class="month-target">{{ item.target }}</span>
              <span class="month-progress">{{ item.progress }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Receivables Card -->
      <div class="card card-dark">
        <div class="card-header">
          <h2 class="card-title">Receivables</h2>
          <button class="filter-button">{{ receivables.period }}</button>
        </div>
        <div class="stats-row">
          <span class="stats-value">{{ receivables.total }}</span>
          <span :class="['stats-change', receivables.changeType]">{{ receivables.change }}</span>
        </div>
        <p class="stats-description">{{ receivables.description }}</p>
        <div class="target-box">
          <div class="target-label">Target</div>
          <div class="target-value">{{ receivables.target }}</div>
        </div>
        <div class="chart-container-small">
          <canvas ref="receivablesChart"></canvas>
        </div>
      </div>

      <!-- Hutang Card -->
      <div class="card card-dark">
        <div class="card-header">
          <h2 class="card-title">Hutang</h2>
          <button class="filter-button">{{ hutang.period }}</button>
        </div>
        <div class="stats-row">
          <span class="stats-value">{{ hutang.total }}</span>
          <span :class="['stats-change', hutang.changeType]">{{ hutang.change }}</span>
          <span class="stats-description" style="margin: 0">{{ hutang.description }}</span>
        </div>
        <p class="stats-description">{{ hutang.subtitle }}</p>
        <div class="chart-container-small">
          <canvas ref="hutangChart"></canvas>
        </div>
      </div>

      <!-- Budgeting Card -->
      <div class="card card-dark">
        <div class="card-header">
          <h2 class="card-title">Cost Budgeting</h2>
          <button class="filter-button">{{ budgeting.period }}</button>
        </div>
        <div class="stats-row" style="margin-bottom: 16px">
          <span class="stats-value">{{ budgeting.percentage }}</span>
          <span class="stats-description" style="margin: 0">{{ budgeting.description }}</span>
        </div>
        <div class="budget-info">
          <div class="budget-item">
            <div class="legend-dot" style="background: var(--primary-green)"></div>
            <span>Budget</span>
            <span>{{ budgeting.budget }}</span>
          </div>
          <div class="budget-item">
            <div class="legend-dot" style="background: var(--primary-orange)"></div>
            <span>Actual</span>
            <span>{{ budgeting.actual }}</span>
          </div>
        </div>
        <div class="chart-container-small">
          <canvas ref="budgetChart"></canvas>
        </div>
      </div>

      <!-- Cashflow Card -->
      <div class="card card-dark">
        <div class="card-header">
          <h2 class="card-title">Cashflow</h2>
          <button class="filter-button">{{ cashflow.period }}</button>
        </div>
        <div class="cashflow-legend">
          <div class="cashflow-item">
            <div class="cashflow-label">
              <div class="cashflow-dot" style="background: var(--primary-green)"></div>
              <span>Income</span>
            </div>
            <span class="cashflow-value">{{ cashflow.income }}</span>
          </div>
          <div class="cashflow-item">
            <div class="cashflow-label">
              <div class="cashflow-dot" style="background: var(--primary-red)"></div>
              <span>Expenses</span>
            </div>
            <span class="cashflow-value">{{ cashflow.expenses }}</span>
          </div>
          <div class="cashflow-item">
            <div class="cashflow-label">
              <div class="cashflow-dot" style="background: var(--primary-gold)"></div>
              <span>Projection</span>
            </div>
            <span class="cashflow-value">{{ cashflow.projection }}</span>
          </div>
        </div>
        <div class="chart-container">
          <canvas ref="cashflowChart"></canvas>
        </div>
      </div>
    </div>
    
    <BottomNav />

    <!-- Chart Builder Modal -->
    <ChartBuilder 
      :isOpen="showChartBuilder"
      :editChart="editingChart"
      @close="closeChartBuilder"
      @save="saveChart"
    />
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import Header from '@/components/Header.vue'
import BottomNav from '@/components/BottomNav.vue'
import DynamicChart from '@/components/DynamicChart.vue'
import ChartBuilder from '@/components/ChartBuilder.vue'

Chart.register(...registerables)

export default {
  name: 'DashboardView',
  components: {
    Header,
    BottomNav,
    DynamicChart,
    ChartBuilder
  },
  setup() {
    const store = useDashboardStore()
    
    // State
    const currentDate = computed(() => store.currentDate)
    const revenue = computed(() => store.revenue)
    const monthProgress = computed(() => store.monthProgress)
    const receivables = computed(() => store.receivables)
    const hutang = computed(() => store.hutang)
    const budgeting = computed(() => store.budgeting)
    const cashflow = computed(() => store.cashflow)
    
    // Chart Builder
    const showChartBuilder = ref(false)
    const editingChart = ref(null)
    const editingIndex = ref(null)
    const customCharts = ref(store.customCharts || [])
    
    // Chart Refs
    const revenueChart = ref(null)
    const monthProgressChart = ref(null)
    const receivablesChart = ref(null)
    const hutangChart = ref(null)
    const budgetChart = ref(null)
    const cashflowChart = ref(null)
    
    let charts = {}
    
    // Date Navigation
    const prevDate = () => {
      store.updateDate('prev')
    }
    
    const nextDate = () => {
      store.updateDate('next')
    }

    // Chart Builder Actions
    const openChartBuilder = () => {
      editingChart.value = null
      editingIndex.value = null
      showChartBuilder.value = true
    }

    const closeChartBuilder = () => {
      showChartBuilder.value = false
      editingChart.value = null
      editingIndex.value = null
    }

    const saveChart = (chartConfig) => {
      if (editingIndex.value !== null) {
        // Update existing chart
        customCharts.value[editingIndex.value] = {
          ...chartConfig,
          id: customCharts.value[editingIndex.value].id
        }
      } else {
        // Add new chart
        customCharts.value.push({
          ...chartConfig,
          id: Date.now()
        })
      }
      
      // Save to store
      store.setCustomCharts(customCharts.value)
      closeChartBuilder()
    }

    const editChart = (index) => {
      editingChart.value = { ...customCharts.value[index] }
      editingIndex.value = index
      showChartBuilder.value = true
    }

    const deleteChart = (index) => {
      if (confirm('Are you sure you want to delete this chart?')) {
        customCharts.value.splice(index, 1)
        store.setCustomCharts(customCharts.value)
      }
    }

    const refreshChart = (index) => {
      console.log('Refreshing chart:', index)
      // Trigger re-fetch data for this chart
    }
    
    // Initialize Static Charts
    const initCharts = () => {
      // Revenue Chart
      charts.revenue = new Chart(revenueChart.value, {
        type: 'bar',
        data: {
          labels: revenue.value.chartData.labels,
          datasets: [
            {
              label: 'Revenue',
              data: revenue.value.chartData.revenue,
              backgroundColor: '#A4FF00',
              borderRadius: 4,
              barThickness: 16
            },
            {
              label: 'Expense',
              data: revenue.value.chartData.expense,
              backgroundColor: '#00A3FF',
              borderRadius: 4,
              barThickness: 16
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                color: '#666',
                stepSize: 20,
                callback: (value) => value + 'M'
              },
              grid: { color: 'rgba(255,255,255,0.05)' }
            },
            x: {
              ticks: { color: '#666' },
              grid: { display: false }
            }
          }
        }
      })

      // Month Progress Chart
      charts.monthProgress = new Chart(monthProgressChart.value, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [monthProgress.value.percentage, 100 - monthProgress.value.percentage],
            backgroundColor: ['#00A3FF', '#A4FF00'],
            borderWidth: 0,
            cutout: '75%'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          }
        }
      })

      // Receivables Chart
      charts.receivables = new Chart(receivablesChart.value, {
        type: 'line',
        data: {
          labels: receivables.value.chartData.labels,
          datasets: [{
            data: receivables.value.chartData.data,
            borderColor: '#FF6B35',
            backgroundColor: 'rgba(255, 107, 53, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 50,
              ticks: {
                color: '#666',
                stepSize: 10,
                callback: (value) => value + 'M'
              },
              grid: { color: 'rgba(255,255,255,0.05)' }
            },
            x: {
              ticks: { color: '#666' },
              grid: { display: false }
            }
          }
        }
      })

      // Hutang Chart
      charts.hutang = new Chart(hutangChart.value, {
        type: 'bar',
        data: {
          labels: hutang.value.chartData.labels,
          datasets: [{
            data: hutang.value.chartData.data,
            backgroundColor: '#FF4757',
            borderRadius: 4,
            barThickness: 20
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 60,
              ticks: {
                color: '#666',
                stepSize: 20,
                callback: (value) => value + 'M'
              },
              grid: { color: 'rgba(255,255,255,0.05)' }
            },
            x: {
              ticks: { color: '#666' },
              grid: { display: false }
            }
          }
        }
      })

      // Budget Chart
      charts.budget = new Chart(budgetChart.value, {
        type: 'line',
        data: {
          labels: budgeting.value.chartData.labels,
          datasets: [
            {
              label: 'Budget',
              data: budgeting.value.chartData.budget,
              backgroundColor: '#A4FF00',
              borderColor: '#A4FF00',
              fill: true,
              tension: 0.4,
              pointRadius: 0
            },
            {
              label: 'Actual',
              data: budgeting.value.chartData.actual,
              backgroundColor: '#FF9500',
              borderColor: '#FF9500',
              fill: true,
              tension: 0.4,
              pointRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              stacked: true,
              ticks: {
                color: '#666',
                callback: (value) => value + 'M'
              },
              grid: { color: 'rgba(255,255,255,0.05)' }
            },
            x: {
              ticks: { color: '#666' },
              grid: { display: false }
            }
          }
        }
      })

      // Cashflow Chart
      charts.cashflow = new Chart(cashflowChart.value, {
        type: 'line',
        data: {
          labels: cashflow.value.chartData.labels,
          datasets: [
            {
              label: 'Income',
              data: cashflow.value.chartData.income,
              borderColor: '#A4FF00',
              backgroundColor: 'transparent',
              tension: 0.4,
              pointRadius: 0,
              borderWidth: 2
            },
            {
              label: 'Expenses',
              data: cashflow.value.chartData.expenses,
              borderColor: '#FF4757',
              backgroundColor: 'transparent',
              tension: 0.4,
              pointRadius: 0,
              borderWidth: 2
            },
            {
              label: 'Projection',
              data: cashflow.value.chartData.projection,
              borderColor: '#FFD700',
              backgroundColor: 'transparent',
              tension: 0.4,
              pointRadius: 0,
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: '#666',
                callback: (value) => value + 'M'
              },
              grid: { color: 'rgba(255,255,255,0.05)' }
            },
            x: {
              ticks: { color: '#666' },
              grid: { display: false }
            }
          }
        }
      })
    }
    
    onMounted(() => {
      initCharts()
    })
    
    onBeforeUnmount(() => {
      Object.values(charts).forEach(chart => chart.destroy())
    })
    
    return {
      currentDate,
      revenue,
      monthProgress,
      receivables,
      hutang,
      budgeting,
      cashflow,
      revenueChart,
      monthProgressChart,
      receivablesChart,
      hutangChart,
      budgetChart,
      cashflowChart,
      prevDate,
      nextDate,
      showChartBuilder,
      editingChart,
      customCharts,
      openChartBuilder,
      closeChartBuilder,
      saveChart,
      editChart,
      deleteChart,
      refreshChart
    }
  }
}
</script>

<style scoped>
/* Create Chart Button */
.create-chart-btn {
  width: 100%;
  background: linear-gradient(135deg, #A4FF00 0%, #7FCC00 100%);
  color: #000000;
  border: none;
  border-radius: 12px;
  padding: 16px 20px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(164, 255, 0, 0.3);
}

.create-chart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(164, 255, 0, 0.4);
}

.create-chart-btn:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 20px;
}

/* Custom Chart Wrapper */
.custom-chart-wrapper {
  margin-bottom: 20px;
}
</style>
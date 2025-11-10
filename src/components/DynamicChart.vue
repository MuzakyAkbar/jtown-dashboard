<template>
  <div class="card card-dark">
    <div class="card-header">
      <h2 class="card-title">{{ config.title }}</h2>
      <div class="card-actions">
        <button v-if="config.defaultPeriod" @click="showFilters = !showFilters" class="filter-button">
          {{ currentPeriodLabel }}
        </button>
        <button @click="$emit('edit')" class="icon-button">✏️</button>
        <button @click="$emit('delete')" class="icon-button">🗑️</button>
        <button @click="refreshData" class="icon-button">🔄</button>
      </div>
    </div>

    <p v-if="config.description" class="stats-description">{{ config.description }}</p>

    <!-- Filters -->
    <div v-if="showFilters" class="filters-panel">
      <div v-for="param in config.parameters" :key="param.name" class="filter-item">
        <label>{{ param.name }}</label>
        
        <input 
          v-if="param.type === 'text'" 
          v-model="parameterValues[param.name]"
          type="text"
          class="filter-input"
        />
        
        <input 
          v-if="param.type === 'number'" 
          v-model.number="parameterValues[param.name]"
          type="number"
          class="filter-input"
        />
        
        <input 
          v-if="param.type === 'date'" 
          v-model="parameterValues[param.name]"
          type="date"
          class="filter-input"
        />
        
        <div v-if="param.type === 'daterange'" class="date-range">
          <input 
            v-model="parameterValues[param.name + '_start']"
            type="date"
            class="filter-input"
            placeholder="Start"
          />
          <span>to</span>
          <input 
            v-model="parameterValues[param.name + '_end']"
            type="date"
            class="filter-input"
            placeholder="End"
          />
        </div>
      </div>
      
      <button @click="applyFilters" class="apply-filters-btn">Apply Filters</button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading data...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-state">
      <p>❌ {{ error }}</p>
      <button @click="refreshData" class="retry-btn">Retry</button>
    </div>

    <!-- Chart -->
    <div v-if="!loading && !error" :style="{ height: config.height + 'px' }" class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>

    <!-- Legend -->
    <div v-if="config.showLegend && chartData.datasets" class="chart-legend">
      <div v-for="(dataset, index) in chartData.datasets" :key="index" class="legend-item">
        <div class="legend-color" :style="{ background: dataset.backgroundColor || dataset.borderColor }"></div>
        <span>{{ dataset.label }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import OpenBravoClient, { QueryTemplates } from '@/lib/OpenBravo'

Chart.register(...registerables)

export default {
  name: 'DynamicChart',
  props: {
    config: {
      type: Object,
      required: true
    }
  },
  emits: ['edit', 'delete', 'refresh'],
  setup(props, { emit }) {
    const chartCanvas = ref(null)
    const chartInstance = ref(null)
    const loading = ref(false)
    const error = ref(null)
    const showFilters = ref(false)
    const currentPeriodLabel = ref(props.config.defaultPeriod || 'Filter')
    
    const chartData = reactive({
      labels: [],
      datasets: []
    })

    const parameterValues = reactive({})

    // Initialize parameter values
    const initializeParameters = () => {
      props.config.parameters?.forEach(param => {
        if (param.type === 'daterange') {
          parameterValues[param.name + '_start'] = param.defaultValue?.split('|')[0] || ''
          parameterValues[param.name + '_end'] = param.defaultValue?.split('|')[1] || ''
        } else {
          parameterValues[param.name] = param.defaultValue || ''
        }
      })

      // Set default period dates
      applyDefaultPeriod()
    }

    const applyDefaultPeriod = () => {
      const today = new Date()
      let startDate, endDate

      switch (props.config.defaultPeriod) {
        case 'today':
          startDate = endDate = today.toISOString().split('T')[0]
          break
        case 'yesterday':
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)
          startDate = endDate = yesterday.toISOString().split('T')[0]
          break
        case 'last7days':
          endDate = today.toISOString().split('T')[0]
          const last7 = new Date(today)
          last7.setDate(last7.getDate() - 7)
          startDate = last7.toISOString().split('T')[0]
          break
        case 'last30days':
          endDate = today.toISOString().split('T')[0]
          const last30 = new Date(today)
          last30.setDate(last30.getDate() - 30)
          startDate = last30.toISOString().split('T')[0]
          break
        case 'thisMonth':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
          endDate = today.toISOString().split('T')[0]
          break
        case 'lastMonth':
          const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
          startDate = lastMonth.toISOString().split('T')[0]
          const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
          endDate = lastMonthEnd.toISOString().split('T')[0]
          break
        case 'thisYear':
          startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0]
          endDate = today.toISOString().split('T')[0]
          break
      }

      if (startDate && endDate) {
        parameterValues.startDate = startDate
        parameterValues.endDate = endDate
      }
    }

    const fetchData = async () => {
      loading.value = true
      error.value = null

      try {
        let data = []

        if (props.config.sourceType === 'query') {
          data = await OpenBravoClient.executeQuery(props.config.query, parameterValues)
        } else if (props.config.sourceType === 'template') {
          const template = QueryTemplates[props.config.template]
          if (template) {
            const { query, parameters } = template(parameterValues)
            data = await OpenBravoClient.executeQuery(query, parameters)
          }
        } else if (props.config.sourceType === 'api') {
          const response = await fetch(props.config.apiEndpoint)
          data = await response.json()
        } else if (props.config.sourceType === 'entity') {
          const result = await OpenBravoClient.getEntity(props.config.entityName, parameterValues)
          data = result.response?.data || []
        }

        processData(data)
        renderChart()
      } catch (err) {
        error.value = err.message
        console.error('Chart data fetch error:', err)
      } finally {
        loading.value = false
      }
    }

    const processData = (data) => {
      if (!data || data.length === 0) {
        chartData.labels = []
        chartData.datasets = []
        return
      }

      const labelField = props.config.labelField || 'label'
      const valueFields = props.config.valueField?.split(',').map(f => f.trim()) || ['value']

      chartData.labels = data.map(item => item[labelField])

      const colors = props.config.colors?.split(',').map(c => c.trim()) || ['#A4FF00', '#00A3FF', '#FF4757']

      chartData.datasets = valueFields.map((field, index) => ({
        label: field.charAt(0).toUpperCase() + field.slice(1),
        data: data.map(item => item[field]),
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length],
        borderWidth: 2,
        tension: 0.4,
        fill: props.config.type === 'area'
      }))
    }

    const renderChart = () => {
      if (chartInstance.value) {
        chartInstance.value.destroy()
      }

      const ctx = chartCanvas.value?.getContext('2d')
      if (!ctx) return

      chartInstance.value = new Chart(ctx, {
        type: props.config.type || 'bar',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: props.config.type !== 'pie' && props.config.type !== 'doughnut' ? {
            y: {
              beginAtZero: true,
              ticks: { color: '#666' },
              grid: { 
                display: props.config.showGrid,
                color: 'rgba(255,255,255,0.05)' 
              }
            },
            x: {
              ticks: { color: '#666' },
              grid: { display: false }
            }
          } : {}
        }
      })
    }

    const refreshData = () => {
      fetchData()
      emit('refresh')
    }

    const applyFilters = () => {
      fetchData()
      showFilters.value = false
    }

    onMounted(() => {
      initializeParameters()
      fetchData()
    })

    onBeforeUnmount(() => {
      if (chartInstance.value) {
        chartInstance.value.destroy()
      }
    })

    watch(() => props.config, () => {
      initializeParameters()
      fetchData()
    }, { deep: true })

    return {
      chartCanvas,
      chartData,
      loading,
      error,
      showFilters,
      currentPeriodLabel,
      parameterValues,
      refreshData,
      applyFilters
    }
  }
}
</script>

<style scoped>
.card-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.icon-button {
  background: rgba(156, 163, 175, 0.1);
  border: 1px solid #374151;
  color: #9ca3af;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
}

.icon-button:hover {
  background: rgba(156, 163, 175, 0.2);
  color: #d1d5db;
  transform: scale(1.05);
}

.filters-panel {
  background: rgba(31, 41, 55, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.filter-item {
  margin-bottom: 12px;
}

.filter-item label {
  display: block;
  color: #d1d5db;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 6px;
}

.filter-input {
  width: 100%;
  background: rgba(31, 41, 55, 0.5);
  border: 1px solid #374151;
  border-radius: 6px;
  padding: 8px 10px;
  color: #ffffff;
  font-size: 13px;
}

.date-range {
  display: flex;
  gap: 8px;
  align-items: center;
}

.date-range span {
  color: #9ca3af;
  font-size: 12px;
}

.apply-filters-btn {
  width: 100%;
  background: #A4FF00;
  color: #000000;
  border: none;
  border-radius: 8px;
  padding: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 12px;
}

.apply-filters-btn:hover {
  background: #b5ff33;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(164, 255, 0, 0.2);
  border-top-color: #A4FF00;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-btn {
  background: rgba(164, 255, 0, 0.1);
  border: 1px solid #A4FF00;
  color: #A4FF00;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 12px;
}

.chart-legend {
  display: flex;
  gap: 16px;
  margin-top: 16px;
  flex-wrap: wrap;
}
</style>
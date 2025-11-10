<template>
  <transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">{{ editChart ? 'Edit Chart' : 'Create New Chart' }}</h2>
          <button @click="$emit('close')" class="close-btn">✕</button>
        </div>

        <div class="modal-body">
          <!-- Chart Title -->
          <div class="form-group">
            <label class="form-label">Chart Title</label>
            <input 
              v-model="form.title"
              type="text" 
              class="form-input"
              placeholder="e.g., Sales by Region"
            />
          </div>

          <!-- Chart Type -->
          <div class="form-group">
            <label class="form-label">Chart Type</label>
            <select v-model="form.type" class="form-select">
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="doughnut">Doughnut Chart</option>
              <option value="radar">Radar Chart</option>
              <option value="scatter">Scatter Chart</option>
              <option value="bubble">Bubble Chart</option>
            </select>
          </div>

          <!-- Data Source Type -->
          <div class="form-group">
            <label class="form-label">Data Source</label>
            <select v-model="form.sourceType" class="form-select">
              <option value="query">Custom Query</option>
              <option value="api">API Endpoint</option>
              <option value="entity">OpenBravo Entity</option>
              <option value="template">Query Template</option>
            </select>
          </div>

          <!-- Query Input (for Custom Query) -->
          <div v-if="form.sourceType === 'query'" class="form-group">
            <label class="form-label">SQL Query</label>
            <textarea 
              v-model="form.query"
              class="form-textarea"
              rows="6"
              placeholder="SELECT region as label, SUM(amount) as value FROM sales GROUP BY region"
            ></textarea>
            <button @click="testQuery" class="test-btn">
              {{ testing ? 'Testing...' : 'Test Query' }}
            </button>
          </div>

          <!-- API Endpoint (for API) -->
          <div v-if="form.sourceType === 'api'" class="form-group">
            <label class="form-label">API Endpoint</label>
            <input 
              v-model="form.apiEndpoint"
              type="text" 
              class="form-input"
              placeholder="/api/sales/summary"
            />
          </div>

          <!-- Entity Selection (for Entity) -->
          <div v-if="form.sourceType === 'entity'" class="form-group">
            <label class="form-label">Entity Name</label>
            <input 
              v-model="form.entityName"
              type="text" 
              class="form-input"
              placeholder="C_Order"
            />
          </div>

          <!-- Template Selection (for Template) -->
          <div v-if="form.sourceType === 'template'" class="form-group">
            <label class="form-label">Query Template</label>
            <select v-model="form.templateName" class="form-select">
              <option value="revenue_by_month">Revenue by Month</option>
              <option value="top_customers">Top Customers</option>
              <option value="product_performance">Product Performance</option>
              <option value="regional_sales">Regional Sales</option>
            </select>
          </div>

          <!-- Parameters -->
          <div class="form-group">
            <div class="param-header">
              <label class="form-label">Parameters</label>
              <button @click="addParameter" class="add-param-btn">+ Add Parameter</button>
            </div>
            <div v-for="(param, index) in form.parameters" :key="index" class="param-row">
              <input 
                v-model="param.name"
                type="text" 
                class="param-input"
                placeholder="Parameter name"
              />
              <select v-model="param.type" class="param-select">
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="datetime">DateTime</option>
              </select>
              <input 
                v-model="param.defaultValue"
                :type="param.type === 'number' ? 'number' : param.type"
                class="param-input"
                placeholder="Default value"
              />
              <button @click="removeParameter(index)" class="remove-param-btn">✕</button>
            </div>
          </div>

          <!-- Data Mapping -->
          <div class="form-group">
            <label class="form-label">Data Field Mapping</label>
            <div class="mapping-row">
              <label class="mapping-label">Label Field:</label>
              <input 
                v-model="form.labelField"
                type="text" 
                class="mapping-input"
                placeholder="e.g., label, name, region"
              />
            </div>
            <div class="mapping-row">
              <label class="mapping-label">Value Field:</label>
              <input 
                v-model="form.valueField"
                type="text" 
                class="mapping-input"
                placeholder="e.g., value, amount, total"
              />
            </div>
          </div>

          <!-- Chart Styling -->
          <div class="form-group">
            <label class="form-label">Chart Styling</label>
            <div class="style-grid">
              <div class="style-item">
                <label>Colors (comma separated)</label>
                <input 
                  v-model="form.colors"
                  type="text" 
                  class="form-input"
                  placeholder="#A4FF00, #00A3FF, #FF6B35"
                />
              </div>
              <div class="style-item">
                <label>Height (px)</label>
                <input 
                  v-model.number="form.height"
                  type="number" 
                  class="form-input"
                  placeholder="200"
                />
              </div>
              <div class="style-item checkbox-item">
                <input 
                  v-model="form.showLegend"
                  type="checkbox" 
                  id="showLegend"
                />
                <label for="showLegend">Show Legend</label>
              </div>
              <div class="style-item checkbox-item">
                <input 
                  v-model="form.showGrid"
                  type="checkbox" 
                  id="showGrid"
                />
                <label for="showGrid">Show Grid</label>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="$emit('close')" class="btn-cancel">Cancel</button>
          <button @click="handleSave" class="btn-save">
            {{ editChart ? 'Update Chart' : 'Create Chart' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'ChartBuilder',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    editChart: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const testing = ref(false)
    
    const defaultForm = () => ({
      title: '',
      type: 'bar',
      sourceType: 'query',
      query: '',
      apiEndpoint: '',
      entityName: '',
      templateName: '',
      parameters: [],
      labelField: 'label',
      valueField: 'value',
      colors: '#A4FF00, #00A3FF, #FF6B35',
      height: 200,
      showLegend: true,
      showGrid: true
    })

    const form = ref(defaultForm())

    // Watch for edit mode
    watch(() => props.editChart, (newVal) => {
      if (newVal) {
        form.value = { ...newVal }
      } else {
        form.value = defaultForm()
      }
    }, { immediate: true })

    const addParameter = () => {
      form.value.parameters.push({
        name: '',
        type: 'text',
        defaultValue: ''
      })
    }

    const removeParameter = (index) => {
      form.value.parameters.splice(index, 1)
    }

    const testQuery = async () => {
      testing.value = true
      // Simulate API call
      setTimeout(() => {
        testing.value = false
        alert('Query test successful! Sample data returned.')
      }, 1500)
    }

    const handleSave = () => {
      if (!form.value.title) {
        alert('Please enter a chart title')
        return
      }

      if (form.value.sourceType === 'query' && !form.value.query) {
        alert('Please enter a SQL query')
        return
      }

      emit('save', { ...form.value })
      form.value = defaultForm()
    }

    return {
      form,
      testing,
      addParameter,
      removeParameter,
      testQuery,
      handleSave
    }
  }
}
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

/* Modal Container */
.modal-container {
  background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
  border-radius: 20px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

/* Modal Header */
.modal-header {
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: #ffffff;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(90deg);
}

/* Modal Body */
.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

/* Form Groups */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #424242;
  margin-bottom: 8px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 12px 16px;
  color: #9b9b9b;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #A4FF00;
  background: rgba(255, 255, 255, 0.08);
}

.form-textarea {
  font-family: 'Courier New', monospace;
  resize: vertical;
  min-height: 120px;
}

.test-btn {
  margin-top: 8px;
  background: rgba(0, 163, 255, 0.1);
  border: 1px solid rgba(0, 163, 255, 0.3);
  color: #00A3FF;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.test-btn:hover {
  background: rgba(0, 163, 255, 0.2);
}

/* Parameters */
.param-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.add-param-btn {
  background: rgba(164, 255, 0, 0.1);
  border: 1px solid rgba(164, 255, 0, 0.3);
  color: #A4FF00;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-param-btn:hover {
  background: rgba(164, 255, 0, 0.2);
}

.param-row {
  display: grid;
  grid-template-columns: 1fr 120px 1fr 40px;
  gap: 8px;
  margin-bottom: 8px;
}

.param-input,
.param-select {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 8px 12px;
  color: #616161;
  font-size: 13px;
}

.param-input:focus,
.param-select:focus {
  outline: none;
  border-color: #A4FF00;
}

.remove-param-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.3);
  color: #FF4757;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-param-btn:hover {
  background: rgba(255, 71, 87, 0.2);
}

/* Data Mapping */
.mapping-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
}

.mapping-label {
  font-size: 13px;
  color: #999;
  font-weight: 600;
}

.mapping-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 8px 12px;
  color: #ffffff;
  font-size: 13px;
}

.mapping-input:focus {
  outline: none;
  border-color: #A4FF00;
}

/* Styling Grid */
.style-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.style-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.style-item label {
  font-size: 12px;
  color: #999;
  font-weight: 600;
}

.checkbox-item {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.checkbox-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-item label {
  margin: 0;
  cursor: pointer;
}

/* Modal Footer */
.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 12px;
}

.btn-cancel,
.btn-save {
  flex: 1;
  padding: 14px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-save {
  background: linear-gradient(135deg, #A4FF00 0%, #7FCC00 100%);
  border: none;
  color: #000000;
  box-shadow: 0 4px 12px rgba(164, 255, 0, 0.3);
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(164, 255, 0, 0.4);
}

.btn-save:active {
  transform: translateY(0);
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}

/* Scrollbar */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Responsive */
@media (max-width: 640px) {
  .modal-container {
    max-width: 100%;
    border-radius: 20px 20px 0 0;
    max-height: 95vh;
  }

  .param-row {
    grid-template-columns: 1fr;
  }

  .style-grid {
    grid-template-columns: 1fr;
  }

  .mapping-row {
    grid-template-columns: 1fr;
  }

  .mapping-label {
    margin-bottom: 4px;
  }
}
</style>
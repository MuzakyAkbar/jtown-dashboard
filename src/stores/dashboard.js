import { defineStore } from 'pinia'
import dashboardData from '@/assets/data.json'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    currentDate: 'Senin, 12 Januari 2025',
    revenue: dashboardData.revenue,
    monthProgress: dashboardData.monthProgress,
    receivables: dashboardData.receivables,
    hutang: dashboardData.hutang,
    budgeting: dashboardData.budgeting,
    cashflow: dashboardData.cashflow,
    activeNav: 'estatistic',
    customCharts: JSON.parse(localStorage.getItem('customCharts') || '[]')
  }),
  
  actions: {
    setActiveNav(nav) {
      this.activeNav = nav
    },
    
    updateDate(direction) {
      // Logic untuk update date (next/prev)
      const currentDateObj = new Date(this.currentDate.split(', ')[1])
      
      if (direction === 'next') {
        currentDateObj.setDate(currentDateObj.getDate() + 1)
      } else {
        currentDateObj.setDate(currentDateObj.getDate() - 1)
      }
      
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
      
      const dayName = days[currentDateObj.getDay()]
      const date = currentDateObj.getDate()
      const month = months[currentDateObj.getMonth()]
      const year = currentDateObj.getFullYear()
      
      this.currentDate = `${dayName}, ${date} ${month} ${year}`
    },

    setCustomCharts(charts) {
      this.customCharts = charts
      localStorage.setItem('customCharts', JSON.stringify(charts))
    },

    addCustomChart(chart) {
      this.customCharts.push({
        ...chart,
        id: Date.now()
      })
      this.saveCustomCharts()
    },

    updateCustomChart(id, chart) {
      const index = this.customCharts.findIndex(c => c.id === id)
      if (index !== -1) {
        this.customCharts[index] = { ...chart, id }
        this.saveCustomCharts()
      }
    },

    deleteCustomChart(id) {
      this.customCharts = this.customCharts.filter(c => c.id !== id)
      this.saveCustomCharts()
    },

    saveCustomCharts() {
      localStorage.setItem('customCharts', JSON.stringify(this.customCharts))
    },

    loadCustomCharts() {
      const saved = localStorage.getItem('customCharts')
      if (saved) {
        this.customCharts = JSON.parse(saved)
      }
    }
  }
})
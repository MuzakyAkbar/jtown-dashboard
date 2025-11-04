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
    activeNav: 'estatistic'
  }),
  
  actions: {
    setActiveNav(nav) {
      this.activeNav = nav
    },
    
    updateDate(direction) {
      // Logic untuk update date (next/prev)
      console.log('Update date:', direction)
    }
  }
})
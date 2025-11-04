<template>
  <div class="bottom-nav">
    <div class="nav-container">
      <div class="nav-item" @click="setActive('home')">
        <div :class="['nav-icon', activeNav === 'home' ? 'active' : 'inactive']">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" :stroke="activeNav === 'home' ? '#000' : '#9ca3af'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 22V12H15V22" :stroke="activeNav === 'home' ? '#000' : '#9ca3af'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span :class="['nav-label', activeNav === 'home' ? 'active' : 'inactive']">Home</span>
      </div>
      
      <div class="nav-item" @click="setActive('estatistic')">
        <div :class="['nav-icon', activeNav === 'estatistic' ? 'active' : 'inactive']">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 20V10" :stroke="activeNav === 'estatistic' ? '#000' : '#9ca3af'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 20V4" :stroke="activeNav === 'estatistic' ? '#000' : '#9ca3af'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 20V14" :stroke="activeNav === 'estatistic' ? '#000' : '#9ca3af'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span :class="['nav-label', activeNav === 'estatistic' ? 'active' : 'inactive']">Estatistic</span>
      </div>
      
      <div class="nav-item" @click="setActive('profile')">
        <div :class="['nav-icon', activeNav === 'profile' ? 'active' : 'inactive']">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" :stroke="activeNav === 'profile' ? '#000' : '#9ca3af'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" :stroke="activeNav === 'profile' ? '#000' : '#9ca3af'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span :class="['nav-label', activeNav === 'profile' ? 'active' : 'inactive']">Profile</span>
      </div>
    </div>
  </div>
</template>

<script>
import { useDashboardStore } from '@/stores/dashboard'
import { computed } from 'vue'

export default {
  name: 'BottomNav',
  setup() {
    const store = useDashboardStore()
    
    const activeNav = computed(() => store.activeNav)
    
    const setActive = (nav) => {
      store.setActiveNav(nav)
    }
    
    return {
      activeNav,
      setActive
    }
  }
}
</script>
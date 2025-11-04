<template>
  <div class="bottom-nav">
    <div class="nav-container">
      <div class="nav-item" @click="setActive('home')">
        <div :class="['nav-icon', activeNav === 'home' ? 'active' : 'inactive']"></div>
        <span :class="['nav-label', activeNav === 'home' ? 'active' : 'inactive']">Home</span>
      </div>
      <div class="nav-item" @click="setActive('estatistic')">
        <div :class="['nav-icon', activeNav === 'estatistic' ? 'active' : 'inactive']"></div>
        <span :class="['nav-label', activeNav === 'estatistic' ? 'active' : 'inactive']">Estatistic</span>
      </div>
      <div class="nav-item" @click="setActive('profile')">
        <div :class="['nav-icon', activeNav === 'profile' ? 'active' : 'inactive']"></div>
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
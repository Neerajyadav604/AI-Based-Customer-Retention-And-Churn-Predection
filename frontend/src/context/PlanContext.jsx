import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getPlan } from '../api'
import { useAuth } from './AuthContext'

const PlanContext = createContext(null)

// Keep GET /plan/me available to the sidebar and predict pages.
export function PlanProvider({ children }) {
  const { token } = useAuth()
  const [planInfo, setPlanInfo] = useState(null)

  const refreshPlan = useCallback(async () => {
    if (!token) {
      setPlanInfo(null)
      return
    }
    try {
      setPlanInfo(await getPlan())
    } catch {
      setPlanInfo(null)
    }
  }, [token])

  useEffect(() => {
    // Plan refresh is an external request; its result updates local state asynchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshPlan()
  }, [refreshPlan])

  useEffect(() => {
    function onPlanUpdated() {
      refreshPlan()
    }
    window.addEventListener('plan-updated', onPlanUpdated)
    return () => window.removeEventListener('plan-updated', onPlanUpdated)
  }, [refreshPlan])

  return (
    <PlanContext.Provider value={{ planInfo, refreshPlan }}>
      {children}
    </PlanContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePlan() {
  return useContext(PlanContext)
}

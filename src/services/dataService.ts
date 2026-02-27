import { Employee, Criterion, SavedEvaluation, Department } from '../../types';
import { DEFAULT_CRITERIA, DEPARTMENTS } from '../../constants';

const API_URL = '/api/data';
const STORAGE_KEY = 'app_data_v1';

export interface AppData {
  employees: Employee[];
  departments: Department[];
  criteria: Criterion[];
  evaluations: SavedEvaluation[];
}

const getInitialData = (): AppData => ({
  employees: [],
  departments: DEPARTMENTS,
  criteria: DEFAULT_CRITERIA as Criterion[], // Cast to match type if needed
  evaluations: []
});

export const dataService = {
  async loadData(): Promise<AppData> {
    try {
      // Try fetching from API first (for local server environment)
      const url = `${API_URL}?_=${new Date().getTime()}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        return {
          employees: data.employees || [],
          departments: data.departments || DEPARTMENTS,
          criteria: data.criteria || DEFAULT_CRITERIA,
          evaluations: data.evaluations || []
        };
      } else {
        throw new Error('API not available');
      }
    } catch (error) {
      console.warn('API unavailable, falling back to LocalStorage:', error);
      
      // Fallback to LocalStorage (for Vercel/Static deployments)
      const localData = localStorage.getItem(STORAGE_KEY);
      if (localData) {
        return JSON.parse(localData);
      }
      
      // If no local data, return initial constants
      return getInitialData();
    }
  },

  async saveData(data: AppData): Promise<void> {
    // Always save to LocalStorage as backup/primary for static sites
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    try {
      // Try saving to API (for local server environment)
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok && response.status !== 404) {
        console.error('Failed to sync with server');
      }
    } catch (error) {
      // Ignore API errors in static mode, as we already saved to LocalStorage
      console.warn('API save failed, data saved locally only.');
    }
  }
};

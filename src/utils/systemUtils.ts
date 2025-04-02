/**
 * Utility functions for system settings
 */

type SystemSettings = {
  maintenanceMode: boolean;
  tradingEnabled: boolean;
  withdrawalsEnabled: boolean;
  depositEnabled: boolean;
  defaultFeePercentage: number;
  defaultLeverageLimit: number;
  dailyWithdrawalLimit: number;
  theme: 'light' | 'dark';
  defaultTokens: string[];
  announcementBanner: string;
};

// Default system settings
export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  maintenanceMode: false,
  tradingEnabled: true,
  withdrawalsEnabled: true,
  depositEnabled: true,
  defaultFeePercentage: 0.5,
  defaultLeverageLimit: 10,
  dailyWithdrawalLimit: 10000,
  theme: 'dark',
  defaultTokens: ['BTC', 'ETH', 'SOL'],
  announcementBanner: ''
};

/**
 * Get the current system settings from localStorage
 */
export const getSystemSettings = (): SystemSettings => {
  if (typeof window === 'undefined') {
    return DEFAULT_SYSTEM_SETTINGS;
  }
  
  try {
    const storedSettings = localStorage.getItem('systemSettings');
    if (storedSettings) {
      return JSON.parse(storedSettings);
    }
  } catch (error) {
    console.error('Error loading system settings:', error);
  }
  
  return DEFAULT_SYSTEM_SETTINGS;
};

/**
 * Save system settings to localStorage
 */
export const saveSystemSettings = (settings: SystemSettings): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    localStorage.setItem('systemSettings', JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving system settings:', error);
    return false;
  }
};

/**
 * Check if the platform is in maintenance mode
 */
export const isMaintenanceMode = (): boolean => {
  const settings = getSystemSettings();
  return settings.maintenanceMode;
};

/**
 * Check if trading is currently enabled
 */
export const isTradingEnabled = (): boolean => {
  const settings = getSystemSettings();
  return !settings.maintenanceMode && settings.tradingEnabled;
};

/**
 * Get the announcement banner text if available
 */
export const getAnnouncementBanner = (): string => {
  const settings = getSystemSettings();
  return settings.announcementBanner || '';
};

/**
 * Get the current trading fee percentage
 */
export const getTradingFeePercentage = (): number => {
  const settings = getSystemSettings();
  return settings.defaultFeePercentage;
};

/**
 * Generate sample data for the system
 */
export const initializeSystemData = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Initialize system settings if they don't exist
  if (!localStorage.getItem('systemSettings')) {
    saveSystemSettings(DEFAULT_SYSTEM_SETTINGS);
  }
}; 
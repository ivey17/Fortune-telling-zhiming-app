import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { fetchWithAuth } from '../services/api';

interface UserContextType {
  profile: any;
  history: any[];
  coupons: any[];
  loading: boolean;
  refreshProfile: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  refreshCoupons: () => Promise<void>;
  refreshAll: () => Promise<void>;
  clearUser: () => void;
  hideBirth: boolean;
  setHideBirth: (val: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Cache to prevent redundant fetches
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hideBirth, setHideBirthState] = useState(() => {
    return localStorage.getItem('hideBirth') === 'true';
  });

  const setHideBirth = useCallback((val: boolean) => {
    setHideBirthState(val);
    localStorage.setItem('hideBirth', val.toString());
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const data = await fetchWithAuth('/api/user/profile');
      setProfile(data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  }, []);

  const refreshHistory = useCallback(async () => {
    try {
      const data = await fetchWithAuth('/api/user/history');
      setHistory(data.map((item: any) => ({
        id: item.id,
        date: new Date(item.created_at).toISOString().split('T')[0],
        title: item.title || (item.type === 'fortune' ? '运势解析' : '起卦追问'),
        type: item.type,
        summary: item.summary || (item.type === 'fortune' ? '今日运势解析。' : '得卦解析结果。'),
        messages: JSON.parse(item.messages || '[]')
      })));
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  }, []);

  const refreshCoupons = useCallback(async () => {
    try {
      const data = await fetchWithAuth('/api/user/coupons');
      setCoupons(data.map((c: any) => ({
        id: c.id,
        code: c.code,
        discount: c.discount_amount,
        minAmount: c.min_purchase_amount,
        expireDate: new Date(c.expires_at).toISOString().split('T')[0],
        status: c.is_active ? 'active' : 'expired',
        tag: '限时优惠',
        discount_text: `¥${c.discount_amount}`,
        title: `${c.discount_amount}元现金券`
      })));
    } catch (err) {
      console.error('Failed to fetch coupons', err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([refreshProfile(), refreshHistory(), refreshCoupons()]);
    setLoading(false);
  }, [refreshProfile, refreshHistory, refreshCoupons]);

  const clearUser = useCallback(() => {
    setProfile(null);
    setHistory([]);
    setCoupons([]);
    setLoading(false);
  }, []);

  return (
    <UserContext.Provider value={{
      profile,
      history,
      coupons,
      loading,
      refreshProfile,
      refreshHistory,
      refreshCoupons,
      refreshAll,
      clearUser,
      hideBirth,
      setHideBirth
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

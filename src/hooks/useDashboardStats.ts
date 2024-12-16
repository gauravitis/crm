import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

interface DashboardStats {
  totalClients: number;
  totalItems: number;
  recentClients: Array<{ id: string; name: string; email: string; createdAt: Date }>;
  recentItems: Array<{ id: string; name: string; price: number; createdAt: Date }>;
  totalInventoryValue: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalItems: 0,
    recentClients: [],
    recentItems: [],
    totalInventoryValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch clients
        const clientsSnapshot = await getDocs(collection(db, 'clients'));
        const totalClients = clientsSnapshot.size;

        // Fetch recent clients
        const recentClientsQuery = query(
          collection(db, 'clients'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentClientsSnapshot = await getDocs(recentClientsQuery);
        const recentClients = recentClientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));

        // Fetch items
        const itemsSnapshot = await getDocs(collection(db, 'items'));
        const totalItems = itemsSnapshot.size;
        let totalInventoryValue = 0;

        // Calculate total inventory value and get recent items
        const allItems = itemsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));

        allItems.forEach(item => {
          totalInventoryValue += item.price || 0;
        });

        // Sort items by createdAt and get the 5 most recent
        const recentItems = allItems
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5);

        setStats({
          totalClients,
          totalItems,
          recentClients,
          recentItems,
          totalInventoryValue,
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}

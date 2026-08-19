import React from 'react';
import { LayoutDashboard, Truck, Package, ShoppingCart, Activity } from 'lucide-react';

export default function NavTabs({ activeTab, setActiveTab, problemsSummary }) {
  const tabs = [
    { id: 'overview', label: 'Executive Control Tower', icon: LayoutDashboard, badge: null },
    { id: 'delivery', label: 'Delivery ML Center', icon: Truck, badge: problemsSummary?.delivery_problems },
    { id: 'inventory', label: 'Inventory ML Intelligence', icon: Package, badge: problemsSummary?.inventory_problems },
    { id: 'procurement', label: 'Procurement Analytics', icon: ShoppingCart, badge: problemsSummary?.procurement_problems },
    { id: 'operations', label: 'Operations Hub', icon: Activity, badge: null },
  ];

  return (
    <nav className="nav-bar">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            className={`nav-tab ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <Icon size={18} />
            <span>{t.label}</span>
            {t.badge > 0 && <span className="badge-count">{t.badge}</span>}
          </button>
        );
      })}
    </nav>
  );
}

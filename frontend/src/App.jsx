import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import NavTabs from './components/NavTabs';
import DetailModal from './components/DetailModal';
import ChatWidget from './components/ChatWidget';

import OverviewView from './views/OverviewView';
import DeliveryView from './views/DeliveryView';
import InventoryView from './views/InventoryView';
import ProcurementView from './views/ProcurementView';
import OperationsView from './views/OperationsView';

import {
  fetchHealth,
  fetchGoldSummary,
  fetchDeliveryPredictions,
  fetchDeliveryFeatures,
  fetchInventoryPredictions,
  fetchInventoryFeatures,
  fetchProcurementPredictions,
  fetchProcurementFeatures,
  fetchOperationalKpis,
  fetchTopProducts,
  fetchOrders,
  fetchProducts,
  fetchSuppliers,
  fetchShipments,
  fetchInventory,
} from './apiService';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Theme state: default to 'light' (normal) theme
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sc_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sc_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Health & Summary Data
  const [health, setHealth] = useState(null);
  const [goldSummary, setGoldSummary] = useState(null);

  // ML Databricks Gold Data
  const [deliveryPreds, setDeliveryPreds] = useState([]);
  const [deliveryFeats, setDeliveryFeats] = useState([]);
  const [inventoryPreds, setInventoryPreds] = useState([]);
  const [inventoryFeats, setInventoryFeats] = useState([]);
  const [procurementPreds, setProcurementPreds] = useState([]);
  const [procurementFeats, setProcurementFeats] = useState([]);

  // Live Operations Data
  const [kpis, setKpis] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [inventory, setInventory] = useState([]);

  // Detail Modal Drawer
  const [modalItem, setModalItem] = useState(null);
  const [modalTitle, setModalTitle] = useState('');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        healthRes,
        summaryRes,
        delivPredRes,
        delivFeatRes,
        invPredRes,
        invFeatRes,
        procPredRes,
        procFeatRes,
        kpiRes,
        topProdRes,
        ordersRes,
        prodsRes,
        suppsRes,
        shipmentsRes,
        inventoryRes,
      ] = await Promise.all([
        fetchHealth(),
        fetchGoldSummary(),
        fetchDeliveryPredictions(),
        fetchDeliveryFeatures(),
        fetchInventoryPredictions(),
        fetchInventoryFeatures(),
        fetchProcurementPredictions(),
        fetchProcurementFeatures(),
        fetchOperationalKpis(),
        fetchTopProducts({ limit: 10 }),
        fetchOrders(),
        fetchProducts(),
        fetchSuppliers(),
        fetchShipments(),
        fetchInventory(),
      ]);

      setHealth(healthRes);
      setGoldSummary(summaryRes);
      setDeliveryPreds(delivPredRes);
      setDeliveryFeats(delivFeatRes);
      setInventoryPreds(invPredRes);
      setInventoryFeats(invFeatRes);
      setProcurementPreds(procPredRes);
      setProcurementFeats(procFeatRes);
      setKpis(kpiRes);
      setTopProducts(topProdRes);
      setOrders(ordersRes);
      setProducts(prodsRes);
      setSuppliers(suppsRes);
      setShipments(shipmentsRes);
      setInventory(inventoryRes);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleItemClick = (item, title) => {
    setModalItem(item);
    setModalTitle(title);
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar health={health} onRefresh={loadAllData} loading={loading} theme={theme} toggleTheme={toggleTheme} />

      {/* Main Tab Bar */}
      <NavTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        problemsSummary={goldSummary?.detected_problems_summary}
      />

      {/* Page Content */}
      <main className="main-content">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Connecting to Databricks SQL Warehouse & ML Endpoints...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <OverviewView
                goldSummary={goldSummary}
                kpis={kpis}
                topProducts={topProducts}
                onSelectTab={setActiveTab}
              />
            )}

            {activeTab === 'delivery' && (
              <DeliveryView
                predictions={deliveryPreds}
                features={deliveryFeats}
                onItemClick={handleItemClick}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryView
                predictions={inventoryPreds}
                features={inventoryFeats}
                onItemClick={handleItemClick}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'procurement' && (
              <ProcurementView
                predictions={procurementPreds}
                features={procurementFeats}
                onItemClick={handleItemClick}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'operations' && (
              <OperationsView
                orders={orders}
                shipments={shipments}
                inventory={inventory}
                products={products}
                suppliers={suppliers}
                onItemClick={handleItemClick}
                onRefresh={loadAllData}
              />
            )}
          </>
        )}
      </main>

      {/* Glass Modal Drawer */}
      {modalItem && (
        <DetailModal
          item={modalItem}
          title={modalTitle}
          onClose={() => setModalItem(null)}
        />
      )}

      {/* AI Supply Chain Copilot Widget */}
      <ChatWidget
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onItemClick={handleItemClick}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Pagination from '../components/Pagination';

export default function OperationsView({ orders = [], shipments = [], inventory = [], products = [], suppliers = [], onItemClick }) {
  const [subTab, setSubTab] = useState('orders');
  const [search, setSearch] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    setCurrentPage(1);
  }, [subTab, search]);

  const getProductName = (pid) => {
    const prod = products.find((p) => p.product_id === pid);
    return prod ? prod.product_name : pid;
  };

  const term = search.toLowerCase();

  const filteredOrders = orders.filter(
    (o) =>
      !term ||
      o.order_id?.toLowerCase().includes(term) ||
      o.customer_id?.toLowerCase().includes(term) ||
      o.product_id?.toLowerCase().includes(term) ||
      o.warehouse_id?.toLowerCase().includes(term)
  );

  const filteredShipments = shipments.filter(
    (s) =>
      !term ||
      s.shipment_id?.toLowerCase().includes(term) ||
      s.order_id?.toLowerCase().includes(term) ||
      s.carrier_id?.toLowerCase().includes(term) ||
      s.carrier_name?.toLowerCase().includes(term) ||
      s.origin?.toLowerCase().includes(term) ||
      s.destination?.toLowerCase().includes(term)
  );

  const filteredInventory = inventory.filter(
    (i) =>
      !term ||
      i.product_id?.toLowerCase().includes(term) ||
      i.warehouse_id?.toLowerCase().includes(term) ||
      getProductName(i.product_id).toLowerCase().includes(term)
  );

  const filteredProducts = products.filter(
    (p) =>
      !term ||
      p.product_id?.toLowerCase().includes(term) ||
      p.product_name?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term)
  );

  const filteredSuppliers = suppliers.filter(
    (s) =>
      !term ||
      s.supplier_id?.toLowerCase().includes(term) ||
      s.supplier_name?.toLowerCase().includes(term) ||
      s.country?.toLowerCase().includes(term)
  );

  const getCurrentDataset = () => {
    switch (subTab) {
      case 'orders':
        return filteredOrders;
      case 'shipments':
        return filteredShipments;
      case 'inventory':
        return filteredInventory;
      case 'products':
        return filteredProducts;
      case 'suppliers':
        return filteredSuppliers;
      default:
        return [];
    }
  };

  const currentDataset = getCurrentDataset();

  const getPaginatedData = (dataset) => {
    if (pageSize === 'ALL') return dataset;
    const start = (currentPage - 1) * pageSize;
    return dataset.slice(start, start + pageSize);
  };

  return (
    <div>
      <div className="sub-nav">
        <div className="sub-tabs">
          <button className={`sub-tab ${subTab === 'orders' ? 'active' : ''}`} onClick={() => setSubTab('orders')}>
            Orders ({orders.length.toLocaleString()})
          </button>
          <button className={`sub-tab ${subTab === 'shipments' ? 'active' : ''}`} onClick={() => setSubTab('shipments')}>
            Shipments ({shipments.length.toLocaleString()})
          </button>
          <button className={`sub-tab ${subTab === 'inventory' ? 'active' : ''}`} onClick={() => setSubTab('inventory')}>
            Inventory Stock ({inventory.length.toLocaleString()})
          </button>
          <button className={`sub-tab ${subTab === 'products' ? 'active' : ''}`} onClick={() => setSubTab('products')}>
            Product Master ({products.length.toLocaleString()})
          </button>
          <button className={`sub-tab ${subTab === 'suppliers' ? 'active' : ''}`} onClick={() => setSubTab('suppliers')}>
            Supplier Master ({suppliers.length.toLocaleString()})
          </button>
        </div>

        <div className="filter-bar">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search records dynamic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Orders */}
      {subTab === 'orders' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer ID</th>
                <th>Product ID</th>
                <th>Warehouse ID</th>
                <th>Ordered Qty</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Order Date</th>
              </tr>
            </thead>
            <tbody>
              {getPaginatedData(filteredOrders).map((item) => (
                <tr key={item.order_id} onClick={() => onItemClick(item, 'Order Detail')}>
                  <td><strong style={{ color: 'var(--accent-cyan)' }}>{item.order_id}</strong></td>
                  <td>{item.customer_id}</td>
                  <td>{item.product_id}</td>
                  <td>{item.warehouse_id}</td>
                  <td><strong>{item.ordered_quantity}</strong></td>
                  <td><span className={`badge ${(item.priority || 'MEDIUM').toLowerCase()}`}>{item.priority}</span></td>
                  <td><span className={`badge ${(item.order_status || 'DELIVERED').toLowerCase()}`}>{item.order_status}</span></td>
                  <td>{item.order_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Shipments */}
      {subTab === 'shipments' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Shipment ID</th>
                <th>Order ID</th>
                <th>Carrier ID / Name</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Distance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {getPaginatedData(filteredShipments).map((item) => (
                <tr key={item.shipment_id} onClick={() => onItemClick(item, 'Shipment Detail')}>
                  <td><strong style={{ color: 'var(--accent-cyan)' }}>{item.shipment_id}</strong></td>
                  <td>{item.order_id}</td>
                  <td>{item.carrier_name || item.carrier_id}</td>
                  <td>{item.origin}</td>
                  <td>{item.destination}</td>
                  <td>{item.distance_km ? `${item.distance_km} km` : '—'}</td>
                  <td><span className={`badge ${(item.shipment_status || 'TRANSIT').toLowerCase()}`}>{item.shipment_status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Inventory */}
      {subTab === 'inventory' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Warehouse</th>
                <th>Available Stock</th>
                <th>Reorder Point</th>
                <th>Safety Stock</th>
                <th>Stock Status</th>
              </tr>
            </thead>
            <tbody>
              {getPaginatedData(filteredInventory).map((item, idx) => (
                <tr key={idx} onClick={() => onItemClick(item, 'Inventory Detail')}>
                  <td><strong style={{ color: 'var(--accent-cyan)' }}>{item.product_id}</strong></td>
                  <td>{item.product_name || getProductName(item.product_id)}</td>
                  <td>{item.warehouse_id}</td>
                  <td><strong>{item.available_quantity !== undefined ? item.available_quantity.toLocaleString() : '—'}</strong></td>
                  <td>{item.reorder_point !== undefined ? item.reorder_point.toLocaleString() : '—'}</td>
                  <td>{item.safety_stock !== undefined ? item.safety_stock.toLocaleString() : '—'}</td>
                  <td>
                    <span className={`badge ${(item.stock_status || 'OPTIMAL').toLowerCase()}`}>
                      {item.stock_status || 'OPTIMAL'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Products */}
      {subTab === 'products' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Unit Cost</th>
                <th>Selling Price</th>
                <th>Supplier ID</th>
              </tr>
            </thead>
            <tbody>
              {getPaginatedData(filteredProducts).map((item) => (
                <tr key={item.product_id} onClick={() => onItemClick(item, 'Product Master Detail')}>
                  <td><strong style={{ color: 'var(--accent-cyan)' }}>{item.product_id}</strong></td>
                  <td>{item.product_name}</td>
                  <td><span className="badge info">{item.category}</span></td>
                  <td>{item.subcategory}</td>
                  <td>${item.unit_cost}</td>
                  <td><strong>${item.selling_price}</strong></td>
                  <td>{item.supplier_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Suppliers */}
      {subTab === 'suppliers' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Supplier ID</th>
                <th>Supplier Name</th>
                <th>Location</th>
                <th>Country</th>
                <th>Supplier Rating</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {getPaginatedData(filteredSuppliers).map((item) => (
                <tr key={item.supplier_id} onClick={() => onItemClick(item, 'Supplier Master Detail')}>
                  <td><strong style={{ color: 'var(--accent-cyan)' }}>{item.supplier_id}</strong></td>
                  <td>{item.supplier_name}</td>
                  <td>{item.location}</td>
                  <td>{item.country}</td>
                  <td><strong style={{ color: 'var(--accent-amber)' }}>{item.supplier_rating} / 5.0</strong></td>
                  <td><span className={`badge ${(item.active_status || 'Active').toLowerCase()}`}>{item.active_status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalItems={currentDataset.length}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}

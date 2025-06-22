import React, { useState, useEffect } from 'react';
import './App.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line, Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PaintPro = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingZakazka, setEditingZakazka] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  // Kompletní data ze screenshotů
  const [zakazkyData, setZakazkyData] = useState([
    { id: 1, datum: '11. 6. 2025', klient: 'MVC', druh: 'XY', cislo: '202501', castka: 4000, fee: 1040, material: 0, pomucka: 0, palivo: 0, zisk: 2960 },
    { id: 2, datum: '9. 6. 2025', klient: 'Adam', druh: 'XY', cislo: '104470', castka: 7200, fee: 1872, material: 700, pomucka: 2000, palivo: 0, zisk: 2628 },
    { id: 3, datum: '5. 6. 2025', klient: 'Adam', druh: 'XY', cislo: '95105', castka: 11800, fee: 2964, material: 700, pomucka: 2000, palivo: 300, zisk: 5436 },
    { id: 4, datum: '14. 5. 2025', klient: 'Adam', druh: 'XY', cislo: '80067', castka: 7600, fee: 1976, material: 700, pomucka: 2000, palivo: 300, zisk: 2924 },
    { id: 5, datum: '13. 5. 2025', klient: 'Adam', druh: 'XY', cislo: '87470', castka: 6400, fee: 1664, material: 700, pomucka: 2000, palivo: 300, zisk: 1736 },
    { id: 6, datum: '10. 5. 2025', klient: 'Adam', druh: 'XY', cislo: '91353', castka: 24000, fee: 6240, material: 0, pomucka: 15780, palivo: 0, zisk: 2000 },
    { id: 7, datum: '24. 4. 2025', klient: 'Adam', druh: 'XY', cislo: '90660', castka: 13200, fee: 3432, material: 0, pomucka: 0, palivo: 0, zisk: 9768 },
    { id: 8, datum: '22. 4. 2025', klient: 'Adam', druh: 'XY', cislo: '95247', castka: 17800, fee: 4628, material: 300, pomucka: 700, palivo: 0, zisk: 12172 },
    { id: 9, datum: '19. 4. 2025', klient: 'Adam', druh: 'XY', cislo: '91510', castka: 10600, fee: 2756, material: 200, pomucka: 1000, palivo: 2500, zisk: 4144 },
    { id: 10, datum: '16. 4. 2025', klient: 'Adam', druh: 'XY', cislo: '91417', castka: 8600, fee: 2184, material: 500, pomucka: 1000, palivo: 1500, zisk: 3416 },
    { id: 11, datum: '15. 3. 2025', klient: 'Ostatní', druh: 'XY', cislo: '18001', castka: 5700, fee: 1462, material: 300, pomucka: 1000, palivo: 0, zisk: 2938 },
    { id: 12, datum: '26. 2. 2025', klient: 'Adam', druh: 'XY', cislo: '14974', castka: 5600, fee: 1456, material: 300, pomucka: 400, palivo: 0, zisk: 3444 },
    { id: 13, datum: '23. 2. 2025', klient: 'Adam', druh: 'XY', cislo: '13161', castka: 8400, fee: 1684, material: 300, pomucka: 400, palivo: 0, zisk: 4016 },
    { id: 14, datum: '27. 1. 2025', klient: 'Adam', druh: 'XY', cislo: '14347', castka: 8700, fee: 1743, material: 300, pomucka: 1000, palivo: 0, zisk: 5657 }
  ]);

  // Dynamicky počítané dashboard data
  const dashboardData = React.useMemo(() => {
    const celkoveTrzby = zakazkyData.reduce((sum, z) => sum + z.castka, 0);
    const celkovyZisk = zakazkyData.reduce((sum, z) => sum + z.zisk, 0);
    const pocetZakazek = zakazkyData.length;
    const prumernyZisk = Math.round(celkovyZisk / pocetZakazek);

    return {
      celkoveTrzby: celkoveTrzby.toLocaleString(),
      celkovyZisk: celkovyZisk.toLocaleString(),
      pocetZakazek: pocetZakazek.toString(),
      prumernyZisk: prumernyZisk.toLocaleString(),
      mesicniData: {
        labels: ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čer'],
        values: [8657, 4016, 2938, 19732, 11560, 11400]
      },
      rozlozeniData: {
        labels: ['Adam', 'MVC', 'Ostatní'],
        values: [
          zakazkyData.filter(z => z.klient === 'Adam').reduce((sum, z) => sum + z.zisk, 0),
          zakazkyData.filter(z => z.klient === 'MVC').reduce((sum, z) => sum + z.zisk, 0),
          zakazkyData.filter(z => z.klient === 'Ostatní').reduce((sum, z) => sum + z.zisk, 0)
        ],
        colors: ['#4F46E5', '#10B981', '#F59E0B']
      }
    };
  }, [zakazkyData]);

  // Funkce pro přidání zakázky
  const addZakazka = (newZakazka) => {
    const id = Math.max(...zakazkyData.map(z => z.id)) + 1;
    const zisk = newZakazka.castka - newZakazka.fee - newZakazka.material - newZakazka.pomucka - newZakazka.palivo;
    setZakazkyData([...zakazkyData, { ...newZakazka, id, zisk }]);
    setShowAddModal(false);
  };

  // Funkce pro editaci zakázky
  const updateZakazka = (updatedZakazka) => {
    const zisk = updatedZakazka.castka - updatedZakazka.fee - updatedZakazka.material - updatedZakazka.pomucka - updatedZakazka.palivo;
    setZakazkyData(zakazkyData.map(z => z.id === updatedZakazka.id ? { ...updatedZakazka, zisk } : z));
    setShowEditModal(false);
    setEditingZakazka(null);
  };

  // Funkce pro smazání zakázky
  const deleteZakazka = (id) => {
    if (window.confirm('Opravdu chcete smazat tuto zakázku?')) {
      setZakazkyData(zakazkyData.filter(z => z.id !== id));
    }
  };

  // Funkce pro editaci
  const editZakazka = (zakazka) => {
    setEditingZakazka(zakazka);
    setShowEditModal(true);
  };

  // Aktualizovaná data pro kombinovaný graf
  const getCombinedChartData = () => {
    const months = ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čer'];
    const monthlyData = [];
    const yearlyData = [];

    months.forEach((month, index) => {
      // Měsíční data (simulovaná na základě skutečných dat)
      const monthValue = dashboardData.mesicniData.values[index] || 0;
      monthlyData.push(monthValue);
      
      // Roční data (vyšší hodnoty pro trend)
      const yearValue = monthValue * 1.5 + (index * 2000);
      yearlyData.push(yearValue);
    });

    return {
      labels: months,
      datasets: [
        {
          type: 'bar',
          label: 'Měsíční zisk',
          data: monthlyData,
          backgroundColor: (context) => {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return '#4F46E5';
            
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, 'rgba(79, 70, 229, 0.8)');
            gradient.addColorStop(0.5, 'rgba(79, 70, 229, 0.9)');
            gradient.addColorStop(1, 'rgba(99, 102, 241, 1)');
            return gradient;
          },
          borderColor: '#4F46E5',
          borderWidth: 0,
          borderRadius: 8,
          borderSkipped: false,
          barThickness: 24,
        },
        {
          type: 'bar',
          label: 'Roční trend',
          data: yearlyData,
          backgroundColor: (context) => {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return '#06B6D4';
            
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, 'rgba(6, 182, 212, 0.6)');
            gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.7)');
            gradient.addColorStop(1, 'rgba(8, 145, 178, 0.8)');
            return gradient;
          },
          borderColor: '#06B6D4',
          borderWidth: 0,
          borderRadius: 8,
          borderSkipped: false,
          barThickness: 24,
        },
        {
          type: 'line',
          label: 'Trend křivka',
          data: monthlyData.map((val, idx) => val + yearlyData[idx] * 0.1),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
        }
      ],
    };
  };

  const combinedChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: '500',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(31, 31, 83, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(79, 70, 229, 0.5)',
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} Kč`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 11,
            weight: '500',
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 11,
          },
          callback: function(value) {
            return value.toLocaleString() + ' Kč';
          }
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 8,
      },
      point: {
        hoverBackgroundColor: '#fff',
        hoverBorderWidth: 3,
      },
    },
  };

  const doughnutChartData = {
    labels: dashboardData.rozlozeniData.labels,
    datasets: [
      {
        data: dashboardData.rozlozeniData.values,
        backgroundColor: dashboardData.rozlozeniData.colors,
        borderWidth: 0,
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(31, 31, 83, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
      },
    },
  };

  const StatCard = ({ title, value, subtitle, icon, color, index }) => (
    <div
      className={`stat-card ${hoveredCard === index ? 'hovered' : ''}`}
      onMouseEnter={() => setHoveredCard(index)}
      onMouseLeave={() => setHoveredCard(null)}
    >
      <div className="stat-header">
        <div className="stat-title">{title}</div>
        <div className="stat-period">
          <span>1D</span>
          <span>7D</span>
          <span className="active">ALL</span>
        </div>
      </div>
      <div className="stat-content">
        <div className={`stat-icon ${color}`}>
          {icon}
        </div>
        <div className="stat-value">{value} Kč</div>
        <div className="stat-subtitle">{subtitle}</div>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">🎨</div>
          <div className="logo-text">
            <div className="logo-title">PaintPro</div>
            <div className="logo-subtitle">Project Manager</div>
          </div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <div
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span className="nav-icon">📊</span>
          Dashboard
        </div>
        <div
          className={`nav-item ${activeTab === 'zakazky' ? 'active' : ''}`}
          onClick={() => setActiveTab('zakazky')}
        >
          <span className="nav-icon">📋</span>
          Zakázky
        </div>
        <div
          className={`nav-item ${activeTab === 'reporty' ? 'active' : ''}`}
          onClick={() => setActiveTab('reporty')}
        >
          <span className="nav-icon">📈</span>
          Reporty
        </div>
        <div
          className={`nav-item ${activeTab === 'nastaveni' ? 'active' : ''}`}
          onClick={() => setActiveTab('nastaveni')}
        >
          <span className="nav-icon">⚙️</span>
          Nastavení
        </div>
      </nav>
    </div>
  );

  const Dashboard = () => (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Přehled výkonnosti a klíčových metrik</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="CELKOVÉ TRŽBY"
          value={dashboardData.celkoveTrzby}
          subtitle="Za posledních 30 dní"
          icon="💰"
          color="blue"
          index={0}
        />
        <StatCard
          title="CELKOVÝ ZISK"
          value={dashboardData.celkovyZisk}
          subtitle="Marže 45%"
          icon="📈"
          color="green"
          index={1}
        />
        <StatCard
          title="POČET ZAKÁZEK"
          value={dashboardData.pocetZakazek}
          subtitle="Aktivních zakázek"
          icon="📋"
          color="purple"
          index={2}
        />
        <StatCard
          title="PRŮMĚRNÝ ZISK"
          value={dashboardData.prumernyZisk}
          subtitle="Na zakázku"
          icon="🎯"
          color="orange"
          index={3}
        />
      </div>

      <div className="charts-grid">
        <div className="chart-card large">
          <div className="chart-header">
            <div>
              <h3>MĚSÍČNÍ PŘEHLED ZISKU</h3>
              <div className="chart-value">22 000 Kč</div>
            </div>
            <div className="chart-period">
              <span>1D</span>
              <span>7D</span>
              <span className="active">ALL</span>
            </div>
          </div>
          <div className="chart-container">
            <Bar data={getCombinedChartData()} options={combinedChartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>ROZLOŽENÍ PODLE DRUHU PŘÍJMŮ</h3>
              <div className="chart-value">76 000 Kč</div>
            </div>
            <div className="chart-period">
              <span>1D</span>
              <span>7D</span>
              <span className="active">ALL</span>
            </div>
          </div>
          <div className="chart-container">
            <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
          </div>
          <div className="chart-details">
            <div className="detail-row">
              <span>KATEGORIÍ</span>
              <span>3</span>
            </div>
            <div className="detail-row">
              <span>Nejvyšší náklady</span>
              <span>25 333 Kč</span>
            </div>
            <div className="detail-row">
              <span>Adam</span>
              <span>45 600 Kč</span>
            </div>
          </div>
        </div>
      </div>

      <div className="activity-grid">
        <div className="activity-card">
          <div className="activity-header">
            <h3>Nedávná aktivita</h3>
            <button className="view-all">Zobrazit vše</button>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon green">✓</div>
              <div className="activity-content">
                <div className="activity-title">Dokončena zakázka pro ROZNOV s.r.o.</div>
                <div className="activity-subtitle">Malířské práce</div>
                <div className="activity-value">+2 624 Kč zisk</div>
              </div>
              <div className="activity-time">2 hod</div>
            </div>
            <div className="activity-item">
              <div className="activity-icon blue">📋</div>
              <div className="activity-content">
                <div className="activity-title">Zakázka dokončena</div>
                <div className="activity-subtitle">Adam</div>
                <div className="activity-value">+2 624 Kč zisk</div>
              </div>
              <div className="activity-time">1 den</div>
            </div>
          </div>
        </div>

        <div className="activity-card">
          <div className="activity-header">
            <h3>Nejlepší zákazky</h3>
            <button className="view-all">Zobrazit vše</button>
          </div>
          <div className="customer-list">
            <div className="customer-item">
              <div className="customer-avatar">A</div>
              <div className="customer-content">
                <div className="customer-name">Adam</div>
                <div className="customer-subtitle">Celkem za 6 objednávek</div>
              </div>
              <div className="customer-value">17 800 Kč</div>
            </div>
            <div className="customer-item">
              <div className="customer-avatar">XY</div>
              <div className="customer-content">
                <div className="customer-name">XY</div>
                <div className="customer-subtitle">Celkem za 3 objednávky</div>
              </div>
              <div className="customer-value">11 400 Kč</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Modal komponenty
  const AddZakazkaModal = () => {
    const [formData, setFormData] = useState({
      datum: new Date().toISOString().split('T')[0],
      klient: '',
      druh: 'XY',
      cislo: '',
      castka: 0,
      fee: 0,
      material: 0,
      pomucka: 0,
      palivo: 0
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const processedData = {
        ...formData,
        datum: new Date(formData.datum).toLocaleDateString('cs-CZ'),
        castka: Number(formData.castka),
        fee: Number(formData.fee),
        material: Number(formData.material),
        pomucka: Number(formData.pomucka),
        palivo: Number(formData.palivo)
      };
      addZakazka(processedData);
    };

    if (!showAddModal) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Přidat novou zakázku</h2>
            <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
          </div>
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-row">
              <div className="form-group">
                <label>Datum *</label>
                <input
                  type="date"
                  value={formData.datum}
                  onChange={e => setFormData({...formData, datum: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Klient *</label>
                <input
                  type="text"
                  value={formData.klient}
                  onChange={e => setFormData({...formData, klient: e.target.value})}
                  placeholder="Jméno klienta"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Druh práce</label>
                <select
                  value={formData.druh}
                  onChange={e => setFormData({...formData, druh: e.target.value})}
                >
                  <option value="XY">XY</option>
                  <option value="Malování">Malování</option>
                  <option value="Rekonstrukce">Rekonstrukce</option>
                </select>
              </div>
              <div className="form-group">
                <label>Číslo zakázky *</label>
                <input
                  type="text"
                  value={formData.cislo}
                  onChange={e => setFormData({...formData, cislo: e.target.value})}
                  placeholder="Číslo zakázky"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Částka (Kč) *</label>
                <input
                  type="number"
                  value={formData.castka}
                  onChange={e => setFormData({...formData, castka: e.target.value})}
                  placeholder="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Fee (Kč)</label>
                <input
                  type="number"
                  value={formData.fee}
                  onChange={e => setFormData({...formData, fee: e.target.value})}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Materiál (Kč)</label>
                <input
                  type="number"
                  value={formData.material}
                  onChange={e => setFormData({...formData, material: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label>Pomůcka (Kč)</label>
                <input
                  type="number"
                  value={formData.pomucka}
                  onChange={e => setFormData({...formData, pomucka: e.target.value})}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Palivo (Kč)</label>
              <input
                type="number"
                value={formData.palivo}
                onChange={e => setFormData({...formData, palivo: e.target.value})}
                placeholder="0"
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                Zrušit
              </button>
              <button type="submit" className="btn btn-primary">
                Přidat zakázku
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const EditZakazkaModal = () => {
    const [formData, setFormData] = useState(editingZakazka || {});

    React.useEffect(() => {
      if (editingZakazka) {
        const dateStr = editingZakazka.datum.split('. ').reverse().join('-').replace(' ', '');
        setFormData({
          ...editingZakazka,
          datum: dateStr
        });
      }
    }, [editingZakazka]);

    const handleSubmit = (e) => {
      e.preventDefault();
      const processedData = {
        ...formData,
        datum: new Date(formData.datum).toLocaleDateString('cs-CZ'),
        castka: Number(formData.castka),
        fee: Number(formData.fee),
        material: Number(formData.material),
        pomucka: Number(formData.pomucka),
        palivo: Number(formData.palivo)
      };
      updateZakazka(processedData);
    };

    if (!showEditModal || !editingZakazka) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Upravit zakázku</h2>
            <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
          </div>
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-row">
              <div className="form-group">
                <label>Datum *</label>
                <input
                  type="date"
                  value={formData.datum}
                  onChange={e => setFormData({...formData, datum: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Klient *</label>
                <input
                  type="text"
                  value={formData.klient}
                  onChange={e => setFormData({...formData, klient: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Druh práce</label>
                <select
                  value={formData.druh}
                  onChange={e => setFormData({...formData, druh: e.target.value})}
                >
                  <option value="XY">XY</option>
                  <option value="Malování">Malování</option>
                  <option value="Rekonstrukce">Rekonstrukce</option>
                </select>
              </div>
              <div className="form-group">
                <label>Číslo zakázky *</label>
                <input
                  type="text"
                  value={formData.cislo}
                  onChange={e => setFormData({...formData, cislo: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Částka (Kč) *</label>
                <input
                  type="number"
                  value={formData.castka}
                  onChange={e => setFormData({...formData, castka: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Fee (Kč)</label>
                <input
                  type="number"
                  value={formData.fee}
                  onChange={e => setFormData({...formData, fee: e.target.value})}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Materiál (Kč)</label>
                <input
                  type="number"
                  value={formData.material}
                  onChange={e => setFormData({...formData, material: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Pomůcka (Kč)</label>
                <input
                  type="number"
                  value={formData.pomucka}
                  onChange={e => setFormData({...formData, pomucka: e.target.value})}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Palivo (Kč)</label>
              <input
                type="number"
                value={formData.palivo}
                onChange={e => setFormData({...formData, palivo: e.target.value})}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                Zrušit
              </button>
              <button type="submit" className="btn btn-primary">
                Uložit změny
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const Zakazky = () => (
    <div className="zakazky">
      <AddZakazkaModal />
      <EditZakazkaModal />
      
      <div className="page-header">
        <div>
          <h1>Správa zakázek</h1>
          <p>Přehled a správa všech malířských zakázek s automatickým výpočtem zisku</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary">Export CSV</button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            Přidat zakázku
          </button>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-card">
          <div className="filter-header">
            <h3>FILTRY REPORTŮ</h3>
            <div className="filter-title">Správa zakázek</div>
          </div>
          <div className="filter-content">
            <div className="filter-row">
              <div className="filter-item">
                <label>Místní</label>
                <select>
                  <option>Všechny místní</option>
                </select>
              </div>
              <div className="filter-item">
                <label>Klient</label>
                <input type="text" placeholder="Hledat podle jména klienta..." />
              </div>
              <div className="filter-item">
                <label>Datum od</label>
                <input type="date" />
              </div>
              <div className="filter-item">
                <label>Datum do</label>
                <input type="date" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th></th>
                <th>DATUM</th>
                <th>KLIENT</th>
                <th>DRUH PRÁCE</th>
                <th>ID ZAKÁZKY</th>
                <th>ČÁSTKA</th>
                <th>FEE</th>
                <th>ČÁSTKA PO ODEČTENÍ FEE</th>
                <th>PALIVO</th>
                <th>MATERIÁL</th>
                <th>POMŮCKA</th>
                <th>ČISTÝ ZISK</th>
                <th>SOUDNOST</th>
                <th>AKCE</th>
              </tr>
            </thead>
            <tbody>
              {zakazkyData.map((zakazka) => (
                <tr key={zakazka.id} className="table-row">
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>{zakazka.datum}</td>
                  <td>{zakazka.klient}</td>
                  <td>{zakazka.druh}</td>
                  <td>{zakazka.cislo}</td>
                  <td>{zakazka.castka.toLocaleString()} Kč</td>
                  <td>{zakazka.fee.toLocaleString()} Kč</td>
                  <td>{(zakazka.castka - zakazka.fee).toLocaleString()} Kč</td>
                  <td>{zakazka.palivo.toLocaleString()} Kč</td>
                  <td>{zakazka.material.toLocaleString()} Kč</td>
                  <td>{zakazka.pomucka.toLocaleString()} Kč</td>
                  <td className="profit">{zakazka.zisk.toLocaleString()} Kč</td>
                  <td>
                    <span className="status-badge">Přidat soubor</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" onClick={() => editZakazka(zakazka)} title="Upravit">
                        ✏️
                      </button>
                      <button className="btn-icon" onClick={() => deleteZakazka(zakazka.id)} title="Smazat">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="table-footer">
          <div className="table-info">Zobrazeno 1 - {zakazkyData.length} z {zakazkyData.length} zakázek</div>
          <div className="pagination">
            <button className="btn-page active">1</button>
            <button className="btn-page">Další</button>
          </div>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-header">
            <h3>CELKOVÉ TRŽBY</h3>
            <div className="summary-period">
              <span>1D</span>
              <span>7D</span>
              <span className="active">ALL</span>
            </div>
          </div>
          <div className="summary-value">{dashboardData.celkoveTrzby} Kč</div>
          <div className="summary-subtitle">Za posledních 30 dní</div>
        </div>

        <div className="summary-card">
          <div className="summary-header">
            <h3>CELKOVÝ ZISK</h3>
            <div className="summary-period">
              <span>1D</span>
              <span>7D</span>
              <span className="active">ALL</span>
            </div>
          </div>
          <div className="summary-value">{dashboardData.celkovyZisk} Kč</div>
          <div className="summary-subtitle green">Marže {Math.round((parseInt(dashboardData.celkovyZisk.replace(/,/g, '')) / parseInt(dashboardData.celkoveTrzby.replace(/,/g, ''))) * 100)}%</div>
        </div>

        <div className="summary-card">
          <div className="summary-header">
            <h3>POČET ZAKÁZEK</h3>
            <div className="summary-period">
              <span>1D</span>
              <span>7D</span>
              <span className="active">ALL</span>
            </div>
          </div>
          <div className="summary-value">{dashboardData.pocetZakazek}</div>
          <div className="summary-subtitle">Aktivních zakázek</div>
        </div>
      </div>
    </div>
  );

  const Reporty = () => {
    // Příprava dat pro všechny 4 období
    const getAllPeriodsData = () => {
      const now = new Date();
      const periods = ['week', 'month', 'year', 'all'];
      const periodData = {};
      
      periods.forEach(period => {
        const filteredData = zakazkyData.filter(zakazka => {
          const zakazkaDate = new Date(zakazka.datum.split('. ').reverse().join('-'));
          
          switch(period) {
            case 'week':
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              return zakazkaDate >= weekAgo;
            case 'month':
              const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
              return zakazkaDate >= monthAgo;
            case 'year':
              const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
              return zakazkaDate >= yearAgo;
            case 'all':
            default:
              return true;
          }
        });
        
        periodData[period] = {
          celkoveTrzby: filteredData.reduce((sum, z) => sum + z.castka, 0),
          celkovyZisk: filteredData.reduce((sum, z) => sum + z.zisk, 0),
          pocetZakazek: filteredData.length,
          data: filteredData
        };
      });
      
      return periodData;
    };

    const allPeriods = getAllPeriodsData();

    // Individuální grafy pro každé období
    const getPeriodSpecificData = (period) => {
      const data = allPeriods[period].data;
      const chartData = { labels: [], values: [] };
      
      if (period === 'week') {
        // Posledních 7 dní
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayData = data.filter(z => {
            const zDate = new Date(z.datum.split('. ').reverse().join('-'));
            return zDate.toDateString() === date.toDateString();
          });
          chartData.labels.push(date.toLocaleDateString('cs-CZ', { weekday: 'short' }));
          chartData.values.push(dayData.reduce((sum, z) => sum + z.zisk, 0));
        }
      } else if (period === 'month') {
        // Posledních 4 týdny
        for (let i = 3; i >= 0; i--) {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() - i * 7);
          const startDate = new Date(endDate);
          startDate.setDate(startDate.getDate() - 6);
          
          const weekData = data.filter(z => {
            const zDate = new Date(z.datum.split('. ').reverse().join('-'));
            return zDate >= startDate && zDate <= endDate;
          });
          
          chartData.labels.push(`Týden ${4-i}`);
          chartData.values.push(weekData.reduce((sum, z) => sum + z.zisk, 0));
        }
      } else if (period === 'year') {
        // Posledních 12 měsíců
        const months = ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čer', 'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'];
        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthData = data.filter(z => {
            const zDate = new Date(z.datum.split('. ').reverse().join('-'));
            return zDate.getMonth() === date.getMonth() && zDate.getFullYear() === date.getFullYear();
          });
          chartData.labels.push(months[date.getMonth()]);
          chartData.values.push(monthData.reduce((sum, z) => sum + z.zisk, 0));
        }
      } else {
        // Celá doba - po měsících
        const monthlyData = {};
        data.forEach(z => {
          const zDate = new Date(z.datum.split('. ').reverse().join('-'));
          const key = `${zDate.getFullYear()}-${zDate.getMonth()}`;
          if (!monthlyData[key]) {
            monthlyData[key] = { sum: 0, month: zDate.getMonth(), year: zDate.getFullYear() };
          }
          monthlyData[key].sum += z.zisk;
        });
        
        const months = ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čer'];
        Object.values(monthlyData)
          .sort((a, b) => a.year - b.year || a.month - b.month)
          .slice(-6)
          .forEach(item => {
            chartData.labels.push(`${months[item.month]} ${item.year}`);
            chartData.values.push(item.sum);
          });
      }
      
      return chartData;
    };

    // Vytvoření line chart dat
    const createLineChartData = (period, color) => {
      const periodData = getPeriodSpecificData(period);
      return {
        labels: periodData.labels,
        datasets: [{
          data: periodData.values,
          borderColor: color,
          backgroundColor: (context) => {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return;
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, color.replace('1)', '0.3)'));
            gradient.addColorStop(1, color.replace('1)', '0.05)'));
            return gradient;
          },
          fill: true,
          tension: 0.4,
          pointBackgroundColor: color,
          pointBorderColor: color,
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 2,
        }],
      };
    };

    const lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(31, 31, 83, 0.95)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgba(79, 70, 229, 0.5)',
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              return `${context.parsed.y.toLocaleString()} Kč`;
            }
          }
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.1)', drawBorder: false },
          ticks: { color: 'rgba(255, 255, 255, 0.7)', font: { size: 10 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.1)', drawBorder: false },
          ticks: { 
            color: 'rgba(255, 255, 255, 0.7)', 
            font: { size: 10 },
            callback: function(value) {
              return value.toLocaleString();
            }
          },
        },
      },
    };

    // Top klienti graf
    const getTopClientsData = () => {
      const clientTotals = zakazkyData.reduce((acc, z) => {
        acc[z.klient] = (acc[z.klient] || 0) + z.zisk;
        return acc;
      }, {});
      
      const sorted = Object.entries(clientTotals)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
      
      const colors = ['#4F46E5', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];
      
      return {
        labels: sorted.map(([name]) => name),
        datasets: [{
          data: sorted.map(([,value]) => value),
          borderColor: colors,
          backgroundColor: (context) => {
            const dataIndex = context.dataIndex;
            if (dataIndex >= colors.length) return colors[0];
            
            const color = colors[dataIndex];
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea || !color) return color;
            
            // Převod hex na rgba
            const hexToRgba = (hex, alpha) => {
              const r = parseInt(hex.slice(1, 3), 16);
              const g = parseInt(hex.slice(3, 5), 16);
              const b = parseInt(hex.slice(5, 7), 16);
              return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            };
            
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, hexToRgba(color, 0.3));
            gradient.addColorStop(1, hexToRgba(color, 0.05));
            return gradient;
          },
          fill: true,
          tension: 0.4,
          pointBackgroundColor: colors,
          pointBorderColor: colors,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
        }],
      };
    };

    // Export funkce s plnou grafikou
    const exportToPDF = async () => {
      try {
        // Zobrazit loading
        const loadingToast = document.createElement('div');
        loadingToast.innerHTML = `
          <div style="position: fixed; top: 20px; right: 20px; background: #1F1F53; color: white; padding: 16px 24px; border-radius: 12px; z-index: 10000; font-family: Inter, sans-serif;">
            📄 Generuje se stylový PDF report...
          </div>
        `;
        document.body.appendChild(loadingToast);

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // Přidat podporu pro české znaky
        pdf.addFont('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap', 'Inter', 'normal');
        
        // Background gradient simulace
        pdf.setFillColor(15, 15, 35); // #0F0F23
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        
        // Header s gradienty
        pdf.setFillColor(31, 31, 83); // #1F1F53
        pdf.roundedRect(15, 15, pageWidth - 30, 25, 3, 3, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(20);
        pdf.text('🎨 PaintPro - Financni Report', 20, 30);
        
        pdf.setFontSize(10);
        pdf.setTextColor(181, 181, 209);
        pdf.text(`Export: ${new Date().toLocaleDateString('cs-CZ')} ${new Date().toLocaleTimeString('cs-CZ')}`, 20, 36);

        let yPosition = 55;

        // Stylové statistiky karty
        const createStatsCard = (title, stats, yPos) => {
          // Karta pozadí
          pdf.setFillColor(42, 45, 95); // card-bg
          pdf.roundedRect(15, yPos, pageWidth - 30, 45, 3, 3, 'F');
          
          // Gradient top border
          pdf.setFillColor(79, 70, 229); // accent-blue
          pdf.rect(15, yPos, pageWidth - 30, 2, 'F');
          
          // Titulek
          pdf.setFontSize(14);
          pdf.setTextColor(255, 255, 255);
          pdf.text(title, 20, yPos + 12);
          
          // Statistiky
          pdf.setFontSize(9);
          let xPos = 20;
          stats.forEach(([label, value], index) => {
            if (index > 0 && index % 2 === 0) {
              xPos = 20;
              yPos += 8;
            } else if (index > 0) {
              xPos = 110;
            }
            
            pdf.setTextColor(139, 139, 167);
            pdf.text(label, xPos, yPos + 20);
            pdf.setTextColor(255, 255, 255);
            pdf.text(value, xPos, yPos + 26);
          });
          
          return yPos + 45;
        };

        // Celkové statistiky karta
        const stats = [
          ['Celkove trzby:', `${allPeriods.all.celkoveTrzby.toLocaleString()} Kc`],
          ['Celkovy zisk:', `${allPeriods.all.celkovyZisk.toLocaleString()} Kc`],
          ['Ziskova marze:', `${allPeriods.all.celkoveTrzby > 0 ? Math.round((allPeriods.all.celkovyZisk / allPeriods.all.celkoveTrzby) * 100) : 0}%`],
          ['Pocet zakazek:', `${allPeriods.all.pocetZakazek.toString()}`]
        ];

        yPosition = createStatsCard('📊 CELKOVE STATISTIKY', stats, yPosition) + 10;

        // Období statistiky tabulka
        pdf.setFillColor(42, 45, 95);
        pdf.roundedRect(15, yPosition, pageWidth - 30, 55, 3, 3, 'F');
        
        pdf.setFillColor(16, 185, 129); // green
        pdf.rect(15, yPosition, pageWidth - 30, 2, 'F');
        
        pdf.setFontSize(14);
        pdf.setTextColor(255, 255, 255);
        pdf.text('📈 STATISTIKY PODLE OBDOBI', 20, yPosition + 12);

        // Tabulka header
        pdf.setFontSize(8);
        pdf.setTextColor(181, 181, 209);
        const headers = ['Obdobi', 'Trzby (Kc)', 'Zisk (Kc)', 'Zakazky'];
        headers.forEach((header, index) => {
          pdf.text(header, 20 + (index * 35), yPosition + 22);
        });

        // Tabulka data
        const periodStats = [
          ['Tyden', allPeriods.week.celkoveTrzby.toLocaleString(), allPeriods.week.celkovyZisk.toLocaleString(), allPeriods.week.pocetZakazek.toString()],
          ['Mesic', allPeriods.month.celkoveTrzby.toLocaleString(), allPeriods.month.celkovyZisk.toLocaleString(), allPeriods.month.pocetZakazek.toString()],
          ['Rok', allPeriods.year.celkoveTrzby.toLocaleString(), allPeriods.year.celkovyZisk.toLocaleString(), allPeriods.year.pocetZakazek.toString()],
          ['Celkem', allPeriods.all.celkoveTrzby.toLocaleString(), allPeriods.all.celkovyZisk.toLocaleString(), allPeriods.all.pocetZakazek.toString()]
        ];

        pdf.setFontSize(8);
        pdf.setTextColor(255, 255, 255);
        periodStats.forEach((row, index) => {
          const rowY = yPosition + 28 + (index * 6);
          row.forEach((cell, cellIndex) => {
            pdf.text(cell, 20 + (cellIndex * 35), rowY);
          });
        });

        yPosition += 65;

        // Top klienti karta
        const topClients = Object.entries(
          zakazkyData.reduce((acc, z) => {
            acc[z.klient] = (acc[z.klient] || 0) + z.zisk;
            return acc;
          }, {})
        ).sort(([,a], [,b]) => b - a).slice(0, 6);

        pdf.setFillColor(42, 45, 95);
        pdf.roundedRect(15, yPosition, pageWidth - 30, 50, 3, 3, 'F');
        
        pdf.setFillColor(245, 158, 11); // orange
        pdf.rect(15, yPosition, pageWidth - 30, 2, 'F');
        
        pdf.setFontSize(14);
        pdf.setTextColor(255, 255, 255);
        pdf.text('🏆 TOP KLIENTI', 20, yPosition + 12);

        pdf.setFontSize(8);
        topClients.forEach(([klient, zisk], index) => {
          const clientY = yPosition + 20 + (index * 5);
          const pocetZakazek = zakazkyData.filter(z => z.klient === klient).length;
          
          // Klient ikona
          pdf.setFillColor(79, 70, 229);
          pdf.circle(22, clientY, 1.5, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.text(klient[0], 21.3, clientY + 0.7);
          
          pdf.setTextColor(255, 255, 255);
          pdf.text(klient, 28, clientY + 1);
          pdf.setTextColor(16, 185, 129);
          pdf.text(`${zisk.toLocaleString()} Kc`, 80, clientY + 1);
          pdf.setTextColor(181, 181, 209);
          pdf.text(`${pocetZakazek} zakazek`, 130, clientY + 1);
        });

        // Nová stránka pro grafy
        pdf.addPage();
        
        // Background
        pdf.setFillColor(15, 15, 35);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        
        yPosition = 20;
        
        // Header
        pdf.setFillColor(31, 31, 83);
        pdf.roundedRect(15, 15, pageWidth - 30, 20, 3, 3, 'F');
        
        pdf.setFontSize(16);
        pdf.setTextColor(255, 255, 255);
        pdf.text('📊 GRAFICKE TRENDY', 20, 28);

        yPosition = 45;

        // Zachytit skutečné grafy pomocí html2canvas
        try {
          const chartsElement = document.querySelector('#charts-export');
          if (chartsElement) {
            loadingToast.querySelector('div').innerHTML = '📸 Zachycuji grafy...';
            
            const canvas = await html2canvas(chartsElement, {
              backgroundColor: '#0F0F23',
              scale: 1.5,
              logging: false,
              allowTaint: true,
              useCORS: true,
              width: chartsElement.offsetWidth,
              height: chartsElement.offsetHeight,
              onclone: (clonedDoc) => {
                // Ensure charts are visible in cloned document
                const clonedCharts = clonedDoc.querySelector('#charts-export');
                if (clonedCharts) {
                  clonedCharts.style.background = '#0F0F23';
                  clonedCharts.style.padding = '20px';
                }
              }
            });
            
            const imgData = canvas.toDataURL('image/png', 0.95);
            const imgWidth = pageWidth - 30;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Vycentrovat obraz
            const imgX = 15;
            let imgY = yPosition;
            
            if (imgHeight > pageHeight - yPosition - 20) {
              const scale = (pageHeight - yPosition - 20) / imgHeight;
              const scaledWidth = imgWidth * scale;
              const scaledHeight = imgHeight * scale;
              pdf.addImage(imgData, 'PNG', imgX + (imgWidth - scaledWidth) / 2, imgY, scaledWidth, scaledHeight);
            } else {
              pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth, imgHeight);
            }
            
            yPosition += Math.min(imgHeight, pageHeight - yPosition - 40) + 10;
          }
        } catch (error) {
          console.log('Error capturing charts:', error);
          
          // Fallback - stylové textové grafy
          const periods = [
            { name: 'TYDEN', value: allPeriods.week.celkovyZisk, color: [79, 70, 229], count: allPeriods.week.pocetZakazek },
            { name: 'MESIC', value: allPeriods.month.celkovyZisk, color: [16, 185, 129], count: allPeriods.month.pocetZakazek },
            { name: 'ROK', value: allPeriods.year.celkovyZisk, color: [245, 158, 11], count: allPeriods.year.pocetZakazek },
            { name: 'CELKEM', value: allPeriods.all.celkovyZisk, color: [139, 92, 246], count: allPeriods.all.pocetZakazek }
          ];

          periods.forEach((period, index) => {
            const cardY = yPosition + (index * 35);
            
            // Period karta
            pdf.setFillColor(42, 45, 95);
            pdf.roundedRect(15, cardY, pageWidth - 30, 30, 3, 3, 'F');
            
            // Barevný border
            pdf.setFillColor(...period.color);
            pdf.rect(15, cardY, pageWidth - 30, 2, 'F');
            
            // Progress bar
            const maxValue = Math.max(...periods.map(p => p.value));
            const barWidth = (period.value / maxValue) * (pageWidth - 80);
            pdf.setFillColor(...period.color, 0.3);
            pdf.roundedRect(20, cardY + 15, pageWidth - 50, 8, 2, 2, 'F');
            pdf.setFillColor(...period.color);
            pdf.roundedRect(20, cardY + 15, barWidth, 8, 2, 2, 'F');
            
            // Text
            pdf.setFontSize(12);
            pdf.setTextColor(255, 255, 255);
            pdf.text(period.name, 20, cardY + 10);
            pdf.setFontSize(10);
            pdf.setTextColor(...period.color);
            pdf.text(`${period.value.toLocaleString()} Kc`, 20, cardY + 28);
            pdf.setTextColor(181, 181, 209);
            pdf.text(`${period.count} zakazek`, pageWidth - 50, cardY + 28);
          });
        }

        // Nová stránka pro detailní data
        pdf.addPage();
        pdf.setFillColor(15, 15, 35);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        
        yPosition = 20;
        
        // Header
        pdf.setFillColor(31, 31, 83);
        pdf.roundedRect(15, 15, pageWidth - 30, 20, 3, 3, 'F');
        
        pdf.setFontSize(16);
        pdf.setTextColor(255, 255, 255);
        pdf.text('📋 DETAILNI PREHLED ZAKAZEK', 20, 28);

        yPosition = 45;

        // Tabulka záhlaví
        pdf.setFillColor(53, 56, 104);
        pdf.roundedRect(15, yPosition, pageWidth - 30, 12, 2, 2, 'F');
        
        const tableHeaders = ['Datum', 'Klient', 'Castka', 'Zisk'];
        pdf.setFontSize(8);
        pdf.setTextColor(255, 255, 255);
        tableHeaders.forEach((header, index) => {
          pdf.text(header, 20 + (index * 35), yPosition + 8);
        });

        yPosition += 15;

        // Data řádky
        zakazkyData.slice(0, 25).forEach((zakazka, index) => {
          if (yPosition > 270) {
            pdf.addPage();
            pdf.setFillColor(15, 15, 35);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            yPosition = 30;
          }
          
          // Alternating row colors
          if (index % 2 === 0) {
            pdf.setFillColor(42, 45, 95, 0.3);
            pdf.rect(15, yPosition - 2, pageWidth - 30, 8, 'F');
          }
          
          pdf.setFontSize(7);
          pdf.setTextColor(255, 255, 255);
          pdf.text(zakazka.datum, 20, yPosition + 3);
          pdf.text(zakazka.klient, 55, yPosition + 3);
          pdf.text(`${zakazka.castka.toLocaleString()}`, 90, yPosition + 3);
          pdf.setTextColor(16, 185, 129);
          pdf.text(`${zakazka.zisk.toLocaleString()}`, 125, yPosition + 3);
          
          yPosition += 8;
        });

        // Footer na všech stránkách
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          
          // Footer background
          pdf.setFillColor(31, 31, 83);
          pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');
          
          pdf.setFontSize(8);
          pdf.setTextColor(181, 181, 209);
          pdf.text(`Strana ${i} z ${totalPages}`, pageWidth - 30, pageHeight - 5);
          pdf.text('🎨 PaintPro System', 15, pageHeight - 5);
        }

        // Uložit PDF
        pdf.save(`paintpro-stylovy-report-${new Date().toISOString().split('T')[0]}.pdf`);
        
        document.body.removeChild(loadingToast);
        
        // Success toast
        const successToast = document.createElement('div');
        successToast.innerHTML = `
          <div style="position: fixed; top: 20px; right: 20px; background: #10B981; color: white; padding: 16px 24px; border-radius: 12px; z-index: 10000; font-family: Inter, sans-serif;">
            ✅ Stylový PDF report byl úspěšně stažen!
          </div>
        `;
        document.body.appendChild(successToast);
        setTimeout(() => document.body.removeChild(successToast), 3000);

      } catch (error) {
        console.error('Chyba při exportu PDF:', error);
        
        // Remove loading toast if it exists
        const loadingToast = document.querySelector('[style*="Generuje se"]');
        if (loadingToast && loadingToast.parentElement) {
          loadingToast.parentElement.removeChild(loadingToast);
        }
        
        const errorToast = document.createElement('div');
        errorToast.innerHTML = `
          <div style="position: fixed; top: 20px; right: 20px; background: #EF4444; color: white; padding: 16px 24px; border-radius: 12px; z-index: 10000; font-family: Inter, sans-serif;">
            ❌ Chyba: ${error.message}
          </div>
        `;
        document.body.appendChild(errorToast);
        setTimeout(() => document.body.removeChild(errorToast), 5000);
      }
    };

    const exportToCSV = () => {
      try {
        const timestamp = new Date().toISOString().split('T')[0];
        
        // Hlavní data zakázek
        const zakázkyHeaders = [
          'Datum', 'Klient', 'Druh práce', 'Číslo zakázky', 'Částka (Kč)', 
          'Fee (Kč)', 'Materiál (Kč)', 'Pomůcka (Kč)', 'Palivo (Kč)', 'Zisk (Kč)'
        ];
        
        const zakázkyData = zakazkyData.map(z => [
          z.datum, z.klient, z.druh, z.cislo, z.castka, z.fee, 
          z.material, z.pomucka, z.palivo, z.zisk
        ]);

        // Statistiky podle období
        const periodStatsHeaders = ['Období', 'Celkové tržby (Kč)', 'Celkový zisk (Kč)', 'Počet zakázek', 'Průměrný zisk (Kč)'];
        const periodStatsData = [
          ['Týden', allPeriods.week.celkoveTrzby, allPeriods.week.celkovyZisk, allPeriods.week.pocetZakazek, Math.round(allPeriods.week.celkovyZisk / (allPeriods.week.pocetZakazek || 1))],
          ['Měsíc', allPeriods.month.celkoveTrzby, allPeriods.month.celkovyZisk, allPeriods.month.pocetZakazek, Math.round(allPeriods.month.celkovyZisk / (allPeriods.month.pocetZakazek || 1))],
          ['Rok', allPeriods.year.celkoveTrzby, allPeriods.year.celkovyZisk, allPeriods.year.pocetZakazek, Math.round(allPeriods.year.celkovyZisk / (allPeriods.year.pocetZakazek || 1))],
          ['Od začátku', allPeriods.all.celkoveTrzby, allPeriods.all.celkovyZisk, allPeriods.all.pocetZakazek, Math.round(allPeriods.all.celkovyZisk / (allPeriods.all.pocetZakazek || 1))]
        ];

        // Top klienti
        const topClientsHeaders = ['Klient', 'Celkový zisk (Kč)', 'Počet zakázek', 'Průměrný zisk na zakázku (Kč)'];
        const topClientsData = Object.entries(
          zakazkyData.reduce((acc, z) => {
            if (!acc[z.klient]) {
              acc[z.klient] = { zisk: 0, pocet: 0 };
            }
            acc[z.klient].zisk += z.zisk;
            acc[z.klient].pocet += 1;
            return acc;
          }, {})
        )
        .sort(([,a], [,b]) => b.zisk - a.zisk)
        .map(([klient, data]) => [
          klient, 
          data.zisk, 
          data.pocet, 
          Math.round(data.zisk / data.pocet)
        ]);

        // Měsíční rozpis
        const monthlyHeaders = ['Rok-Měsíc', 'Tržby (Kč)', 'Zisk (Kč)', 'Počet zakázek'];
        const monthlyData = {};
        
        zakazkyData.forEach(z => {
          const date = new Date(z.datum.split('. ').reverse().join('-'));
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!monthlyData[key]) {
            monthlyData[key] = { trzby: 0, zisk: 0, pocet: 0 };
          }
          monthlyData[key].trzby += z.castka;
          monthlyData[key].zisk += z.zisk;
          monthlyData[key].pocet += 1;
        });

        const monthlyExportData = Object.entries(monthlyData)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([period, data]) => [period, data.trzby, data.zisk, data.pocet]);

        // Sestavení CSV
        const csvSections = [
          '=== PAINTPRO FINANČNÍ REPORT ===',
          `Export datum: ${new Date().toLocaleDateString('cs-CZ')}`,
          `Export čas: ${new Date().toLocaleTimeString('cs-CZ')}`,
          '',
          '=== VŠECHNY ZAKÁZKY ===',
          zakázkyHeaders.join(','),
          ...zakázkyData.map(row => row.join(',')),
          '',
          '=== STATISTIKY PODLE OBDOBÍ ===',
          periodStatsHeaders.join(','),
          ...periodStatsData.map(row => row.join(',')),
          '',
          '=== TOP KLIENTI ===',
          topClientsHeaders.join(','),
          ...topClientsData.map(row => row.join(',')),
          '',
          '=== MĚSÍČNÍ ROZPIS ===',
          monthlyHeaders.join(','),
          ...monthlyExportData.map(row => row.join(',')),
          '',
          '=== CELKOVÉ SOUHRNY ===',
          'Metrika,Hodnota',
          `Celkové tržby,${allPeriods.all.celkoveTrzby} Kč`,
          `Celkový zisk,${allPeriods.all.celkovyZisk} Kč`,
          `Zisková marže,${allPeriods.all.celkoveTrzby > 0 ? Math.round((allPeriods.all.celkovyZisk / allPeriods.all.celkoveTrzby) * 100) : 0}%`,
          `Počet zakázek,${allPeriods.all.pocetZakazek}`,
          `Průměrný zisk,${Math.round(allPeriods.all.celkovyZisk / allPeriods.all.pocetZakazek)} Kč`,
          `Nejlepší klient,${topClientsData[0] ? topClientsData[0][0] : 'N/A'}`,
          `Nejlepší měsíc,${monthlyExportData.reduce((best, current) => current[2] > best[2] ? current : best, ['', 0, 0, 0])[0]}`
        ];

        const csvContent = csvSections.join('\n');
        
        // BOM pro správné zobrazení češtiny v Excelu
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `paintpro-complete-export-${timestamp}.csv`;
        link.click();

        // Success toast
        const successToast = document.createElement('div');
        successToast.innerHTML = `
          <div style="position: fixed; top: 20px; right: 20px; background: #10B981; color: white; padding: 16px 24px; border-radius: 12px; z-index: 10000; font-family: Inter, sans-serif;">
            📊 CSV export byl úspěšně stažen!
          </div>
        `;
        document.body.appendChild(successToast);
        setTimeout(() => document.body.removeChild(successToast), 3000);

      } catch (error) {
        console.error('Chyba při exportu CSV:', error);
        
        const errorToast = document.createElement('div');
        errorToast.innerHTML = `
          <div style="position: fixed; top: 20px; right: 20px; background: #EF4444; color: white; padding: 16px 24px; border-radius: 12px; z-index: 10000; font-family: Inter, sans-serif;">
            ❌ Chyba při exportu CSV
          </div>
        `;
        document.body.appendChild(errorToast);
        setTimeout(() => document.body.removeChild(errorToast), 3000);
      }
    };

    return (
      <div className="reporty">
        <div className="page-header">
          <div>
            <h1>Finanční reporty</h1>
            <p>Komplexní analýza všech období s detailními grafy</p>
          </div>
        </div>

        {/* 4 grafy v gridu 2x2 */}
        <div className="charts-grid-4" id="charts-export">
          <div className="chart-card-small">
            <div className="chart-header-small">
              <h3>TÝDEN</h3>
              <div className="chart-value-small blue">{allPeriods.week.celkovyZisk.toLocaleString()} Kč</div>
            </div>
            <div className="chart-container-small">
              <Line key="week-chart" data={createLineChartData('week', 'rgba(79, 70, 229, 1)')} options={lineChartOptions} />
            </div>
          </div>

          <div className="chart-card-small">
            <div className="chart-header-small">
              <h3>MĚSÍC</h3>
              <div className="chart-value-small green">{allPeriods.month.celkovyZisk.toLocaleString()} Kč</div>
            </div>
            <div className="chart-container-small">
              <Line key="month-chart" data={createLineChartData('month', 'rgba(16, 185, 129, 1)')} options={lineChartOptions} />
            </div>
          </div>

          <div className="chart-card-small">
            <div className="chart-header-small">
              <h3>ROK</h3>
              <div className="chart-value-small orange">{allPeriods.year.celkovyZisk.toLocaleString()} Kč</div>
            </div>
            <div className="chart-container-small">
              <Line key="year-chart" data={createLineChartData('year', 'rgba(245, 158, 11, 1)')} options={lineChartOptions} />
            </div>
          </div>

          <div className="chart-card-small">
            <div className="chart-header-small">
              <h3>OD ZAČÁTKU</h3>
              <div className="chart-value-small purple">{allPeriods.all.celkovyZisk.toLocaleString()} Kč</div>
            </div>
            <div className="chart-container-small">
              <Line key="all-chart" data={createLineChartData('all', 'rgba(139, 92, 246, 1)')} options={lineChartOptions} />
            </div>
          </div>
        </div>

        {/* 5 statistických buněk */}
        <div className="stats-row">
          <div className="stat-cell">
            <div className="stat-icon-large blue">💰</div>
            <div className="stat-value-large">{allPeriods.all.celkoveTrzby.toLocaleString()}</div>
            <div className="stat-label-large">Celkové tržby</div>
          </div>
          <div className="stat-cell">
            <div className="stat-icon-large green">📈</div>
            <div className="stat-value-large">{allPeriods.all.celkovyZisk.toLocaleString()}</div>
            <div className="stat-label-large">Celkový zisk</div>
          </div>
          <div className="stat-cell">
            <div className="stat-icon-large purple">📋</div>
            <div className="stat-value-large">
              {allPeriods.all.celkoveTrzby > 0 ? Math.round((allPeriods.all.celkovyZisk / allPeriods.all.celkoveTrzby) * 100) : 0}%
            </div>
            <div className="stat-label-large">Zisková marže</div>
          </div>
          <div className="stat-cell">
            <div className="stat-icon-large orange">🎯</div>
            <div className="stat-value-large">{allPeriods.all.pocetZakazek}</div>
            <div className="stat-label-large">Počet zakázek</div>
          </div>
          <div className="stat-cell">
            <div className="stat-icon-large red">💎</div>
            <div className="stat-value-large">{Math.round(allPeriods.all.celkovyZisk / allPeriods.all.pocetZakazek).toLocaleString()}</div>
            <div className="stat-label-large">Průměrný zisk</div>
          </div>
        </div>

        {/* Graf top klientů */}
        <div className="chart-card-full">
          <div className="chart-header">
            <div>
              <h3>TOP KLIENTI PODLE VÝKONNOSTI</h3>
              <div className="chart-subtitle">Celkový zisk podle klientů</div>
            </div>
          </div>
          <div className="chart-container-large">
            <Line key="top-clients-chart" data={getTopClientsData()} options={lineChartOptions} />
          </div>
        </div>

        {/* Akční tlačítka */}
        <div className="action-buttons-row">
          <div className="action-button-card" onClick={exportToPDF}>
            <div className="action-button-icon">📄</div>
            <div className="action-button-content">
              <div className="action-button-title">Export do PDF</div>
              <div className="action-button-subtitle">Kompletní report s daty</div>
            </div>
          </div>
          
          <div className="action-button-card" onClick={exportToCSV}>
            <div className="action-button-icon">📊</div>
            <div className="action-button-content">
              <div className="action-button-title">Export do CSV</div>
              <div className="action-button-subtitle">Všechna data pro Excel</div>
            </div>
          </div>
          
          <div className="action-button-card" onClick={() => setActiveTab('nastaveni')}>
            <div className="action-button-icon">⚙️</div>
            <div className="action-button-content">
              <div className="action-button-title">Nastavení</div>
              <div className="action-button-subtitle">Konfigurace aplikace</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Nastaveni = () => (
    <div className="nastaveni">
      <div className="page-header">
        <div>
          <h1>Nastavení a konfigurace</h1>
          <p>Spravovat uživatele aplikace, účet a rozšířené exporty</p>
        </div>
      </div>

      <div className="settings-header">
        <div className="settings-tabs">
          <button className="settings-tab active">Účet</button>
          <button className="settings-tab">Aplikace</button>
          <button className="settings-tab">Export</button>
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">👤</div>
            <div>
              <h3>Profil uživatele</h3>
              <div className="settings-actions">
                <button className="btn-settings">EDIT</button>
                <button className="btn-settings">VIEW</button>
              </div>
            </div>
          </div>
          <div className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label>Jméno *</label>
                <input type="text" value="Jan" />
              </div>
              <div className="form-group">
                <label>Příjmení *</label>
                <input type="text" value="Novák" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>E-mail *</label>
                <input type="email" value="jan.novak@paintpro.cz" />
              </div>
              <div className="form-group">
                <label>Telefon *</label>
                <input type="tel" value="+420 123 456 789" />
              </div>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">🏢</div>
            <div>
              <h3>Firemní informace</h3>
              <div className="settings-actions">
                <button className="btn-settings">EDIT</button>
                <button className="btn-settings">VIEW</button>
              </div>
            </div>
          </div>
          <div className="settings-form">
            <div className="form-group">
              <label>Název společnosti *</label>
              <input type="text" value="Malířské práce Novák s.r.o." />
            </div>
            <div className="form-group">
              <label>Adresa společnosti</label>
              <input type="text" value="Hlavní 123, 110 00 Praha 1" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>IČO</label>
                <input type="text" value="12345678" />
              </div>
              <div className="form-group">
                <label>DIČ</label>
                <input type="text" value="CZ12345678" />
              </div>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">🔒</div>
            <div>
              <h3>Bezpečnost</h3>
              <div className="settings-badge">SECURE</div>
            </div>
          </div>
          <div className="settings-form">
            <div className="form-group">
              <label>Současné heslo</label>
              <input type="password" placeholder="Zadejte současné heslo" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Nové heslo</label>
                <input type="password" placeholder="Zadejte nové heslo" />
              </div>
              <div className="form-group">
                <label>Potvrzení nového hesla</label>
                <input type="password" placeholder="Potvrzete nové heslo" />
              </div>
            </div>
            <div className="security-note">
              <strong>Bezpečnostní upozornění</strong><br/>
              Změna hesla vyžaduje opětovné přihlášení do aplikace.
            </div>
          </div>
        </div>

        <div className="settings-actions-footer">
          <button className="btn btn-danger">Exportovat vlastní data</button>
          <button className="btn btn-danger">Smazat účet</button>
          <button className="btn btn-primary">Uložit změny</button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'zakazky':
        return <Zakazky />;
      case 'reporty':
        return <Reporty />;
      case 'nastaveni':
        return <Nastaveni />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default PaintPro;
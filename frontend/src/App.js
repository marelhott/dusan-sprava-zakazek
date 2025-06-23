import React, { useState, useEffect } from 'react';
import './App.css';
import './ModernIcons.css';
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

  const [searchClient, setSearchClient] = useState('');
  const [filterDruhPrace, setFilterDruhPrace] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Kompletní data ze screenshotů
  const [zakazkyData, setZakazkyData] = useState([
    { id: 1, datum: '11. 6. 2025', druh: 'Adam', klient: 'XY', cislo: '202501', castka: 4000, fee: 1040, material: 0, pomocnik: 0, palivo: 0, zisk: 2960, soubory: [] },
    { id: 2, datum: '9. 6. 2025', druh: 'MVČ', klient: 'XY', cislo: '104470', castka: 7200, fee: 1872, material: 700, pomocnik: 2000, palivo: 0, zisk: 2628, soubory: [] },
    { id: 3, datum: '5. 6. 2025', druh: 'Adam', klient: 'XY', cislo: '95105', castka: 11800, fee: 2964, material: 700, pomocnik: 2000, palivo: 300, zisk: 5436, soubory: [] },
    { id: 4, datum: '14. 5. 2025', druh: 'Adam', klient: 'XY', cislo: '80067', castka: 7600, fee: 1976, material: 700, pomocnik: 2000, palivo: 300, zisk: 2924, soubory: [] },
    { id: 5, datum: '13. 5. 2025', druh: 'Adam', klient: 'XY', cislo: '87470', castka: 6400, fee: 1664, material: 700, pomocnik: 2000, palivo: 300, zisk: 1736, soubory: [] },
    { id: 6, datum: '10. 5. 2025', druh: 'Adam', klient: 'XY', cislo: '91353', castka: 24000, fee: 6240, material: 0, pomocnik: 15780, palivo: 0, zisk: 2000, soubory: [] },
    { id: 7, datum: '24. 4. 2025', druh: 'Korálek', klient: 'XY', cislo: '90660', castka: 13200, fee: 3432, material: 0, pomocnik: 0, palivo: 0, zisk: 9768, soubory: [] },
    { id: 8, datum: '22. 4. 2025', druh: 'Adam', klient: 'XY', cislo: '95247', castka: 17800, fee: 4628, material: 300, pomocnik: 700, palivo: 0, zisk: 12172, soubory: [] },
    { id: 9, datum: '19. 4. 2025', druh: 'Adam', klient: 'XY', cislo: '91510', castka: 10600, fee: 2756, material: 200, pomocnik: 1000, palivo: 2500, zisk: 4144, soubory: [] },
    { id: 10, datum: '16. 4. 2025', druh: 'Adam', klient: 'XY', cislo: '91417', castka: 8600, fee: 2184, material: 500, pomocnik: 1000, palivo: 1500, zisk: 3416, soubory: [] },
    { id: 11, datum: '15. 3. 2025', druh: 'Ostatní', klient: 'XY', cislo: '18001', castka: 5700, fee: 1462, material: 300, pomocnik: 1000, palivo: 0, zisk: 2938, soubory: [] },
    { id: 12, datum: '26. 2. 2025', druh: 'Adam', klient: 'XY', cislo: '14974', castka: 5600, fee: 1456, material: 300, pomocnik: 400, palivo: 0, zisk: 3444, soubory: [] },
    { id: 13, datum: '23. 2. 2025', druh: 'Adam', klient: 'XY', cislo: '13161', castka: 8400, fee: 1684, material: 300, pomocnik: 400, palivo: 0, zisk: 4016, soubory: [] },
    { id: 14, datum: '27. 1. 2025', druh: 'Adam', klient: 'XY', cislo: '14347', castka: 8700, fee: 1743, material: 300, pomocnik: 1000, palivo: 0, zisk: 5657, soubory: [] }
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
        labels: ['Adam', 'MVČ', 'Korálek', 'Ostatní'],
        values: [
          zakazkyData.filter(z => z.druh === 'Adam').reduce((sum, z) => sum + z.zisk, 0),
          zakazkyData.filter(z => z.druh === 'MVČ').reduce((sum, z) => sum + z.zisk, 0),
          zakazkyData.filter(z => z.druh === 'Korálek').reduce((sum, z) => sum + z.zisk, 0),
          zakazkyData.filter(z => z.druh === 'Ostatní').reduce((sum, z) => sum + z.zisk, 0)
        ],
        colors: ['#4F46E5', '#10B981', '#F59E0B', '#8B5CF6']
      }
    };
  }, [zakazkyData]);

  // Funkce pro přidání zakázky
  const addZakazka = (newZakazka) => {
    const id = Math.max(...zakazkyData.map(z => z.id)) + 1;
    const zisk = newZakazka.castka - newZakazka.fee - newZakazka.material - newZakazka.pomocnik - newZakazka.palivo;
    setZakazkyData([...zakazkyData, { ...newZakazka, id, zisk, soubory: [] }]);
    setShowAddModal(false);
  };

  // Funkce pro editaci
  const editZakazka = (zakazka) => {
    setEditingZakazka(zakazka);
    setShowEditModal(true);
  };

  // Funkce pro smazání zakázky
  const deleteZakazka = (id) => {
    if (window.confirm('Opravdu chcete smazat tuto zakázku?')) {
      setZakazkyData(zakazkyData.filter(z => z.id !== id));
    }
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
        backgroundColor: [
          'rgba(59, 130, 246, 0.9)',   // Modrá - Adam
          'rgba(34, 197, 194, 0.9)',   // Tyrkysová - MVČ  
          'rgba(16, 185, 129, 0.9)',   // Zelená - Korálek
          'rgba(236, 72, 153, 0.9)'    // Růžová - Ostatní
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 194, 1)', 
          'rgba(16, 185, 129, 1)',
          'rgba(236, 72, 153, 1)'
        ],
        borderWidth: 0,
        hoverBorderWidth: 0,
        cutout: '65%',
        radius: '85%',
        rotation: -90,
        circumference: 360,
        spacing: 2,
        borderRadius: 8, // Kulaté rohy sekcí
        borderSkipped: false,
      }
    ]
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 40
    },
    plugins: {
      legend: {
        display: false // Disable default legend, we'll create custom external labels
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
            const total = context.dataset.data.reduce((sum, value) => sum + value, 0);
            const percentage = Math.round((context.raw / total) * 100);
            return `${context.label}: ${percentage}% (${context.raw.toLocaleString()} Kč)`;
          }
        }
      },
    },
    elements: {
      arc: {
        borderJoinStyle: 'round',
      }
    },
    interaction: {
      intersect: false,
      mode: 'point'
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeOutCubic'
    }
  };

  const StatCard = ({ title, value, subtitle, iconClass, color, index, showCurrency = true }) => (
    <div
      className={`stat-card ${hoveredCard === index ? 'hovered' : ''}`}
      onMouseEnter={() => setHoveredCard(index)}
      onMouseLeave={() => setHoveredCard(null)}
    >
      <div className="stat-header">
        <div className="stat-title">{title}</div>
      </div>
      <div className="stat-content">
        <div className={`modern-icon size-medium ${iconClass}`}>
        </div>
        <div className="stat-value">{value}{showCurrency ? ' Kč' : ''}</div>
        <div className="stat-subtitle">{subtitle}</div>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="modern-icon size-medium icon-dashboard"></div>
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
          <div className="modern-icon icon-dashboard"></div>
          Dashboard
        </div>
        <div
          className={`nav-item ${activeTab === 'zakazky' ? 'active' : ''}`}
          onClick={() => setActiveTab('zakazky')}
        >
          <div className="modern-icon icon-orders"></div>
          Zakázky
        </div>
        <div
          className={`nav-item ${activeTab === 'reporty' ? 'active' : ''}`}
          onClick={() => setActiveTab('reporty')}
        >
          <div className="modern-icon icon-reports"></div>
          Reporty
        </div>
        <div
          className={`nav-item ${activeTab === 'nastaveni' ? 'active' : ''}`}
          onClick={() => setActiveTab('nastaveni')}
        >
          <div className="modern-icon icon-settings"></div>
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
          iconClass="icon-money"
          color="blue"
          index={0}
        />
        <StatCard
          title="CELKOVÝ ZISK"
          value={dashboardData.celkovyZisk}
          subtitle={`Marže ${Math.round((parseInt(dashboardData.celkovyZisk.replace(/,/g, '')) / parseInt(dashboardData.celkoveTrzby.replace(/,/g, ''))) * 100)}%`}
          iconClass="icon-chart"
          color="green"
          index={1}
        />
        <StatCard
          title="POČET ZAKÁZEK"
          value={dashboardData.pocetZakazek}
          subtitle="Aktivních zakázek"
          iconClass="icon-orders"
          color="purple"
          index={2}
          showCurrency={false}
        />
        <StatCard
          title="PRŮMĚRNÝ ZISK"
          value={dashboardData.prumernyZisk}
          subtitle="Na zakázku"
          iconClass="icon-target"
          color="orange"
          index={3}
        />
      </div>

      <div className="charts-grid">
        <div className="chart-card large">
          <div className="chart-header">
            <div>
              <h3>PŘEHLED ZISKU</h3>
              <div className="chart-values-dual">
                <div className="chart-value-main">{dashboardData.celkovyZisk} Kč</div>
                <div className="chart-value-secondary">Měsíc: {Math.round(parseInt(dashboardData.celkovyZisk.replace(/,/g, '')) / 6).toLocaleString()} Kč</div>
              </div>
            </div>
          </div>
          <div className="chart-container-large">
            <Chart type='bar' data={getCombinedChartData()} options={combinedChartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>ROZLOŽENÍ PODLE DRUHU PŘÍJMŮ</h3>
              <div className="chart-value">76 000 Kč</div>
            </div>
          </div>
          <div className="chart-container-donut">
            <div className="donut-chart-wrapper">
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
              <div className="external-labels">
                {dashboardData.rozlozeniData.labels.map((label, index) => {
                  const total = dashboardData.rozlozeniData.values.reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? Math.round((dashboardData.rozlozeniData.values[index] / total) * 100) : 0;
                  
                  // Správné pozice podle skutečných segmentů grafu
                  // Pořadí: Adam (největší), MVČ, Korálek, Ostatní
                  const positions = [
                    'label-top-right',    // Adam - největší segment vpravo nahoře
                    'label-top-left',     // MVČ - segment vlevo nahoře  
                    'label-bottom-left',  // Korálek - segment vlevo dole
                    'label-bottom-right'  // Ostatní - malý segment vpravo dole
                  ];
                  
                  return (
                    <div key={label} className={`label-item ${positions[index] || 'label-top-left'}`}>
                      <div className="label-line"></div>
                      <div className="label-content">
                        <div className="label-percentage">{percentage}%</div>
                        <div className="label-name">{label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="chart-details">
            <div className="detail-row">
              <span>KATEGORIÍ</span>
              <span>4</span>
            </div>
            <div className="detail-row">
              <span>Největší podíl</span>
              <span>Adam (45%)</span>
            </div>
            <div className="detail-row">
              <span>Celková suma</span>
              <span>76 000 Kč</span>
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
              <div className="modern-icon size-small icon-orders"></div>
              <div className="activity-content">
                <div className="activity-title">Dokončena zakázka pro ROZNOV s.r.o.</div>
                <div className="activity-subtitle">Malířské práce</div>
                <div className="activity-value">+2 624 Kč zisk</div>
              </div>
              <div className="activity-time">2 hod</div>
            </div>
            <div className="activity-item">
              <div className="modern-icon size-small icon-orders"></div>
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
      druh: 'Adam',
      klient: '',
      cislo: '',
      castka: 0,
      fee: 0,
      material: 0,
      pomocnik: 0,
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
        pomocnik: Number(formData.pomocnik),
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
                <label>Druh práce *</label>
                <select
                  value={formData.druh}
                  onChange={e => setFormData({...formData, druh: e.target.value})}
                  required
                >
                  <option value="Adam">Adam</option>
                  <option value="MVČ">MVČ</option>
                  <option value="Korálek">Korálek</option>
                  <option value="Ostatní">Ostatní</option>
                </select>
              </div>
            </div>
            <div className="form-row">
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
                <label>Pomocník (Kč)</label>
                <input
                  type="number"
                  value={formData.pomocnik}
                  onChange={e => setFormData({...formData, pomocnik: e.target.value})}
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
          <button className="btn btn-secondary">
            <div className="modern-icon size-small icon-export"></div>
            Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <div className="modern-icon size-small icon-add"></div>
            Přidat zakázku
          </button>
        </div>
      </div>

      {/* Statistiky - první řada */}
      <div className="stats-grid-top">
        <div className="stat-card-mini">
          <div className="stat-title-mini">CELKOVÉ TRŽBY</div>
          <div className="stat-value-mini">{zakazkyData.reduce((sum, z) => sum + z.castka, 0).toLocaleString()} Kč</div>
        </div>
        <div className="stat-card-mini">
          <div className="stat-title-mini">CELKOVÝ ZISK</div>
          <div className="stat-value-mini">{zakazkyData.reduce((sum, z) => sum + z.zisk, 0).toLocaleString()} Kč</div>
        </div>
        <div className="stat-card-mini">
          <div className="stat-title-mini">POČET ZAKÁZEK</div>
          <div className="stat-value-mini">{zakazkyData.length}</div>
        </div>
      </div>

      {/* Statistiky - druhá řada */}
      <div className="stats-grid-bottom">
        <div className="stat-card-mini">
          <div className="stat-title-mini">SOUČET POMOCNÍK</div>
          <div className="stat-value-mini">{zakazkyData.reduce((sum, z) => sum + z.pomocnik, 0).toLocaleString()} Kč</div>
        </div>
        <div className="stat-card-mini">
          <div className="stat-title-mini">SOUČET MATERIÁL</div>
          <div className="stat-value-mini">{zakazkyData.reduce((sum, z) => sum + z.material, 0).toLocaleString()} Kč</div>
        </div>
        <div className="stat-card-mini">
          <div className="stat-title-mini">SOUČET PALIVO</div>
          <div className="stat-value-mini">{zakazkyData.reduce((sum, z) => sum + z.palivo, 0).toLocaleString()} Kč</div>
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
                <label>Druh práce</label>
                <select 
                  value={filterDruhPrace}
                  onChange={(e) => setFilterDruhPrace(e.target.value)}
                >
                  <option value="">Všechny druhy</option>
                  <option value="Adam">Adam</option>
                  <option value="MVČ">MVČ</option>
                  <option value="Korálek">Korálek</option>
                  <option value="Ostatní">Ostatní</option>
                </select>
              </div>
              <div className="filter-item">
                <label>Klient</label>
                <input 
                  type="text" 
                  placeholder="Hledat podle jména klienta..." 
                  value={searchClient}
                  onChange={(e) => setSearchClient(e.target.value)}
                />
              </div>
              <div className="filter-item">
                <label>Datum od</label>
                <input 
                  type="date" 
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                />
              </div>
              <div className="filter-item">
                <label>Datum do</label>
                <input 
                  type="date" 
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                />
              </div>
            </div>
            <div className="filter-actions">
              <button 
                className="btn btn-secondary btn-small"
                onClick={() => {
                  setSearchClient('');
                  setFilterDruhPrace('');
                  setFilterDateFrom('');
                  setFilterDateTo('');
                }}
              >
                Vymazat filtry
              </button>
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
                <th>DRUH PRÁCE</th>
                <th>KLIENT</th>
                <th>ID ZAKÁZKY</th>
                <th>ČÁSTKA</th>
                <th>FEE</th>
                <th>FEE OFF</th>
                <th>PALIVO</th>
                <th>MATERIÁL</th>
                <th>POMOCNÍK</th>
                <th>ČISTÝ ZISK</th>
                <th>SOUBORY</th>
                <th>AKCE</th>
              </tr>
            </thead>
            <tbody>
              {zakazkyData
                .filter(zakazka => {
                  // Filtr podle klienta
                  const clientMatch = searchClient === '' || 
                    zakazka.klient.toLowerCase().includes(searchClient.toLowerCase());
                  
                  // Filtr podle druhu práce  
                  const druhMatch = filterDruhPrace === '' || zakazka.druh === filterDruhPrace;
                  
                  // Filtr podle datumu
                  let dateMatch = true;
                  if (filterDateFrom || filterDateTo) {
                    const zakazkaDate = new Date(zakazka.datum.split('. ').reverse().join('-'));
                    
                    if (filterDateFrom) {
                      const fromDate = new Date(filterDateFrom);
                      dateMatch = dateMatch && zakazkaDate >= fromDate;
                    }
                    
                    if (filterDateTo) {
                      const toDate = new Date(filterDateTo);
                      dateMatch = dateMatch && zakazkaDate <= toDate;
                    }
                  }
                  
                  return clientMatch && druhMatch && dateMatch;
                })
                .map((zakazka) => (
                <tr key={zakazka.id} className="table-row">
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>{zakazka.datum}</td>
                  <td>{zakazka.druh}</td>
                  <td>{zakazka.klient}</td>
                  <td>{zakazka.cislo}</td>
                  <td className="amount-bold-blue">{zakazka.castka.toLocaleString()} Kč</td>
                  <td>{zakazka.fee.toLocaleString()} Kč</td>
                  <td>{(zakazka.castka - zakazka.fee).toLocaleString()} Kč</td>
                  <td>{zakazka.palivo.toLocaleString()} Kč</td>
                  <td>{zakazka.material.toLocaleString()} Kč</td>
                  <td>{zakazka.pomocnik.toLocaleString()} Kč</td>
                  <td className="profit-bold-orange">{zakazka.zisk.toLocaleString()} Kč</td>
                  <td>
                    <span className="file-placeholder">-</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" onClick={() => editZakazka(zakazka)} title="Upravit">
                        <div className="modern-icon size-small icon-edit"></div>
                      </button>
                      <button className="btn-icon" onClick={() => deleteZakazka(zakazka.id)} title="Smazat">
                        <div className="modern-icon size-small icon-delete"></div>
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
      
      return {
        labels: sorted.map(([name]) => name),
        datasets: [{
          label: 'Zisk klientů',
          data: sorted.map(([,value]) => value),
          borderColor: '#4F46E5',
          backgroundColor: (context) => {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return 'rgba(79, 70, 229, 0.1)';
            
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(79, 70, 229, 0.3)');
            gradient.addColorStop(1, 'rgba(79, 70, 229, 0.05)');
            return gradient;
          },
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#4F46E5',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          borderWidth: 3,
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
              <h3>ADAM</h3>
              <div className="chart-value-small blue">{zakazkyData.filter(z => z.druh === 'Adam').reduce((sum, z) => sum + z.zisk, 0).toLocaleString()} Kč</div>
            </div>
            <div className="chart-container-small">
              <Line key="adam-chart" data={createLineChartData('week', 'rgba(79, 70, 229, 1)')} options={lineChartOptions} />
            </div>
          </div>

          <div className="chart-card-small">
            <div className="chart-header-small">
              <h3>MVČ</h3>
              <div className="chart-value-small green">{zakazkyData.filter(z => z.druh === 'MVČ').reduce((sum, z) => sum + z.zisk, 0).toLocaleString()} Kč</div>
            </div>
            <div className="chart-container-small">
              <Line key="mvc-chart" data={createLineChartData('month', 'rgba(16, 185, 129, 1)')} options={lineChartOptions} />
            </div>
          </div>

          <div className="chart-card-small">
            <div className="chart-header-small">
              <h3>KORÁLEK</h3>
              <div className="chart-value-small orange">{zakazkyData.filter(z => z.druh === 'Korálek').reduce((sum, z) => sum + z.zisk, 0).toLocaleString()} Kč</div>
            </div>
            <div className="chart-container-small">
              <Line key="koralek-chart" data={createLineChartData('year', 'rgba(245, 158, 11, 1)')} options={lineChartOptions} />
            </div>
          </div>

          <div className="chart-card-small">
            <div className="chart-header-small">
              <h3>OSTATNÍ</h3>
              <div className="chart-value-small purple">{zakazkyData.filter(z => z.druh === 'Ostatní').reduce((sum, z) => sum + z.zisk, 0).toLocaleString()} Kč</div>
            </div>
            <div className="chart-container-small">
              <Line key="ostatni-chart" data={createLineChartData('all', 'rgba(139, 92, 246, 1)')} options={lineChartOptions} />
            </div>
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
            <Bar key="top-clients-chart" data={getTopClientsData()} options={lineChartOptions} />
          </div>
        </div>

        {/* Akční tlačítka */}
        <div className="action-buttons-row">
          <div className="action-button-card" onClick={exportToPDF}>
            <div className="modern-icon size-large icon-export"></div>
            <div className="action-button-content">
              <div className="action-button-title">Export do PDF</div>
              <div className="action-button-subtitle">Kompletní report s daty</div>
            </div>
          </div>
          
          <div className="action-button-card" onClick={exportToCSV}>
            <div className="modern-icon size-large icon-export"></div>
            <div className="action-button-content">
              <div className="action-button-title">Export do CSV</div>
              <div className="action-button-subtitle">Data pro další analýzu</div>
            </div>
          </div>
          
          <div className="action-button-card" onClick={() => setShowAddModal(true)}>
            <div className="modern-icon size-large icon-add"></div>
            <div className="action-button-content">
              <div className="action-button-title">Nová zakázka</div>
              <div className="action-button-subtitle">Rychlé přidání</div>
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
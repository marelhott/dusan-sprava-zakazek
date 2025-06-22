import React, { useState, useEffect } from 'react';
import './App.css';
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
import { Bar, Doughnut, Line } from 'react-chartjs-2';

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

  const barChartData = {
    labels: dashboardData.mesicniData.labels,
    datasets: [
      {
        data: dashboardData.mesicniData.values,
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(31, 31, 83, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(79, 70, 229, 0.5)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
      },
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
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
            <Bar data={barChartData} options={barChartOptions} />
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

    // Export funkce
    const exportToPDF = () => {
      // Simulace PDF exportu
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>PaintPro - Finanční Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .stats { display: flex; justify-content: space-between; margin: 20px 0; }
            .stat { text-align: center; padding: 10px; border: 1px solid #ccc; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PaintPro - Finanční Report</h1>
            <p>Datum: ${new Date().toLocaleDateString('cs-CZ')}</p>
          </div>
          <div class="stats">
            <div class="stat">
              <h3>Celkové tržby</h3>
              <p>${allPeriods.all.celkoveTrzby.toLocaleString()} Kč</p>
            </div>
            <div class="stat">
              <h3>Celkový zisk</h3>
              <p>${allPeriods.all.celkovyZisk.toLocaleString()} Kč</p>
            </div>
            <div class="stat">
              <h3>Počet zakázek</h3>
              <p>${allPeriods.all.pocetZakazek}</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    };

    const exportToCSV = () => {
      const headers = ['Datum', 'Klient', 'Druh', 'Číslo', 'Částka', 'Fee', 'Materiál', 'Pomůcka', 'Palivo', 'Zisk'];
      const csvContent = [
        headers.join(','),
        ...zakazkyData.map(z => [
          z.datum,
          z.klient,
          z.druh,
          z.cislo,
          z.castka,
          z.fee,
          z.material,
          z.pomucka,
          z.palivo,
          z.zisk
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `paintpro-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
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
        <div className="charts-grid-4">
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
              <div className="action-button-subtitle">Stáhněte kompletní report</div>
            </div>
          </div>
          
          <div className="action-button-card" onClick={exportToCSV}>
            <div className="action-button-icon">📊</div>
            <div className="action-button-content">
              <div className="action-button-title">Export do CSV</div>
              <div className="action-button-subtitle">Exportujte data do Excelu</div>
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
import React, { useState, useEffect } from 'react';
import './App.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const PaintPro = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hoveredCard, setHoveredCard] = useState(null);

  // Sample data podobná tvým screenshotům
  const dashboardData = {
    celkoveTrzby: '136 150',
    celkovyZisk: '61 211',
    pocetZakazek: '14',
    prumernyZisk: '4 372',
    mesicniData: {
      labels: ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čer'],
      values: [8000, 12000, 15000, 18000, 22000, 16000]
    },
    rozlozeniData: {
      labels: ['Adam', 'MVC', 'Korálek', 'Ostatní'],
      values: [45600, 18000, 25333, 10000],
      colors: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444']
    }
  };

  const zakazkyData = [
    { id: 1, datum: '11. 6. 2025', klient: 'MVC', druh: 'XY', cislo: '202501', castka: '4 000', fee: '1 040', material: '0', pomucka: '0', zisk: '2 960' },
    { id: 2, datum: '9. 6. 2025', klient: 'Adam', druh: 'XY', cislo: '104470', castka: '7 200', fee: '1 872', material: '700', pomucka: '2 000', zisk: '2 628' },
    { id: 3, datum: '5. 6. 2025', klient: 'Adam', druh: 'XY', cislo: '95105', castka: '11 800', fee: '2 964', material: '700', pomucka: '2 000', zisk: '5 436' },
    { id: 4, datum: '14. 5. 2025', klient: 'Adam', druh: 'XY', cislo: '80067', castka: '7 600', fee: '1 976', material: '700', pomucka: '2 000', zisk: '2 924' },
    { id: 5, datum: '13. 5. 2025', klient: 'Adam', druh: 'XY', cislo: '87470', castka: '6 400', fee: '1 664', material: '700', pomucka: '2 000', zisk: '1 736' }
  ];

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

  const Zakazky = () => (
    <div className="zakazky">
      <div className="page-header">
        <div>
          <h1>Správa zakázek</h1>
          <p>Přehled a správa všech malířských zakázek s automatickým výpočtem zisku</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary">Export CSV</button>
          <button className="btn btn-primary">Přidat zakázku</button>
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
                  <td>{zakazka.castka} Kč</td>
                  <td>{zakazka.fee} Kč</td>
                  <td>{(parseInt(zakazka.castka.replace(' ', '')) - parseInt(zakazka.fee.replace(' ', ''))).toLocaleString()} Kč</td>
                  <td>0 Kč</td>
                  <td>{zakazka.material} Kč</td>
                  <td>{zakazka.pomucka} Kč</td>
                  <td className="profit">{zakazka.zisk} Kč</td>
                  <td>
                    <span className="status-badge">Přidat soubor</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon">✏️</button>
                      <button className="btn-icon">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="table-footer">
          <div className="table-info">Zobrazeno 1 - 14 z 14 zakázek</div>
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
          <div className="summary-value">136 150 Kč</div>
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
          <div className="summary-value">61 211 Kč</div>
          <div className="summary-subtitle green">Marže 45%</div>
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
          <div className="summary-value">14</div>
          <div className="summary-subtitle">Aktivních zakázek</div>
        </div>
      </div>
    </div>
  );

  const Reporty = () => (
    <div className="reporty">
      <div className="page-header">
        <div>
          <h1>Finanční reporty</h1>
          <p>Komplexní analýza výkonnosti a zobrazování všech podnikání</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary">Stáhnout PDF</button>
          <button className="btn btn-primary">Export do Excel</button>
        </div>
      </div>

      <div className="report-card">
        <div className="report-header">
          <div>
            <h3>FILTRY REPORTŮ</h3>
            <div className="report-title">Nastavení zobrazení</div>
          </div>
        </div>
        <div className="report-filters">
          <div className="filter-group">
            <button className="filter-btn active">Období</button>
            <button className="filter-btn">Měsíční období</button>
            <button className="filter-btn">Analýza nákladů</button>
            <button className="filter-btn">Top klienti</button>
          </div>
        </div>
      </div>

      <div className="report-main">
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

        <div className="report-grid">
          <div className="report-stats-card">
            <div className="stats-header">
              <h3>CELKOVÉ STATISTIKY</h3>
              <div className="stats-title">Přehled</div>
            </div>
            <div className="stats-list">
              <div className="stats-item">
                <div className="stats-icon blue">💰</div>
                <div className="stats-content">
                  <div className="stats-label">Celkové tržby</div>
                  <div className="stats-value">136 150 Kč</div>
                </div>
              </div>
              <div className="stats-item">
                <div className="stats-icon green">📈</div>
                <div className="stats-content">
                  <div className="stats-label">Celkový zisk</div>
                  <div className="stats-value">61 211 Kč</div>
                </div>
              </div>
              <div className="stats-item">
                <div className="stats-icon purple">📋</div>
                <div className="stats-content">
                  <div className="stats-label">Ziskový marže</div>
                  <div className="stats-value">45.0%</div>
                </div>
              </div>
              <div className="stats-item">
                <div className="stats-icon orange">🎯</div>
                <div className="stats-content">
                  <div className="stats-label">Počet zakázek</div>
                  <div className="stats-value">14</div>
                </div>
              </div>
            </div>
          </div>

          <div className="quick-actions-card">
            <div className="actions-header">
              <h3>RYCHLÉ AKCE</h3>
              <div className="actions-title">Nástroje</div>
            </div>
            <div className="actions-list">
              <div className="action-item">
                <div className="action-icon">📊</div>
                <div className="action-content">
                  <div className="action-label">Nová zakázka</div>
                </div>
              </div>
              <div className="action-item">
                <div className="action-icon">📥</div>
                <div className="action-content">
                  <div className="action-label">Import CSV</div>
                </div>
              </div>
              <div className="action-item">
                <div className="action-icon">⚙️</div>
                <div className="action-content">
                  <div className="action-label">Nastavení</div>
                </div>
              </div>
            </div>
          </div>

          <div className="activity-card">
            <div className="activity-header">
              <h3>POSLEDNÍ AKTIVITA</h3>
              <div className="activity-title">Historie</div>
            </div>
            <div className="activity-content">
              <div className="activity-info">Zobrazit vše</div>
            </div>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-text">
                  <strong>Dokončena zakázka pro ROZNOV s.r.o.</strong>
                  <br />
                  <span className="green">Aktualizovaný náklady na materiál</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-text">
                  <strong>Nová zakázka od Petra s.</strong>
                  <br />
                  <span className="green">Aktualizovaný náklady na materiál</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-text">
                  <strong>Aktualizovaný náklady na materiál</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
import React, { useState, useEffect } from 'react';
import './App.css';
import './ModernIcons.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { AuthProvider, useAuth } from './AuthContext';
import LoginScreen from './LoginScreen';
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

// =========================
// CENTRÁLNÍ SYSTÉM PRO SPRÁVU KATEGORIÍ PRÁCE
// =========================

// Výchozí kategorie a barvy
const DEFAULT_WORK_CATEGORIES = [
  { name: 'Adam', color: '#6366f1' },
  { name: 'MVČ', color: '#06b6d4' },
  { name: 'Korálek', color: '#10b981' },
  { name: 'Ostatní', color: '#f59e0b' }
];

// Generátor barev pro nové kategorie
const generateColorForCategory = (index) => {
  const colors = [
    '#8b5cf6', '#ef4444', '#f97316', '#eab308', '#84cc16', 
    '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
    '#d946ef', '#ec4899', '#f43f5e', '#dc2626', '#ea580c'
  ];
  return colors[index % colors.length];
};

// Třída pro správu kategorií
class WorkCategoryManager {
  constructor() {
    this.storageKey = 'workCategories';
    this.listeners = new Set(); // Pro notifikace o změnách
    this.loadCategories();
  }

  // Přidat listener pro změny
  addChangeListener(listener) {
    this.listeners.add(listener);
  }

  removeChangeListener(listener) {
    this.listeners.delete(listener);
  }

  // Notifikovat všechny listenery o změně
  notifyChange() {
    this.listeners.forEach(listener => {
      try {
        listener(this.categories);
      } catch (error) {
        console.error('Error in category change listener:', error);
      }
    });
  }

  loadCategories() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.categories = JSON.parse(stored);
        // Ověření integrity dat
        if (!Array.isArray(this.categories) || this.categories.length === 0) {
          this.resetToDefault();
        }
      } else {
        this.resetToDefault();
      }
    } catch (error) {
      console.error('Error loading work categories:', error);
      this.resetToDefault();
    }
  }

  resetToDefault() {
    this.categories = [...DEFAULT_WORK_CATEGORIES];
    this.saveCategories();
  }

  saveCategories() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.categories));
      console.log('Categories saved:', this.categories);
    } catch (error) {
      console.error('Error saving work categories:', error);
    }
  }

  getAllCategories() {
    return [...this.categories];
  }

  getCategoryNames() {
    return this.categories.map(cat => cat.name);
  }

  getCategoryColor(categoryName) {
    const category = this.categories.find(cat => cat.name === categoryName);
    return category ? category.color : '#6b7280'; // fallback gray
  }

  addCategory(categoryName) {
    if (!categoryName || categoryName.trim() === '') {
      return false; // prázdná kategorie
    }
    
    const trimmedName = categoryName.trim();
    
    // Kontrola existence (case-insensitive)
    if (this.categories.some(cat => cat.name.toLowerCase() === trimmedName.toLowerCase())) {
      return false; // kategorie už existuje
    }
    
    const newCategory = {
      name: trimmedName,
      color: generateColorForCategory(this.categories.length)
    };
    
    this.categories.push(newCategory);
    this.saveCategories();
    this.notifyChange(); // Notifikovat o změně
    
    console.log('New category added:', newCategory);
    return true;
  }

  // Pro budoucí rozšíření - mazání kategorií
  removeCategory(categoryName) {
    const index = this.categories.findIndex(cat => cat.name === categoryName);
    if (index > -1 && this.categories.length > 1) { // nechám alespoň jednu kategorii
      this.categories.splice(index, 1);
      this.saveCategories();
      this.notifyChange();
      return true;
    }
    return false;
  }

  // Vynucená synchronizace (pro debug)
  forceSync() {
    this.loadCategories();
    this.notifyChange();
  }
}

// Globální instance manageru
const workCategoryManager = new WorkCategoryManager();

const PaintPro = () => {
  const { currentUser, getUserData, addUserOrder, editUserOrder, deleteUserOrder } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reportPeriod, setReportPeriod] = useState('week');
  const [filterDruhPrace, setFilterDruhPrace] = useState('');
  const [searchClient, setSearchClient] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingZakazka, setEditingZakazka] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Stav pro dynamické kategorie práce
  const [workCategories, setWorkCategories] = useState(workCategoryManager.getAllCategories());
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);

  // Nastavení change listeneru pro automatické aktualizace kategorií
  useEffect(() => {
    const handleCategoryChange = (newCategories) => {
      setWorkCategories([...newCategories]);
    };
    
    workCategoryManager.addChangeListener(handleCategoryChange);
    
    // Cleanup
    return () => {
      workCategoryManager.removeChangeListener(handleCategoryChange);
    };
  }, []);

  // Získání dat pro aktuálního uživatele
  const [zakazkyData, setZakazkyData] = useState([]);

  useEffect(() => {
    if (currentUser) {
      const userData = getUserData(currentUser.id);
      setZakazkyData(userData);
    }
  }, [currentUser, getUserData]);

  // Funkce pro přidání zakázky
  const handleAddZakazka = (zakazkaData) => {
    const updatedData = addUserOrder(currentUser.id, zakazkaData);
    setZakazkyData(updatedData);
  };

  // Funkce pro editaci zakázky
  const handleEditZakazka = (zakazkaData) => {
    const updatedData = editUserOrder(currentUser.id, editingZakazka.id, zakazkaData);
    setZakazkyData(updatedData);
    setEditingZakazka(null);
  };

  // Funkce pro smazání zakázky
  const handleDeleteZakazka = (orderId) => {
    const updatedData = deleteUserOrder(currentUser.id, orderId);
    setZakazkyData(updatedData);
  };
  const getMonthlyPerformance = () => {
    const monthNames = ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čer', 'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'];
    const monthlyData = {};
    
    // Inicializace všech měsíců
    for (let i = 0; i < 12; i++) {
      const key = `2025-${String(i + 1).padStart(2, '0')}`;
      monthlyData[key] = { revenue: 0, orders: 0, month: i, year: 2025 };
    }
    
    // Agregace dat ze zakázek
    zakazkyData.forEach(zakazka => {
      const date = new Date(zakazka.datum.split('. ').reverse().join('-'));
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyData[key]) {
        monthlyData[key].revenue += zakazka.castka;
        monthlyData[key].orders += 1;
      }
    });
    
    // Získání max hodnot pro procentuální výpočet
    const maxRevenue = Math.max(...Object.values(monthlyData).map(m => m.revenue));
    const maxOrders = Math.max(...Object.values(monthlyData).map(m => m.orders));
    
    // Posledních 6 měsíců s daty
    return Object.keys(monthlyData)
      .filter(key => monthlyData[key].revenue > 0 || monthlyData[key].orders > 0)
      .slice(-6)
      .map(key => {
        const data = monthlyData[key];
        return {
          name: monthNames[data.month],
          year: data.year,
          revenue: data.revenue,
          orders: data.orders,
          revenuePercent: maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0,
          ordersPercent: maxOrders > 0 ? (data.orders / maxOrders) * 100 : 0
        };
      });
  };

  // Funkce pro roční výkonnost
  const getYearlyData = () => {
    const currentYear = 2025;
    const yearData = zakazkyData
      .filter(zakazka => {
        const date = new Date(zakazka.datum.split('. ').reverse().join('-'));
        return date.getFullYear() === currentYear;
      })
      .reduce((acc, zakazka) => {
        acc.revenue += zakazka.castka;
        acc.orders += 1;
        return acc;
      }, { revenue: 0, orders: 0 });
    
    // Pro procenta použijeme target hodnoty nebo max z dostupných dat
    const revenueTarget = 200000; // 200k Kč target
    const ordersTarget = 50; // 50 zakázek target
    
    return {
      revenue: yearData.revenue,
      orders: yearData.orders,
      revenuePercent: Math.min((yearData.revenue / revenueTarget) * 100, 100),
      ordersPercent: Math.min((yearData.orders / ordersTarget) * 100, 100)
    };
  };
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  // Dynamicky počítané dashboard data - POUZE z zakazkyData
  const dashboardData = React.useMemo(() => {
    console.log('=== DASHBOARD DATA DEBUG ===');
    console.log('zakazkyData:', zakazkyData);
    
    const celkoveTrzby = zakazkyData.reduce((sum, z) => sum + z.castka, 0);
    const celkovyZisk = zakazkyData.reduce((sum, z) => sum + z.zisk, 0);
    const pocetZakazek = zakazkyData.length;
    const prumernyZisk = pocetZakazek > 0 ? Math.round(celkovyZisk / pocetZakazek) : 0;

    console.log('Celkové tržby:', celkoveTrzby);
    console.log('Celkový zisk:', celkovyZisk);
    console.log('Počet zakázek:', pocetZakazek);

    // Dynamické rozložení podle druhu práce
    const categoryStats = {};
    const availableCategories = workCategoryManager.getCategoryNames();
    
    // Inicializace všech kategorií na 0
    availableCategories.forEach(category => {
      categoryStats[category] = 0;
    });
    
    // Výpočet zisků podle kategorií
    zakazkyData.forEach(zakazka => {
      if (categoryStats.hasOwnProperty(zakazka.druh)) {
        categoryStats[zakazka.druh] += zakazka.zisk;
      } else {
        // Pokud kategorie neexistuje, přidej ji automaticky
        if (workCategoryManager.addCategory(zakazka.druh)) {
          categoryStats[zakazka.druh] = zakazka.zisk;
          console.log('Auto-added category from existing data:', zakazka.druh);
        }
      }
    });

    console.log('=== DYNAMICKÉ ROZLOŽENÍ PODLE DRUHU ===');
    Object.entries(categoryStats).forEach(([category, zisk]) => {
      console.log(`${category} zisk:`, zisk);
    });
    
    const totalZisk = Object.values(categoryStats).reduce((sum, zisk) => sum + zisk, 0);
    console.log('Součet:', totalZisk);
    
    // Procenta pro ověření
    if (totalZisk > 0) {
      Object.entries(categoryStats).forEach(([category, zisk]) => {
        console.log(`${category} %:`, Math.round((zisk / totalZisk) * 100));
      });
    }

    // Reálné měsíční data pouze z zakázek uživatele
    const monthlyDataMap = {};
    
    zakazkyData.forEach(zakazka => {
      // Parse český formát datumu DD. MM. YYYY
      const dateParts = zakazka.datum.split('. ');
      const day = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1; // JavaScript měsíce jsou 0-based
      const year = parseInt(dateParts[2]);
      const date = new Date(year, month, day);
      
      const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
      
      if (!monthlyDataMap[monthKey]) {
        monthlyDataMap[monthKey] = {
          revenue: 0,
          month: month,
          year: year
        };
      }
      monthlyDataMap[monthKey].revenue += zakazka.zisk;
    });

    // Seřaď měsíce chronologicky a vezmi posledních 6
    const sortedMonths = Object.keys(monthlyDataMap)
      .sort()
      .slice(-6);

    const monthNames = ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čer', 'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'];
    
    const mesicniLabels = sortedMonths.map(key => {
      const data = monthlyDataMap[key];
      return monthNames[data.month];
    });
    
    const mesicniValues = sortedMonths.map(key => monthlyDataMap[key].revenue);

    return {
      celkoveTrzby: celkoveTrzby.toLocaleString(),
      celkovyZisk: celkovyZisk.toLocaleString(),
      pocetZakazek: pocetZakazek.toString(),
      prumernyZisk: prumernyZisk.toLocaleString(),
      mesicniData: {
        labels: mesicniLabels,
        values: mesicniValues
      },
      rozlozeniData: {
        labels: Object.keys(categoryStats),
        values: Object.values(categoryStats),
        colors: workCategoryManager.getAllCategories().map(cat => cat.color)
      }
    };
  }, [zakazkyData]);

  // Funkce pro přidání zakázky
  const addZakazka = (newZakazka) => {
    handleAddZakazka(newZakazka);
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
      handleDeleteZakazka(id);
    }
  };



  // Aktualizovaná data pro kombinovaný graf - POUZE reálná data ze zakázek
  const getCombinedChartData = () => {
    // Pokud nejsou žádné zakázky, vrať prázdný graf
    if (zakazkyData.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Vytvoř reálné měsíční údaje ze zakázek
    const monthlyStats = {};
    
    zakazkyData.forEach(zakazka => {
      // Parse český formát datumu DD. MM. YYYY
      const dateParts = zakazka.datum.split('. ');
      const day = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1; // JavaScript měsíce jsou 0-based
      const year = parseInt(dateParts[2]);
      
      const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          zisk: 0,
          trzby: 0,
          month: month,
          year: year
        };
      }
      
      monthlyStats[monthKey].zisk += zakazka.zisk;
      monthlyStats[monthKey].trzby += zakazka.castka;
    });

    // Seřaď chronologicky
    const sortedMonths = Object.keys(monthlyStats).sort();
    const monthNames = ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čer', 'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'];
    
    const labels = sortedMonths.map(key => {
      const data = monthlyStats[key];
      return `${monthNames[data.month]} ${data.year}`;
    });
    
    const ziskData = sortedMonths.map(key => monthlyStats[key].zisk);
    const trzbyData = sortedMonths.map(key => monthlyStats[key].trzby);

    return {
      labels: labels,
      datasets: [
        {
          type: 'bar',
          label: 'Zisk',
          data: ziskData,
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
          label: 'Tržby',
          data: trzbyData,
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
          label: 'Trend zisku',
          data: ziskData,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#10B981',
          pointBorderColor: 'var(--text-secondary)',
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
          color: 'var(--text-chart)',
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: '500',
            letterSpacing: '0.3px',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(139, 92, 246, 0.5)',
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: '600'
        },
        bodyFont: {
          size: 13,
          weight: '500'
        },
        padding: 12,
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
          color: 'rgba(148, 163, 184, 0.2)',
          drawBorder: false,
        },
        ticks: {
          color: 'var(--text-chart)',
          font: {
            size: 11,
            weight: '500',
            letterSpacing: '0.2px',
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.2)',
          drawBorder: false,
        },
        ticks: {
          color: 'var(--text-chart)',
          font: {
            size: 11,
            letterSpacing: '0.2px',
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
        hoverBackgroundColor: 'var(--text-secondary)',
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
        borderRadius: 8,
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
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(139, 92, 246, 0.5)',
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: '600'
        },
        bodyFont: {
          size: 13,
          weight: '500'
        },
        padding: 12,
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

  const StatCard = ({ title, value, subtitle, iconClass, color, index, showCurrency = true, blueSubtitle = false, smallValueText = false }) => (
    <div
      className={`stat-card ${hoveredCard === index ? 'hovered' : ''}`}
      onMouseEnter={() => setHoveredCard(index)}
      onMouseLeave={() => setHoveredCard(null)}
    >
      {/* Geometrické zdobení - tři průhledná kola */}
      <div className="geometric-decoration">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>
      
      <div className="stat-header">
        <div className="stat-title">{title}</div>
      </div>
      <div className="stat-content">
        <div className="stat-value-row">
          <div className={`stat-icon ${iconClass}`}></div>
          <div className="stat-value-with-subtitle">
            {smallValueText ? (
              <div className="stat-value">
                {value} <span className="small-text">{subtitle}</span>
              </div>
            ) : (
              <>
                <div className="stat-value">{value}{showCurrency ? ' Kč' : ''}</div>
                {subtitle && (
                  <div className={`stat-subtitle ${blueSubtitle ? 'blue' : ''}`}>{subtitle}</div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const Sidebar = () => {
    const { currentUser, logout } = useAuth();
    
    return (
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="modern-icon size-medium icon-dashboard"></div>
            <div className="logo-text">
              <div className="logo-title">PaintPro</div>
              <div className="logo-subtitle">Project Manager</div>
            </div>
          </div>
          {currentUser && (
            <div className="user-info">
              <div 
                className="user-avatar"
                style={{ backgroundColor: currentUser.color }}
              >
                {currentUser.avatar}
              </div>
              <div className="user-details">
                <div className="user-name">{currentUser.name}</div>
                <button className="logout-btn" onClick={logout}>
                  Odhlásit se
                </button>
              </div>
            </div>
          )}
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
            className={`nav-item ${activeTab === 'mapa' ? 'active' : ''}`}
            onClick={() => setActiveTab('mapa')}
          >
            <div className="modern-icon icon-map"></div>
            Mapa zakázek
          </div>
        </nav>
      </div>
    );
  };

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
          value={`${dashboardData.celkoveTrzby} Kč`}
          subtitle=""
          iconClass="icon-money"
          color="blue"
          index={0}
          showCurrency={false}
        />
        <StatCard
          title="CELKOVÝ ZISK"
          value={`${dashboardData.celkovyZisk} Kč`}
          subtitle={`(Marže ${(() => {
            const trzby = parseInt(dashboardData.celkoveTrzby.replace(/,/g, ''));
            const zisk = parseInt(dashboardData.celkovyZisk.replace(/,/g, ''));
            return trzby > 0 ? Math.round((zisk / trzby) * 100) : 0;
          })()}%)`}
          iconClass="icon-chart"
          color="green"
          index={1}
          showCurrency={false}
          blueSubtitle={true}
        />
        <StatCard
          title="POČET ZAKÁZEK"
          value={`${dashboardData.pocetZakazek}`}
          subtitle="dokončených zakázek"
          iconClass="icon-orders"
          color="purple"
          index={2}
          showCurrency={false}
          smallValueText={true}
        />
        <StatCard
          title="PRŮMĚRNÝ ZISK"
          value={`${dashboardData.prumernyZisk} Kč`}
          subtitle="Na zakázku"
          iconClass="icon-target"
          color="orange"
          index={3}
          showCurrency={false}
          blueSubtitle={true}
        />
      </div>

      <div className="charts-grid">
        <div className="chart-card large">
          <div className="chart-header">
            <div>
              <h3>PŘEHLED ZISKU</h3>
              <div className="chart-values-dual">
                <div className="chart-value-main">{dashboardData.celkovyZisk} Kč</div>
                <div className="chart-value-secondary">Měsíc: {(() => {
                  const zisk = parseInt(dashboardData.celkovyZisk.replace(/,/g, ''));
                  const pocetMesicu = dashboardData.mesicniData.values.filter(v => v > 0).length || 1;
                  return Math.round(zisk / pocetMesicu).toLocaleString();
                })()} Kč</div>
              </div>
            </div>
          </div>
          <div className="chart-container-large">
            {zakazkyData.length > 0 ? (
              <Chart type='bar' data={getCombinedChartData()} options={combinedChartOptions} />
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-muted)',
                fontSize: '16px',
                fontWeight: '500'
              }}>
                📊 Přidejte zakázky pro zobrazení grafu
              </div>
            )}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>ROZLOŽENÍ PODLE DRUHU PŘÍJMŮ</h3>
              <div className="chart-value">{dashboardData.celkovyZisk} Kč</div>
            </div>
          </div>
          <div className="chart-container-donut">
            <div className="donut-chart-wrapper">
              {dashboardData.rozlozeniData.values.some(v => v > 0) ? (
                <>
                  <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
                  <div className="external-labels">
                    {dashboardData.rozlozeniData.labels.map((label, index) => {
                      const total = dashboardData.rozlozeniData.values.reduce((a, b) => a + b, 0);
                      const percentage = total > 0 ? Math.round((dashboardData.rozlozeniData.values[index] / total) * 100) : 0;
                      
                      // Pozice podle pořadí
                      const positions = [
                        'label-top-right',    // Adam
                        'label-top-left',     // MVČ  
                        'label-bottom-left',  // Korálek
                        'label-bottom-right'  // Ostatní
                      ];
                      
                      // Zobrazit pouze když má hodnotu větší než 0
                      if (dashboardData.rozlozeniData.values[index] === 0) return null;
                      
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
                </>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '200px',
                  color: 'var(--text-muted)',
                  fontSize: '16px',
                  fontWeight: '500'
                }}>
                  📊 Přidejte zakázky pro zobrazení rozložení
                </div>
              )}
            </div>
          </div>
          <div className="chart-details">
            <div className="detail-row">
              <span>KATEGORIÍ</span>
              <span>4</span>
            </div>
            <div className="detail-row">
              <span>Největší podíl</span>
              <span>{(() => {
                const maxIndex = dashboardData.rozlozeniData.values.indexOf(Math.max(...dashboardData.rozlozeniData.values));
                const total = dashboardData.rozlozeniData.values.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? Math.round((dashboardData.rozlozeniData.values[maxIndex] / total) * 100) : 0;
                return `${dashboardData.rozlozeniData.labels[maxIndex]} (${percentage}%)`;
              })()}</span>
            </div>
            <div className="detail-row">
              <span>Celková suma</span>
              <span>{dashboardData.celkovyZisk} Kč</span>
            </div>
          </div>
        </div>
      </div>

      <div className="performance-grid">
        {/* Měsíční výkonnost */}
        <div className="performance-card">
          <div className="performance-header">
            <h3>Měsíční výkonnost</h3>
          </div>
          <div className="performance-months">
            {getMonthlyPerformance().map((month, index) => (
              <div key={index} className="month-performance">
                <div className="month-title">{month.name} {month.year}</div>
                <div className="progress-group">
                  <div className="progress-item">
                    <div className="progress-label">
                      <span>Celková cena</span>
                      <span className="progress-value">{month.revenue.toLocaleString()} Kč</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill revenue" 
                        style={{width: `${month.revenuePercent}%`}}
                      ></div>
                    </div>
                  </div>
                  <div className="progress-item">
                    <div className="progress-label">
                      <span>Zakázky</span>
                      <span className="progress-value">{month.orders}</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill orders" 
                        style={{width: `${month.ordersPercent}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Roční výkonnost */}
        <div className="performance-card">
          <div className="performance-header">
            <h3>Roční výkonnost</h3>
          </div>
          <div className="yearly-performance">
            <div className="year-title">2025</div>
            <div className="progress-group">
              <div className="progress-item">
                <div className="progress-label">
                  <span>Celková cena</span>
                  <span className="progress-value">{getYearlyData().revenue.toLocaleString()} Kč</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill revenue" 
                    style={{width: `${getYearlyData().revenuePercent}%`}}
                  ></div>
                </div>
              </div>
              <div className="progress-item">
                <div className="progress-label">
                  <span>Zakázky</span>
                  <span className="progress-value">{getYearlyData().orders}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill orders" 
                    style={{width: `${getYearlyData().ordersPercent}%`}}
                  ></div>
                </div>
              </div>
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
      adresa: '',
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
                <div className="combo-box-container">
                  <input
                    type="text"
                    value={formData.druh}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({...formData, druh: value});
                      
                      // Kontrola, zda je to nová kategorie
                      const existingCategories = workCategoryManager.getCategoryNames();
                      if (value && value.trim() && !existingCategories.includes(value.trim())) {
                        setIsAddingNewCategory(true);
                      } else {
                        setIsAddingNewCategory(false);
                      }
                    }}
                    onKeyDown={(e) => {
                      // Při stisknutí Enter nebo Tab přidat kategorii okamžitě
                      if ((e.key === 'Enter' || e.key === 'Tab') && formData.druh && formData.druh.trim()) {
                        const trimmedValue = formData.druh.trim();
                        if (!workCategoryManager.getCategoryNames().includes(trimmedValue)) {
                          if (workCategoryManager.addCategory(trimmedValue)) {
                            setIsAddingNewCategory(false);
                            console.log('Category added via Enter/Tab:', trimmedValue);
                          }
                        }
                      }
                    }}
                    onBlur={() => {
                      // Při opuštění pole přidat kategorii, pokud neexistuje
                      if (formData.druh && formData.druh.trim()) {
                        const trimmedValue = formData.druh.trim();
                        if (!workCategoryManager.getCategoryNames().includes(trimmedValue)) {
                          if (workCategoryManager.addCategory(trimmedValue)) {
                            console.log('Category added via blur:', trimmedValue);
                          }
                        }
                      }
                      setIsAddingNewCategory(false);
                    }}
                    placeholder="Vyberte nebo napište nový druh práce"
                    list="work-categories-list"
                    required
                  />
                  <datalist id="work-categories-list">
                    {workCategoryManager.getCategoryNames().map(category => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                  {isAddingNewCategory && formData.druh && formData.druh.trim() && (
                    <div className="new-category-hint">
                      📝 Nová kategorie "{formData.druh.trim()}" bude přidána
                    </div>
                  )}
                </div>
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
            <div className="form-group">
              <label>Adresa realizace</label>
              <input
                type="text"
                value={formData.adresa}
                onChange={e => setFormData({...formData, adresa: e.target.value})}
                placeholder="Zadejte adresu kde se práce realizovala"
              />
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
        pomocnik: Number(formData.pomocnik),
        palivo: Number(formData.palivo)
      };
      handleEditZakazka(processedData);
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
                <div className="combo-box-container">
                  <input
                    type="text"
                    value={formData.druh || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({...formData, druh: value});
                      
                      // Kontrola, zda je to nová kategorie
                      const existingCategories = workCategoryManager.getCategoryNames();
                      if (value && value.trim() && !existingCategories.includes(value.trim())) {
                        setIsAddingNewCategory(true);
                      } else {
                        setIsAddingNewCategory(false);
                      }
                    }}
                    onKeyDown={(e) => {
                      // Při stisknutí Enter nebo Tab přidat kategorii okamžitě
                      if ((e.key === 'Enter' || e.key === 'Tab') && formData.druh && formData.druh.trim()) {
                        const trimmedValue = formData.druh.trim();
                        if (!workCategoryManager.getCategoryNames().includes(trimmedValue)) {
                          if (workCategoryManager.addCategory(trimmedValue)) {
                            setIsAddingNewCategory(false);
                            console.log('Category added via Enter/Tab (edit):', trimmedValue);
                          }
                        }
                      }
                    }}
                    onBlur={() => {
                      // Při opuštění pole přidat kategorii, pokud neexistuje
                      if (formData.druh && formData.druh.trim()) {
                        const trimmedValue = formData.druh.trim();
                        if (!workCategoryManager.getCategoryNames().includes(trimmedValue)) {
                          if (workCategoryManager.addCategory(trimmedValue)) {
                            console.log('Category added via blur (edit):', trimmedValue);
                          }
                        }
                      }
                      setIsAddingNewCategory(false);
                    }}
                    placeholder="Vyberte nebo napište nový druh práce"
                    list="work-categories-list-edit"
                  />
                  <datalist id="work-categories-list-edit">
                    {workCategoryManager.getCategoryNames().map(category => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                  {isAddingNewCategory && formData.druh && formData.druh.trim() && (
                    <div className="new-category-hint">
                      📝 Nová kategorie "{formData.druh.trim()}" bude přidána
                    </div>
                  )}
                </div>
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
            <div className="form-group">
              <label>Adresa realizace</label>
              <input
                type="text"
                value={formData.adresa || ''}
                onChange={e => setFormData({...formData, adresa: e.target.value})}
                placeholder="Zadejte adresu kde se práce realizovala"
              />
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
                <label>Pomocník (Kč)</label>
                <input
                  type="number"
                  value={formData.pomocnik}
                  onChange={e => setFormData({...formData, pomocnik: e.target.value})}
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
          <button className="btn btn-secondary" onClick={() => {}}>
            <div className="modern-icon size-small icon-export"></div>
            Export CSV
          </button>
          <button 
            className="btn btn-secondary btn-small" 
            onClick={() => {
              // Debug test - přidat test kategorii
              const testCategory = 'Test-' + Date.now();
              console.log('Testing category addition:', testCategory);
              console.log('Current categories before:', workCategoryManager.getCategoryNames());
              
              if (workCategoryManager.addCategory(testCategory)) {
                const updatedCategories = workCategoryManager.getCategoryNames();
                console.log('Current categories after:', updatedCategories);
                console.log('localStorage content:', localStorage.getItem('workCategories'));
                alert(`Kategorie "${testCategory}" byla úspěšně přidána!\nCelkem kategorií: ${updatedCategories.length}`);
              } else {
                alert('Chyba při přidávání kategorie');
              }
            }}
            style={{ marginRight: '8px' }}
          >
            🧪 Test kategorie
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <div className="modern-icon size-small icon-add"></div>
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
                <label>Druh práce</label>
                <select 
                  value={filterDruhPrace}
                  onChange={(e) => setFilterDruhPrace(e.target.value)}
                >
                  <option value="">Všechny druhy</option>
                  {workCategoryManager.getCategoryNames().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
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
                <th>ADRESA</th>
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
                  <td className="address-cell">{zakazka.adresa || '-'}</td>
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

    // Vytvoření multi-line chart dat
    const createMultiLineChartData = (datasets) => {
      // Pokud nejsou žádné datasety, vytvoř prázdný graf
      if (!datasets || datasets.length === 0) {
        return {
          labels: ['Žádná data'],
          datasets: [{
            label: 'Žádná data',
            data: [0],
            borderColor: 'rgba(156, 163, 175, 0.5)',
            backgroundColor: 'rgba(156, 163, 175, 0.1)',
            fill: false,
            tension: 0,
            pointRadius: 0,
            borderWidth: 1,
          }]
        };
      }

      const result = {
        labels: datasets[0].labels,
        datasets: datasets.map(dataset => ({
          label: dataset.label,
          data: dataset.values,
          borderColor: dataset.color,
          backgroundColor: (context) => {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return;
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, dataset.color.replace('1)', '0.1)'));
            gradient.addColorStop(1, dataset.color.replace('1)', '0.02)'));
            return gradient;
          },
          fill: true,
          tension: 0.4,
          pointBackgroundColor: dataset.color,
          pointBorderColor: dataset.color,
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 2,
        }))
      };

      return result;
    };

    // Data pro graf podle druhů práce (celá doba - měsíce)
    const getDruhyPraceData = () => {
      if (zakazkyData.length === 0) {
        return [];
      }

      const monthlyData = {};
      
      // Agregace dat podle měsíců
      zakazkyData.forEach(z => {
        const date = new Date(z.datum.split('. ').reverse().join('-'));
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[key]) {
          monthlyData[key] = { 
            Adam: 0, 
            MVČ: 0, 
            Korálek: 0, 
            Ostatní: 0,
            month: date.getMonth(),
            year: date.getFullYear()
          };
        }
        monthlyData[key][z.druh] += z.zisk;
      });

      const months = ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čer', 'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'];
      const sortedData = Object.values(monthlyData)
        .sort((a, b) => a.year - b.year || a.month - b.month);

      const labels = sortedData.map(item => `${months[item.month]} ${item.year}`);

      return [
        {
          label: 'Adam',
          values: sortedData.map(item => item.Adam),
          color: 'rgba(79, 70, 229, 1)',
          labels: labels
        },
        {
          label: 'MVČ',
          values: sortedData.map(item => item.MVČ),
          color: 'rgba(16, 185, 129, 1)',
          labels: labels
        },
        {
          label: 'Korálek',
          values: sortedData.map(item => item.Korálek),
          color: 'rgba(245, 158, 11, 1)',
          labels: labels
        },
        {
          label: 'Ostatní',
          values: sortedData.map(item => item.Ostatní),
          color: 'rgba(139, 92, 246, 1)',
          labels: labels
        }
      ];
    };

    // Data pro hlavní finanční ukazatele (celá doba)
    const getMainFinancialData = () => {
      if (zakazkyData.length === 0) {
        return [];
      }

      const monthlyData = {};
      
      zakazkyData.forEach(z => {
        const date = new Date(z.datum.split('. ').reverse().join('-'));
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[key]) {
          monthlyData[key] = { 
            trzby: 0, 
            zisk: 0, 
            cistyZisk: 0,
            month: date.getMonth(),
            year: date.getFullYear()
          };
        }
        monthlyData[key].trzby += z.castka;
        monthlyData[key].zisk += z.zisk;
        monthlyData[key].cistyZisk += (z.castka - z.fee);
      });

      const months = ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čer', 'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'];
      const sortedData = Object.values(monthlyData)
        .sort((a, b) => a.year - b.year || a.month - b.month);

      const labels = sortedData.map(item => `${months[item.month]} ${item.year}`);

      return [
        {
          label: 'Celkové tržby',
          values: sortedData.map(item => item.trzby),
          color: 'rgba(59, 130, 246, 1)',
          labels: labels
        },
        {
          label: 'Celkový zisk',
          values: sortedData.map(item => item.zisk),
          color: 'rgba(16, 185, 129, 1)',
          labels: labels
        },
        {
          label: 'Čistý zisk',
          values: sortedData.map(item => item.cistyZisk),
          color: 'rgba(245, 158, 11, 1)',
          labels: labels
        }
      ];
    };

    // Data pro hlavní finanční ukazatele (poslední měsíc)
    const getMainFinancialDataLastMonth = () => {
      const now = new Date();
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      
      const dailyData = {};
      
      const lastMonthData = zakazkyData.filter(z => {
        const date = new Date(z.datum.split('. ').reverse().join('-'));
        return date >= monthAgo;
      });

      if (lastMonthData.length === 0) {
        return [];
      }

      lastMonthData.forEach(z => {
        const date = new Date(z.datum.split('. ').reverse().join('-'));
        const key = date.toISOString().split('T')[0];
        
        if (!dailyData[key]) {
          dailyData[key] = { trzby: 0, zisk: 0, cistyZisk: 0, date: date };
        }
        dailyData[key].trzby += z.castka;
        dailyData[key].zisk += z.zisk;
        dailyData[key].cistyZisk += (z.castka - z.fee);
      });

      const sortedData = Object.values(dailyData)
        .sort((a, b) => a.date - b.date);

      const labels = sortedData.map(item => item.date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' }));

      return [
        {
          label: 'Celkové tržby',
          values: sortedData.map(item => item.trzby),
          color: 'rgba(59, 130, 246, 1)',
          labels: labels
        },
        {
          label: 'Celkový zisk',
          values: sortedData.map(item => item.zisk),
          color: 'rgba(16, 185, 129, 1)',
          labels: labels
        },
        {
          label: 'Čistý zisk',
          values: sortedData.map(item => item.cistyZisk),
          color: 'rgba(245, 158, 11, 1)',
          labels: labels
        }
      ];
    };

    // Data pro náklady (celá doba)
    const getCostsData = () => {
      if (zakazkyData.length === 0) {
        return [];
      }

      const monthlyData = {};
      
      zakazkyData.forEach(z => {
        const date = new Date(z.datum.split('. ').reverse().join('-'));
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[key]) {
          monthlyData[key] = { 
            fee: 0, 
            pomocnik: 0, 
            material: 0, 
            palivo: 0,
            month: date.getMonth(),
            year: date.getFullYear()
          };
        }
        monthlyData[key].fee += z.fee;
        monthlyData[key].pomocnik += z.pomocnik;
        monthlyData[key].material += z.material;
        monthlyData[key].palivo += z.palivo;
      });

      const months = ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čer', 'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'];
      const sortedData = Object.values(monthlyData)
        .sort((a, b) => a.year - b.year || a.month - b.month);

      const labels = sortedData.map(item => `${months[item.month]} ${item.year}`);

      return [
        {
          label: 'Fee',
          values: sortedData.map(item => item.fee),
          color: 'rgba(239, 68, 68, 1)',
          labels: labels
        },
        {
          label: 'Pomocník',
          values: sortedData.map(item => item.pomocnik),
          color: 'rgba(168, 85, 247, 1)',
          labels: labels
        },
        {
          label: 'Materiál',
          values: sortedData.map(item => item.material),
          color: 'rgba(34, 197, 94, 1)',
          labels: labels
        },
        {
          label: 'Doprava',
          values: sortedData.map(item => item.palivo),
          color: 'rgba(251, 146, 60, 1)',
          labels: labels
        }
      ];
    };

    const lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          display: true,
          position: 'bottom',
          labels: {
            color: 'var(--text-chart)',
            padding: 15,
            usePointStyle: true,
            font: {
              size: 10,
              weight: '500',
              letterSpacing: '0.3px',
            },
          },
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: 'rgba(139, 92, 246, 0.5)',
          borderWidth: 1,
          cornerRadius: 12,
          displayColors: true,
          titleFont: {
            size: 13,
            weight: '600'
          },
          bodyFont: {
            size: 12,
            weight: '500'
          },
          padding: 10,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} Kč`;
            }
          }
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(148, 163, 184, 0.2)', drawBorder: false },
          ticks: { 
            color: 'var(--text-chart)', 
            font: { 
              size: 9,
              letterSpacing: '0.2px',
            },
            maxTicksLimit: 8,
          },
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(148, 163, 184, 0.2)', drawBorder: false },
          ticks: { 
            color: 'var(--text-chart)', 
            font: { 
              size: 9,
              letterSpacing: '0.2px',
            },
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
          pointBorderColor: 'var(--text-secondary)',
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



    return (
      <div className="reporty">
        <div className="page-header">
          <div>
            <h1>Finanční reporty</h1>
            <p>Komplexní analýza všech období s detailními grafy</p>
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

        {/* 4 grafy v gridu 2x2 */}
        <div className="charts-grid-4" id="charts-export">
          <div className="chart-card-small">
            <div className="chart-header-small">
              <h3>HLAVNÍ UKAZATELE - CELÁ DOBA</h3>
              <div className="chart-value-small blue">{zakazkyData.reduce((sum, z) => sum + z.castka, 0).toLocaleString()} Kč</div>
            </div>
            <div className="chart-container-small">
              <Line data={{
                labels: zakazkyData.map((z, index) => `Zakázka ${index + 1}`),
                datasets: [
                  {
                    label: 'Tržby',
                    data: zakazkyData.map(z => z.castka),
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                  },
                  {
                    label: 'Zisk',
                    data: zakazkyData.map(z => z.zisk),
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                  }
                ]
              }} options={lineChartOptions} />
            </div>
          </div>

          <div className="chart-card-small">
            <div className="chart-header-small">
              <h3>NÁKLADY PODLE ZAKÁZEK</h3>
              <div className="chart-value-small green">{zakazkyData.reduce((sum, z) => sum + z.fee + z.pomocnik + z.material + z.palivo, 0).toLocaleString()} Kč</div>
            </div>
            <div className="chart-container-small">
              <Line data={{
                labels: zakazkyData.map((z, index) => `Zakázka ${index + 1}`),
                datasets: [
                  {
                    label: 'Fee',
                    data: zakazkyData.map(z => z.fee),
                    borderColor: 'rgba(239, 68, 68, 1)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4,
                  },
                  {
                    label: 'Materiál',
                    data: zakazkyData.map(z => z.material),
                    borderColor: 'rgba(34, 197, 94, 1)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    fill: true,
                    tension: 0.4,
                  }
                ]
              }} options={lineChartOptions} />
            </div>
          </div>

          <div className="chart-card-small">
            <div className="chart-header-small">
              <h3>DRUHY PRÁCE</h3>
              <div className="chart-value-small orange">{zakazkyData.reduce((sum, z) => sum + z.zisk, 0).toLocaleString()} Kč</div>
            </div>
            <div className="chart-container-small">
              <Line data={{
                labels: zakazkyData.map((z, index) => `Zakázka ${index + 1}`),
                datasets: [
                  {
                    label: 'Adam',
                    data: zakazkyData.map(z => z.druh === 'Adam' ? z.zisk : 0),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                  },
                  {
                    label: 'MVČ',
                    data: zakazkyData.map(z => z.druh === 'MVČ' ? z.zisk : 0),
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                  },
                  {
                    label: 'Korálek',
                    data: zakazkyData.map(z => z.druh === 'Korálek' ? z.zisk : 0),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                  },
                  {
                    label: 'Ostatní',
                    data: zakazkyData.map(z => z.druh === 'Ostatní' ? z.zisk : 0),
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                  }
                ]
              }} options={{
                ...lineChartOptions,
                scales: {
                  x: {
                    grid: {
                      color: 'rgba(107, 114, 128, 0.1)',
                      lineWidth: 1,
                    },
                    ticks: {
                      color: '#6b7280',
                      font: {
                        size: 11,
                        weight: '500'
                      }
                    }
                  },
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(107, 114, 128, 0.1)',
                      lineWidth: 1,
                    },
                    ticks: {
                      color: '#6b7280',
                      font: {
                        size: 11,
                        weight: '500'
                      },
                      callback: function(value) {
                        return value.toLocaleString() + ' Kč';
                      }
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                      usePointStyle: true,
                      pointStyle: 'circle',
                      padding: 20,
                      font: {
                        size: 12,
                        weight: '600'
                      },
                      color: '#374151'
                    }
                  }
                }
              }} />
            </div>
          </div>

          <div className="chart-card-small">
            <div className="chart-header-small">
              <h3>MARŽE PODLE ZAKÁZEK</h3>
              <div className="chart-value-small purple">{Math.round((zakazkyData.reduce((sum, z) => sum + z.zisk, 0) / zakazkyData.reduce((sum, z) => sum + z.castka, 0)) * 100) || 0}%</div>
            </div>
            <div className="chart-container-small">
              <Line data={{
                labels: zakazkyData.map((z, index) => `Zakázka ${index + 1}`),
                datasets: [{
                  label: 'Marže (%)',
                  data: zakazkyData.map(z => Math.round((z.zisk / z.castka) * 100)),
                  borderColor: 'rgba(139, 92, 246, 1)',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  fill: true,
                  tension: 0.4,
                }]
              }} options={lineChartOptions} />
            </div>
          </div>
        </div>

        {/* Graf top klientů */}
        <div className="chart-card-full">
          <div className="chart-header">
            <div>
              <h3>PŘEHLED ZAKÁZEK PODLE MĚSÍCŮ</h3>
              <div className="chart-subtitle">Stohovaný zisk podle druhů práce a měsíců</div>
            </div>
          </div>
          <div className="chart-container-large">
            <Bar data={{
              labels: (() => {
                const monthlyLabels = {};
                zakazkyData.forEach(z => {
                  const dateParts = z.datum.split('.');
                  const monthKey = `${dateParts[1]}/${dateParts[2]}`;
                  monthlyLabels[monthKey] = true;
                });
                return Object.keys(monthlyLabels).sort();
              })(),
              datasets: [
                {
                  label: 'Adam',
                  data: (() => {
                    const monthlyData = {};
                    zakazkyData.forEach(z => {
                      const dateParts = z.datum.split('.');
                      const monthKey = `${dateParts[1]}/${dateParts[2]}`;
                      if (!monthlyData[monthKey]) monthlyData[monthKey] = 0;
                      if (z.druh === 'Adam') monthlyData[monthKey] += z.zisk;
                    });
                    const monthlyLabels = Object.keys(monthlyData).sort();
                    return monthlyLabels.map(month => monthlyData[month] || 0);
                  })(),
                  backgroundColor: (context) => {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    if (!chartArea) return '#6366f1';
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, '#4338ca');
                    gradient.addColorStop(0.3, '#6366f1');
                    gradient.addColorStop(0.7, '#8b5cf6');
                    gradient.addColorStop(1, '#a855f7');
                    return gradient;
                  },
                  borderRadius: {
                    topLeft: 8,
                    topRight: 8,
                  },
                  borderSkipped: false,
                  barThickness: 32,
                },
                {
                  label: 'MVČ',
                  data: (() => {
                    const monthlyData = {};
                    zakazkyData.forEach(z => {
                      const dateParts = z.datum.split('.');
                      const monthKey = `${dateParts[1]}/${dateParts[2]}`;
                      if (!monthlyData[monthKey]) monthlyData[monthKey] = 0;
                      if (z.druh === 'MVČ') monthlyData[monthKey] += z.zisk;
                    });
                    const monthlyLabels = Object.keys(monthlyData).sort();
                    return monthlyLabels.map(month => monthlyData[month] || 0);
                  })(),
                  backgroundColor: (context) => {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    if (!chartArea) return '#06b6d4';
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, '#0891b2');
                    gradient.addColorStop(0.3, '#06b6d4');
                    gradient.addColorStop(0.7, '#22d3ee');
                    gradient.addColorStop(1, '#67e8f9');
                    return gradient;
                  },
                  borderRadius: {
                    topLeft: 8,
                    topRight: 8,
                  },
                  borderSkipped: false,
                  barThickness: 32,
                },
                {
                  label: 'Korálek',
                  data: (() => {
                    const monthlyData = {};
                    zakazkyData.forEach(z => {
                      const dateParts = z.datum.split('.');
                      const monthKey = `${dateParts[1]}/${dateParts[2]}`;
                      if (!monthlyData[monthKey]) monthlyData[monthKey] = 0;
                      if (z.druh === 'Korálek') monthlyData[monthKey] += z.zisk;
                    });
                    const monthlyLabels = Object.keys(monthlyData).sort();
                    return monthlyLabels.map(month => monthlyData[month] || 0);
                  })(),
                  backgroundColor: (context) => {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    if (!chartArea) return '#10b981';
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, '#059669');
                    gradient.addColorStop(0.3, '#10b981');
                    gradient.addColorStop(0.7, '#34d399');
                    gradient.addColorStop(1, '#6ee7b7');
                    return gradient;
                  },
                  borderRadius: {
                    topLeft: 8,
                    topRight: 8,
                  },
                  borderSkipped: false,
                  barThickness: 32,
                },
                {
                  label: 'Ostatní',
                  data: (() => {
                    const monthlyData = {};
                    zakazkyData.forEach(z => {
                      const dateParts = z.datum.split('.');
                      const monthKey = `${dateParts[1]}/${dateParts[2]}`;
                      if (!monthlyData[monthKey]) monthlyData[monthKey] = 0;
                      if (z.druh === 'Ostatní') monthlyData[monthKey] += z.zisk;
                    });
                    const monthlyLabels = Object.keys(monthlyData).sort();
                    return monthlyLabels.map(month => monthlyData[month] || 0);
                  })(),
                  backgroundColor: (context) => {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    if (!chartArea) return '#f59e0b';
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, '#d97706');
                    gradient.addColorStop(0.3, '#f59e0b');
                    gradient.addColorStop(0.7, '#fbbf24');
                    gradient.addColorStop(1, '#fcd34d');
                    return gradient;
                  },
                  borderRadius: {
                    topLeft: 8,
                    topRight: 8,
                  },
                  borderSkipped: false,
                  barThickness: 32,
                }
              ]
            }} options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  stacked: true,
                  grid: {
                    display: false,
                  },
                  ticks: {
                    color: '#6b7280',
                    font: {
                      size: 12,
                      weight: '600'
                    }
                  }
                },
                y: {
                  stacked: true,
                  grid: {
                    color: 'rgba(107, 114, 128, 0.08)',
                    lineWidth: 1,
                  },
                  ticks: {
                    color: '#6b7280',
                    font: {
                      size: 12,
                      weight: '500'
                    },
                    callback: function(value) {
                      return value.toLocaleString() + ' Kč';
                    }
                  },
                  border: {
                    display: false
                  }
                }
              },
              plugins: {
                legend: {
                  display: true,
                  position: 'bottom',
                  labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 25,
                    font: {
                      size: 13,
                      weight: '600'
                    },
                    color: '#374151'
                  }
                },
                tooltip: {
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  titleColor: '#f9fafb',
                  bodyColor: '#f9fafb',
                  borderColor: 'rgba(107, 114, 128, 0.2)',
                  borderWidth: 1,
                  cornerRadius: 12,
                  displayColors: true,
                  callbacks: {
                    label: function(context) {
                      return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} Kč`;
                    }
                  }
                }
              }
            }} />
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
          
          <div className="action-button-card" onClick={() => {}}>
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

  const MapaZakazek = () => {
    // Funkce pro klasifikaci lokace podle adresy
    const getLocationCategory = (adresa) => {
      if (!adresa) return 'Okolí Prahy';
      const addressLower = adresa.toLowerCase();
      
      // Praha - central areas
      const pragueAreas = [
        'prague', 'praha', 'wenceslas', 'charles', 'old town', 'town square', 
        'castle', 'kampa', 'vinohrady', 'smíchov', 'karlín', 'dejvice', 
        'nové město', 'břevnov'
      ];
      
      const isPrague = pragueAreas.some(area => addressLower.includes(area));
      return isPrague ? 'Praha' : 'Okolí Prahy';
    };

    // Výpočet statistik podle lokace
    const locationStats = React.useMemo(() => {
      if (!zakazkyData || zakazkyData.length === 0) {
        return {
          'Praha': {
            count: 0,
            revenue: 0,
            profit: 0,
            orders: []
          },
          'Okolí Prahy': {
            count: 0,
            revenue: 0,
            profit: 0,
            orders: []
          }
        };
      }

      const stats = {
        'Praha': {
          count: 0,
          revenue: 0,
          profit: 0,
          orders: []
        },
        'Okolí Prahy': {
          count: 0,
          revenue: 0,
          profit: 0,
          orders: []
        }
      };

      zakazkyData.forEach(zakazka => {
        const location = getLocationCategory(zakazka.adresa);
        if (stats[location]) {
          stats[location].count++;
          stats[location].revenue += zakazka.castka || 0;
          stats[location].profit += zakazka.zisk || 0;
          stats[location].orders.push(zakazka);
        }
      });

      return stats;
    }, [zakazkyData]);

    // Funkce pro geocoding adres na souřadnice
    const getCoordinatesFromAddress = (adresa) => {
      if (!adresa) return null;
      
      // Simulace geocoding pro ukázkové adresy
      const addressMapping = {
        'wenceslas square 1, prague 1': [50.0814, 14.4262],
        'charles square 15, prague 2': [50.0748, 14.4175],
        'old town square 10, prague 1': [50.0875, 14.4214],
        'kampa island 5, prague 1': [50.0819, 14.4065],
        'prague castle, prague 1': [50.0909, 14.4018],
        'letná park 12, prague 7': [50.0994, 14.4169],
        'vinohrady 25, prague 2': [50.0756, 14.4378],
        'smíchov 8, prague 5': [50.0704, 14.4037],
        'karlín 18, prague 8': [50.0922, 14.4460],
        'dejvice 32, prague 6': [50.1036, 14.3901],
        'nové město 44, prague 1': [50.0796, 14.4205],
        'břevnov 21, prague 6': [50.0839, 14.3505],
        'malá strana 12, prague 1': [50.0879, 14.4034],
        'hradčany 8, prague 1': [50.0913, 14.3990]
      };
      
      const addressLower = adresa.toLowerCase();
      const exactMatch = addressMapping[addressLower];
      if (exactMatch) return exactMatch;
      
      // Fallback: generování souřadnic podle typu oblasti
      const isPrague = ['prague', 'praha', 'wenceslas', 'charles', 'old town', 'castle', 'kampa', 'vinohrady', 'smíchov', 'karlín', 'dejvice', 'nové město', 'břevnov', 'malá strana', 'hradčany'].some(area => addressLower.includes(area));
      
      if (isPrague) {
        // Praha centrum: 50.0755, 14.4378 +/- malé odchylky
        return [
          50.0755 + (Math.random() - 0.5) * 0.06, // rozsah cca 3km
          14.4378 + (Math.random() - 0.5) * 0.08
        ];
      } else {
        // Okolí Prahy: větší rozptyl
        return [
          50.0755 + (Math.random() - 0.5) * 0.15, // rozsah cca 8km
          14.4378 + (Math.random() - 0.5) * 0.20
        ];
      }
    };

    // OpenStreetMap komponenta s Leaflet
    const OpenStreetMapComponent = () => {
      const mapRef = React.useRef(null);
      
      React.useEffect(() => {
        // Dynamicky načteme Leaflet po mount
        import('leaflet').then((L) => {
          // Cleanup existing map
          if (mapRef.current) {
            mapRef.current.remove();
          }
          
          // Praha centrum
          const pragueCenter = [50.0755, 14.4378];
          
          // Vytvoření mapy
          const map = L.map('leaflet-map', {
            center: pragueCenter,
            zoom: 11,
            zoomControl: true,
            scrollWheelZoom: true
          });
          
          mapRef.current = map;
          
          // Přidání OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
          }).addTo(map);
          
          // Přidání markerů pro zakázky
          zakazkyData.forEach((zakazka) => {
            const coords = getCoordinatesFromAddress(zakazka.adresa);
            if (coords) {
              // Barva markeru podle druhu práce - dynamicky ze správce kategorií
              const color = workCategoryManager.getCategoryColor(zakazka.druh);
              
              // Vytvoření custom markeru
              const marker = L.marker(coords, {
                icon: L.divIcon({
                  className: 'custom-div-icon',
                  html: `<div style="
                    background-color: ${color};
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  "></div>`,
                  iconSize: [26, 26],
                  iconAnchor: [13, 13]
                })
              }).addTo(map);
              
              // Popup s informacemi o zakázce
              marker.bindPopup(`
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 200px;">
                  <h3 style="margin: 0 0 8px 0; color: ${color}; font-size: 14px; font-weight: 700;">
                    ${zakazka.klient}
                  </h3>
                  <div style="font-size: 12px; line-height: 1.4;">
                    <div style="margin-bottom: 4px;">
                      <strong>Druh:</strong> <span style="color: ${color}; font-weight: 600;">${zakazka.druh}</span>
                    </div>
                    <div style="margin-bottom: 4px;">
                      <strong>Datum:</strong> ${zakazka.datum}
                    </div>
                    <div style="margin-bottom: 4px;">
                      <strong>Částka:</strong> <span style="color: #10b981; font-weight: 600;">${zakazka.castka.toLocaleString()} Kč</span>
                    </div>
                    <div style="margin-bottom: 4px;">
                      <strong>Zisk:</strong> <span style="color: #10b981; font-weight: 700;">${zakazka.zisk.toLocaleString()} Kč</span>
                    </div>
                    <div style="margin-bottom: 4px;">
                      <strong>Adresa:</strong> ${zakazka.adresa}
                    </div>
                    <div style="font-size: 10px; color: #6b7280; margin-top: 8px;">
                      Zakázka #${zakazka.cislo}
                    </div>
                  </div>
                </div>
              `);
            }
          });
          
          // Přidání dynamické legendy
          const legend = L.control({position: 'bottomright'});
          legend.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'info legend');
            const categories = workCategoryManager.getAllCategories();
            
            const legendItems = categories.map(category => 
              `<div style="margin-bottom: 4px;"><span style="display: inline-block; width: 12px; height: 12px; background: ${category.color}; border-radius: 50%; margin-right: 6px;"></span>${category.name}</div>`
            ).join('');
            
            div.innerHTML = `
              <div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <h4 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #374151;">Druhy prací</h4>
                <div style="font-size: 11px; line-height: 1.4;">
                  ${legendItems}
                </div>
              </div>
            `;
            return div;
          };
          legend.addTo(map);
          
        }).catch((error) => {
          console.error('Error loading Leaflet:', error);
        });
        
        // Cleanup při unmount
        return () => {
          if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
          }
        };
      }, [zakazkyData]);
      
      return (
        <div style={{ width: '100%', height: '600px', borderRadius: '16px', overflow: 'hidden' }}>
          <div id="leaflet-map" style={{ width: '100%', height: '100%' }}></div>
        </div>
      );
    };

    return (
      <div className="mapa-zakazek">
        <div className="page-header">
          <div>
            <h1>Mapa zakázek</h1>
            <p>Geografické zobrazení všech realizovaných zakázek</p>
          </div>
        </div>

        {/* Statistiky podle lokace - ve stylu dashboard buněk */}
        <div className="location-stats-grid">
          <StatCard
            title="PRAHA"
            value={`${locationStats['Praha'].count}`}
            subtitle={`Tržby: ${locationStats['Praha'].revenue.toLocaleString()} Kč`}
            iconClass="icon-map"
            color="blue"
            index={0}
            showCurrency={false}
            smallValueText={true}
            blueSubtitle={true}
          />
          <StatCard
            title="OKOLÍ PRAHY"
            value={`${locationStats['Okolí Prahy'].count}`}
            subtitle={`Tržby: ${locationStats['Okolí Prahy'].revenue.toLocaleString()} Kč`}
            iconClass="icon-map"
            color="green"
            index={1}
            showCurrency={false}
            smallValueText={true}
            blueSubtitle={true}
          />
          <StatCard
            title="CELKOVÝ ZISK - PRAHA"
            value={`${locationStats['Praha'].profit.toLocaleString()} Kč`}
            subtitle={`Průměr: ${locationStats['Praha'].count > 0 ? Math.round(locationStats['Praha'].profit / locationStats['Praha'].count).toLocaleString() : 0} Kč`}
            iconClass="icon-chart"
            color="purple"
            index={2}
            showCurrency={false}
            blueSubtitle={true}
          />
          <StatCard
            title="CELKOVÝ ZISK - OKOLÍ"
            value={`${locationStats['Okolí Prahy'].profit.toLocaleString()} Kč`}
            subtitle={`Průměr: ${locationStats['Okolí Prahy'].count > 0 ? Math.round(locationStats['Okolí Prahy'].profit / locationStats['Okolí Prahy'].count).toLocaleString() : 0} Kč`}
            iconClass="icon-chart"
            color="orange"
            index={3}
            showCurrency={false}
            blueSubtitle={true}
          />
        </div>

        {/* Mapa */}
        <div className="map-container">
          <div className="map-header">
            <h2>🗺️ Interaktivní mapa zakázek</h2>
            <p>Klikněte na značky pro zobrazení detailů zakázky</p>
          </div>
          
          {zakazkyData.length > 0 ? (
            <OpenStreetMapComponent />
          ) : (
            <div className="map-empty">
              <div className="empty-icon">🗺️</div>
              <h3>Žádné zakázky k zobrazení</h3>
              <p>Přidejte zakázky s adresami pro zobrazení na mapě</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'zakazky':
        return <Zakazky />;
      case 'reporty':
        return <Reporty />;
      case 'mapa':
        return <MapaZakazek />;
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

// Auth-protected app wrapper
const AuthenticatedApp = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="login-screen">
        <div className="login-container">
          <div style={{ textAlign: 'center', color: 'var(--text-primary)' }}>
            Načítání...
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  return <PaintPro />;
};

// Main App with Auth Provider
const App = () => {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
};

export default App;
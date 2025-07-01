import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'moment/locale/cs';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-datepicker/dist/react-datepicker.css';
import './CalendarComponent.css';

// Nastavení českého locale pro moment
moment.locale('cs');
const localizer = momentLocalizer(moment);

// Generátor barev pro zakázky
const generateEventColor = (index) => {
  const colors = [
    '#4F46E5', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
    '#14B8A6', '#F59E0B', '#8B5CF6', '#3B82F6', '#10B981'
  ];
  return colors[index % colors.length];
};

// Komponenta pro zobrazení událostí v kalendáři
const EventComponent = ({ event, onEdit, onToggleStatus, onDelete }) => {
  const isCompleted = event.resource.status === 'realizovana';
  
  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(event);
  };

  const handleToggleStatus = (e) => {
    e.stopPropagation();
    onToggleStatus(event);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Opravdu chcete smazat zakázku "${event.resource.jmeno}"?`)) {
      onDelete(event);
    }
  };
  
  return (
    <div 
      className={`calendar-event-card ${isCompleted ? 'completed' : 'incoming'}`}
      style={{
        backgroundColor: isCompleted ? '#f3f4f6' : event.resource.color,
        opacity: isCompleted ? 0.7 : 1,
        border: isCompleted ? '2px solid #10b981' : 'none'
      }}
    >
      {isCompleted && <span className="check-mark">✓</span>}
      
      <div className="event-main-content">
        <div className="event-content">
          <div className="event-line event-name">{event.resource.jmeno || 'Bez názvu'}</div>
          <div className="event-line event-address">{event.resource.adresa || 'Bez adresy'}</div>
          <div className="event-line event-price">{event.resource.cena ? `${event.resource.cena.toLocaleString()} Kč` : '0 Kč'}</div>
          <div className="event-line event-phone">{event.resource.telefon || 'Bez telefonu'}</div>
        </div>

        <div className="event-actions">
          <button 
            className="event-btn edit-btn" 
            onClick={handleEdit}
            title="Upravit"
          >
            ✏️
          </button>
          <button 
            className={`event-btn status-btn ${isCompleted ? 'completed' : 'pending'}`}
            onClick={handleToggleStatus}
            title={isCompleted ? 'Označit jako nehotové' : 'Označit jako hotové'}
          >
            {isCompleted ? '↩️' : '✅'}
          </button>
          <button 
            className="event-btn delete-btn" 
            onClick={handleDelete}
            title="Smazat"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

// Komponenta pro editaci v buňce
const InlineCellEditor = ({ date, onSave, onCancel, existingEvents }) => {
  const [formData, setFormData] = useState({
    jmeno: '',
    adresa: '',
    cena: '',
    telefon: '',
    druh: 'Ostatní', // Výchozí druh práce
    startDate: date,
    endDate: date
  });

  // Možnosti pro druh práce
  const druhPraceOptions = [
    'MVČ',
    'Adam', 
    'Korálek',
    'Ostatní'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.jmeno.trim()) {
      alert('Jméno je povinné pole');
      return;
    }
    
    // Generuj barvu pro novou zakázku
    const colorIndex = existingEvents.length;
    const eventColor = generateEventColor(colorIndex);
    
    const orderData = {
      ...formData,
      cena: parseFloat(formData.cena) || 0,
      datum: moment(formData.startDate).format('DD. MM. YYYY'),
      endDate: moment(formData.endDate).format('DD. MM. YYYY'),
      color: eventColor,
      status: 'incoming', // Výchozí stav
      id: Date.now()
    };
    
    onSave(orderData);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  const extendEndDate = () => {
    const newEndDate = moment(formData.endDate).add(1, 'day').toDate();
    setFormData(prev => ({ ...prev, endDate: newEndDate }));
  };

  const reduceEndDate = () => {
    if (moment(formData.endDate).isAfter(formData.startDate)) {
      const newEndDate = moment(formData.endDate).subtract(1, 'day').toDate();
      setFormData(prev => ({ ...prev, endDate: newEndDate }));
    }
  };

  const daysDuration = moment(formData.endDate).diff(moment(formData.startDate), 'days') + 1;

  return (
    <div className="inline-editor-overlay" onKeyDown={handleKeyDown}>
      <div className="inline-editor">
        <h4>Nová zakázka ({daysDuration} {daysDuration === 1 ? 'den' : daysDuration < 5 ? 'dny' : 'dní'})</h4>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="jmeno">Jméno klienta *</label>
              <input
                type="text"
                id="jmeno"
                name="jmeno"
                value={formData.jmeno}
                onChange={handleChange}
                placeholder="Zadejte jméno klienta"
                autoFocus
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="druh">Druh práce</label>
              <select
                id="druh"
                name="druh"
                value={formData.druh}
                onChange={handleChange}
                className="druh-select"
              >
                {druhPraceOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="adresa">Adresa</label>
            <input
              type="text"
              id="adresa"
              name="adresa"
              value={formData.adresa}
              onChange={handleChange}
              placeholder="Zadejte adresu"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cena">Cena (Kč)</label>
              <input
                type="number"
                id="cena"
                name="cena"
                value={formData.cena}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="1"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="telefon">Telefon</label>
              <input
                type="tel"
                id="telefon"
                name="telefon"
                value={formData.telefon}
                onChange={handleChange}
                placeholder="Zadejte telefonní číslo"
              />
            </div>
          </div>

          {/* Datum výběr s DatePicker */}
          <div className="date-selection-section">
            <h5>📅 Termín zakázky</h5>
            
            <div className="form-row">
              <div className="form-group">
                <label>Začátek zakázky</label>
                <DatePicker
                  selected={formData.startDate}
                  onChange={(date) => handleDateChange(date, 'startDate')}
                  dateFormat="dd.MM.yyyy"
                  placeholderText="Vyberte datum začátku"
                  className="date-picker-input"
                  locale="cs"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  minDate={new Date()}
                />
              </div>
              
              <div className="form-group">
                <label>Konec zakázky</label>
                <DatePicker
                  selected={formData.endDate}
                  onChange={(date) => handleDateChange(date, 'endDate')}
                  dateFormat="dd.MM.yyyy"
                  placeholderText="Vyberte datum konce"
                  className="date-picker-input"
                  locale="cs"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  minDate={formData.startDate || new Date()}
                />
              </div>
            </div>

            <div className="duration-info">
              <span className="duration-badge">
                📊 Doba trvání: {daysDuration} {daysDuration === 1 ? 'den' : daysDuration < 5 ? 'dny' : 'dní'}
              </span>
            </div>
          </div>
          
          <div className="inline-editor-actions">
            <button type="button" onClick={onCancel}>Zrušit</button>
            <button type="submit">Přidat zakázku</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CalendarComponent = ({ 
  zakazkyData = [], 
  onAddOrder, 
  onEditOrder, 
  onDeleteOrder 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingDate, setEditingDate] = useState(null);
  const [events, setEvents] = useState([]);

  // Převod zakázek na události pro kalendář
  useEffect(() => {
    const calendarEvents = zakazkyData.map((zakazka, index) => {
      // Parse českého formátu datumu DD. MM. YYYY
      const dateParts = zakazka.datum.split('. ');
      const day = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1;
      const year = parseInt(dateParts[2]);
      const startDate = new Date(year, month, day);
      
      // Pokud má zakázka endDate, použij ho, jinak je to jednodenní
      let endDate = startDate;
      if (zakazka.endDate) {
        const endParts = zakazka.endDate.split('. ');
        const endDay = parseInt(endParts[0]);
        const endMonth = parseInt(endParts[1]) - 1;
        const endYear = parseInt(endParts[2]);
        endDate = new Date(endYear, endMonth, endDay);
      }

      // Extract telefon from adresa if it's there
      let cleanAdresa = zakazka.adresa || 'Bez adresy';
      let telefon = zakazka.telefon || 'Bez telefonu';
      
      if (zakazka.adresa && zakazka.adresa.includes(' | Tel: ')) {
        const parts = zakazka.adresa.split(' | Tel: ');
        cleanAdresa = parts[0] || 'Bez adresy';
        telefon = parts[1] || 'Bez telefonu';
      }

      // Kontroluj, zda je to kalendářová zakázka
      const isCalendarEvent = (
        (zakazka.cislo && zakazka.cislo.toString().startsWith('CAL-')) ||
        (zakazka.id_zakazky && zakazka.id_zakazky.toString().startsWith('CAL-')) ||
        zakazka.calendar_origin === true
      );

      return {
        id: zakazka.id,
        title: zakazka.klient || zakazka.jmeno || 'Bez názvu',
        start: startDate,
        end: endDate,
        allDay: true,
        resource: {
          jmeno: zakazka.klient || zakazka.jmeno || 'Bez názvu',
          adresa: cleanAdresa,
          cena: zakazka.castka || zakazka.cena || 0,
          telefon: telefon,
          color: zakazka.color || generateEventColor(index),
          status: zakazka.status || 'incoming',
          originalData: zakazka,
          isCalendarEvent: isCalendarEvent // Označení kalendářové události
        }
      };
    });

    setEvents(calendarEvents);
  }, [zakazkyData]);

  // Handling výběru slotu (dne) pro přidání nové zakázky
  const handleSelectSlot = useCallback(({ start }) => {
    setEditingDate(start);
    setIsEditing(true);
  }, []);

  // Handling kliknutí na událost - nyní jen pro non-button kliky
  const handleSelectEvent = useCallback((event) => {
    // Prázdný handler - akce jsou nyní na buttonech
  }, []);

  // Handler pro editaci události
  const handleEditEvent = useCallback((event) => {
    // TODO: Implementovat editaci události
    alert(`Editace události: ${event.resource.jmeno}`);
  }, []);

  // Handler pro změnu statusu události
  const handleToggleEventStatus = useCallback((event) => {
    const isCompleted = event.resource.status === 'realizovana';
    const newStatus = isCompleted ? 'incoming' : 'realizovana';
    const updatedOrder = {
      ...event.resource.originalData,
      status: newStatus
    };
    
    if (onEditOrder) {
      onEditOrder(event.resource.originalData.id, updatedOrder);
    }
  }, [onEditOrder]);

  // Handler pro smazání události
  const handleDeleteEvent = useCallback((event) => {
    if (onDeleteOrder) {
      onDeleteOrder(event.resource.originalData.id);
    }
  }, [onDeleteOrder]);

  // Uložení nové zakázky
  const handleSaveOrder = async (orderData) => {
    if (onAddOrder) {
      try {
        // Explicitně označíme jako kalendářovou zakázku
        const calendarOrderData = {
          ...orderData,
          calendar_origin: true,
          cislo: `CAL-${Date.now()}`
        };
        
        await onAddOrder(calendarOrderData);
        setIsEditing(false);
        setEditingDate(null);
      } catch (error) {
        console.error('Chyba při přidávání zakázky:', error);
        alert('Chyba při přidávání zakázky. Zkuste to prosím znovu.');
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingDate(null);
  };

  // Výpočet finančních sumarizací - pouze pro kalendářové zakázky
  const financialSummary = React.useMemo(() => {
    // Filtruj pouze kalendářové zakázky
    const calendarEvents = events.filter(event => event.resource.isCalendarEvent);
    
    const incomingOrders = calendarEvents.filter(event => event.resource.status === 'incoming');
    const completedOrders = calendarEvents.filter(event => event.resource.status === 'realizovana');
    
    const totalIncoming = incomingOrders.reduce((sum, event) => sum + event.resource.cena, 0);
    const totalCompleted = completedOrders.reduce((sum, event) => sum + event.resource.cena, 0);
    const incomingCount = incomingOrders.length;
    
    return {
      totalIncoming,
      totalCompleted,
      incomingCount,
      totalCalendarOrders: calendarEvents.length
    };
  }, [events]);

  // Překlad kalendáře do češtiny
  const messages = {
    allDay: 'Celý den',
    previous: 'Předchozí',
    next: 'Další',
    today: 'Dnes',
    month: 'Měsíc',
    week: 'Týden',
    day: 'Den',
    agenda: 'Agenda',
    date: 'Datum',
    time: 'Čas',
    event: 'Událost',
    noEventsInRange: 'V tomto období nejsou žádné události.',
    showMore: total => `+ ${total} další`
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>📅 Kalendář zakázek</h2>
        <p>Klikněte na den pro přidání nové zakázky, klikněte na událost pro změnu stavu</p>
      </div>

      {/* Financial Summary Panel */}
      <div className="financial-summary-panel">
        <div className="summary-cards">
          <div className="summary-card incoming">
            <div className="summary-icon modern-icon icon-count"></div>
            <div className="summary-content">
              <div className="summary-value">{financialSummary.incomingCount}</div>
              <div className="summary-label">Příchozí zakázky</div>
            </div>
          </div>
          
          <div className="summary-card total-incoming">
            <div className="summary-icon modern-icon icon-money"></div>
            <div className="summary-content">
              <div className="summary-value">{financialSummary.totalIncoming.toLocaleString()} Kč</div>
              <div className="summary-label">Celková hodnota příchozích</div>
            </div>
          </div>
          
          <div className="summary-card completed">
            <div className="summary-icon modern-icon icon-chart"></div>
            <div className="summary-content">
              <div className="summary-value">{financialSummary.totalCompleted.toLocaleString()} Kč</div>
              <div className="summary-label">Realizováno celkem</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          views={['month']}
          defaultView="month"
          selectable={true}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          messages={messages}
          popup={true}
          popupOffset={30}
          // Rozšířený rozsah kalendáře pro dlouhodobé plánování
          min={new Date(2020, 0, 1)} // Od roku 2020
          max={new Date(2030, 11, 31)} // Do roku 2030
          // Nastavení pro lepší navigaci
          toolbar={true}
          defaultDate={new Date()}
          components={{
            event: ({ event }) => (
              <EventComponent 
                event={event} 
                onEdit={handleEditEvent}
                onToggleStatus={handleToggleEventStatus}
                onDelete={handleDeleteEvent}
              />
            )
          }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.resource.status === 'realizovana' ? '#f3f4f6' : event.resource.color,
              borderColor: event.resource.status === 'realizovana' ? '#10b981' : event.resource.color,
              color: event.resource.status === 'realizovana' ? '#374151' : 'white',
              borderRadius: '6px',
              border: event.resource.status === 'realizovana' ? '2px solid #10b981' : 'none',
              fontSize: '11px',
              padding: '2px 4px',
              opacity: event.resource.status === 'realizovana' ? 0.7 : 1
            }
          })}
          dayPropGetter={(date) => ({
            style: {
              backgroundColor: moment().isSame(date, 'day') ? '#F3F4F6' : 'white'
            }
          })}
        />
      </div>
      
      {/* Inline Editor */}
      {isEditing && editingDate && (
        <InlineCellEditor
          date={editingDate}
          onSave={handleSaveOrder}
          onCancel={handleCancelEdit}
          existingEvents={events}
        />
      )}
    </div>
  );
};

export default CalendarComponent;
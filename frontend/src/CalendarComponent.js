import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/cs';
import 'react-big-calendar/lib/css/react-big-calendar.css';
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
const EventComponent = ({ event }) => {
  const isCompleted = event.resource.status === 'realizovana';
  
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
      <div className="event-line event-name">{event.resource.jmeno || 'Bez názvu'}</div>
      <div className="event-line event-address">{event.resource.adresa || 'Bez adresy'}</div>
      <div className="event-line event-price">{event.resource.cena ? `${event.resource.cena.toLocaleString()} Kč` : '0 Kč'}</div>
      <div className="event-line event-phone">{event.resource.telefon || 'Bez telefonu'}</div>
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
    startDate: date,
    endDate: date
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
        
        <div className="duration-controls">
          <button type="button" onClick={reduceEndDate} disabled={daysDuration <= 1}>-</button>
          <span>{moment(formData.startDate).format('DD.MM')} - {moment(formData.endDate).format('DD.MM')}</span>
          <button type="button" onClick={extendEndDate}>+</button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="jmeno"
            placeholder="Jméno klienta"
            value={formData.jmeno}
            onChange={handleChange}
            autoFocus
            required
          />
          <input
            type="text"
            name="adresa"
            placeholder="Adresa"
            value={formData.adresa}
            onChange={handleChange}
          />
          <input
            type="number"
            name="cena"
            placeholder="Cena (Kč)"
            value={formData.cena}
            onChange={handleChange}
            min="0"
            step="1"
          />
          <input
            type="tel"
            name="telefon"
            placeholder="Telefon"
            value={formData.telefon}
            onChange={handleChange}
          />
          
          <div className="inline-editor-actions">
            <button type="button" onClick={onCancel}>Zrušit</button>
            <button type="submit">Přidat</button>
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
          originalData: zakazka
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

  // Handling kliknutí na událost
  const handleSelectEvent = useCallback((event) => {
    const isCompleted = event.resource.status === 'realizovana';
    const actionText = isCompleted ? 'označit jako nehotovou' : 'označit jako realizovanou';
    const message = `Zakázka: ${event.resource.jmeno}\nAdresa: ${event.resource.adresa}\nCena: ${event.resource.cena.toLocaleString()} Kč\nTelefon: ${event.resource.telefon}\nStav: ${isCompleted ? 'Realizováno' : 'Příchozí'}`;
    
    if (window.confirm(`${message}\n\nChcete ${actionText}?`)) {
      // Toggle status
      const newStatus = isCompleted ? 'incoming' : 'realizovana';
      const updatedOrder = {
        ...event.resource.originalData,
        status: newStatus
      };
      
      if (onEditOrder) {
        onEditOrder(event.resource.originalData.id, updatedOrder);
      }
    }
  }, [onEditOrder]);

  // Uložení nové zakázky
  const handleSaveOrder = async (orderData) => {
    if (onAddOrder) {
      try {
        await onAddOrder(orderData);
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
    // Filtruj pouze kalendářové zakázky (začínají "CAL-" nebo mají calendar origin)
    const calendarEvents = events.filter(event => {
      const originalData = event.resource.originalData;
      return originalData && (
        (originalData.cislo && originalData.cislo.toString().startsWith('CAL-')) ||
        (originalData.id_zakazky && originalData.id_zakazky.toString().startsWith('CAL-')) ||
        originalData.calendar_origin === true
      );
    });
    
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
            <div className="summary-icon">📅</div>
            <div className="summary-content">
              <div className="summary-value">{financialSummary.incomingCount}</div>
              <div className="summary-label">Příchozí zakázky</div>
            </div>
          </div>
          
          <div className="summary-card total-incoming">
            <div className="summary-icon">💰</div>
            <div className="summary-content">
              <div className="summary-value">{financialSummary.totalIncoming.toLocaleString()} Kč</div>
              <div className="summary-label">Celková hodnota příchozích</div>
            </div>
          </div>
          
          <div className="summary-card completed">
            <div className="summary-icon">✅</div>
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
          components={{
            event: ({ event }) => <EventComponent event={event} />
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
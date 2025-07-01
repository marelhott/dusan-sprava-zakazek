import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/cs';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarComponent.css';

// Nastavení českého locale pro moment
moment.locale('cs');
const localizer = momentLocalizer(moment);

// Komponenta pro zobrazení událostí v kalendáři
const EventComponent = ({ event }) => {
  return (
    <div className="calendar-event-card">
      <div className="event-line event-name">{event.jmeno || 'Bez názvu'}</div>
      <div className="event-line event-address">{event.adresa || 'Bez adresy'}</div>
      <div className="event-line event-price">{event.cena ? `${event.cena.toLocaleString()} Kč` : '0 Kč'}</div>
      <div className="event-line event-phone">{event.telefon || 'Bez telefonu'}</div>
    </div>
  );
};

// Formulář pro přidání nové zakázky
const AddOrderModal = ({ isOpen, onClose, onSave, selectedDate }) => {
  const [formData, setFormData] = useState({
    jmeno: '',
    adresa: '',
    cena: '',
    telefon: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        jmeno: '',
        adresa: '',
        cena: '',
        telefon: ''
      });
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.jmeno.trim()) {
      alert('Jméno je povinné pole');
      return;
    }
    
    const orderData = {
      ...formData,
      cena: parseFloat(formData.cena) || 0,
      datum: selectedDate ? moment(selectedDate).format('DD. MM. YYYY') : moment().format('DD. MM. YYYY'),
      id: Date.now() // Temporary ID, will be replaced by Supabase
    };
    
    onSave(orderData);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content calendar-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Přidat novou zakázku</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="jmeno">Jméno *</label>
            <input
              type="text"
              id="jmeno"
              name="jmeno"
              value={formData.jmeno}
              onChange={handleChange}
              placeholder="Zadejte jméno klienta"
              required
            />
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
          
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Zrušit
            </button>
            <button type="submit" className="btn-primary">
              Přidat zakázku
            </button>
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
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);

  // Převod zakázek na události pro kalendář
  useEffect(() => {
    const calendarEvents = zakazkyData.map(zakazka => {
      // Parse českého formátu datumu DD. MM. YYYY
      const dateParts = zakazka.datum.split('. ');
      const day = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1; // JavaScript měsíce jsou 0-based
      const year = parseInt(dateParts[2]);
      const eventDate = new Date(year, month, day);

      // Extract telefon from adresa if it's there (format: "address | Tel: phone")
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
        start: eventDate,
        end: eventDate,
        allDay: true,
        resource: {
          jmeno: zakazka.klient || zakazka.jmeno || 'Bez názvu',
          adresa: cleanAdresa,
          cena: zakazka.castka || zakazka.cena || 0,
          telefon: telefon,
          originalData: zakazka
        }
      };
    });

    setEvents(calendarEvents);
  }, [zakazkyData]);

  // Handling výběru slotu (dne) pro přidání nové zakázky
  const handleSelectSlot = useCallback(({ start }) => {
    setSelectedDate(start);
    setShowModal(true);
  }, []);

  // Handling kliknutí na událost
  const handleSelectEvent = useCallback((event) => {
    const message = `Zakázka: ${event.resource.jmeno}\nAdresa: ${event.resource.adresa}\nCena: ${event.resource.cena.toLocaleString()} Kč\nTelefon: ${event.resource.telefon}`;
    
    if (window.confirm(`${message}\n\nChcete zakázku upravit?`)) {
      // TODO: Implementovat editaci
      console.log('Edit event:', event.resource.originalData);
    }
  }, []);

  // Uložení nové zakázky
  const handleSaveOrder = async (orderData) => {
    if (onAddOrder) {
      try {
        await onAddOrder(orderData);
      } catch (error) {
        console.error('Chyba při přidávání zakázky:', error);
        alert('Chyba při přidávání zakázky. Zkuste to prosím znovu.');
      }
    }
  };

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
        <p>Klikněte na den pro přidání nové zakázky</p>
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
            event: ({ event }) => <EventComponent event={event.resource} />
          }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: '#4F46E5',
              borderColor: '#4F46E5',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              fontSize: '11px',
              padding: '2px 4px'
            }
          })}
          dayPropGetter={(date) => ({
            style: {
              backgroundColor: moment().isSame(date, 'day') ? '#F3F4F6' : 'white'
            }
          })}
        />
      </div>
      
      <AddOrderModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveOrder}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default CalendarComponent;
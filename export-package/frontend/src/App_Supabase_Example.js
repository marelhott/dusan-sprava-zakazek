import React, { useState, useEffect } from 'react'
import { addZakazka, getZakazky, updateZakazka, deleteZakazka, uploadFileToStorage } from './zakazkyService'

function App() {
  const [zakazky, setZakazky] = useState([])
  const [loading, setLoading] = useState(true)
  const [newZakazka, setNewZakazka] = useState({
    datum: '',
    druh: '',
    klient: '',
    id_zakazky: '',
    castka: 0,
    fee: 0,
    fee_off: 0,
    palivo: 0,
    material: 0,
    pomocnik: 0,
    zisk: 0,
    adresa: ''
  })

  // Load zakazky on component mount
  useEffect(() => {
    loadZakazky()
  }, [])

  const loadZakazky = async () => {
    try {
      setLoading(true)
      const data = await getZakazky()
      setZakazky(data)
    } catch (error) {
      console.error('Error loading zakazky:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddZakazka = async (e) => {
    e.preventDefault()
    try {
      const added = await addZakazka(newZakazka)
      setZakazky([added, ...zakazky])
      setNewZakazka({
        datum: '',
        druh: '',
        klient: '',
        id_zakazky: '',
        castka: 0,
        fee: 0,
        fee_off: 0,
        palivo: 0,
        material: 0,
        pomocnik: 0,
        zisk: 0,
        adresa: ''
      })
    } catch (error) {
      console.error('Error adding zakazka:', error)
    }
  }

  const handleDeleteZakazka = async (id) => {
    try {
      await deleteZakazka(id)
      setZakazky(zakazky.filter(z => z.id !== id))
    } catch (error) {
      console.error('Error deleting zakazka:', error)
    }
  }

  const handleFileUpload = async (file) => {
    try {
      const fileName = `${Date.now()}_${file.name}`
      const publicUrl = await uploadFileToStorage(file, fileName)
      console.log('File uploaded:', publicUrl)
      return publicUrl
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dušan - Správa zakázek</h1>
      
      {/* Add Form */}
      <form onSubmit={handleAddZakazka} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Datum"
          value={newZakazka.datum}
          onChange={(e) => setNewZakazka({...newZakazka, datum: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="Druh"
          value={newZakazka.druh}
          onChange={(e) => setNewZakazka({...newZakazka, druh: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="Klient"
          value={newZakazka.klient}
          onChange={(e) => setNewZakazka({...newZakazka, klient: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="ID Zakázky"
          value={newZakazka.id_zakazky}
          onChange={(e) => setNewZakazka({...newZakazka, id_zakazky: e.target.value})}
          required
        />
        <input
          type="number"
          placeholder="Částka"
          value={newZakazka.castka}
          onChange={(e) => setNewZakazka({...newZakazka, castka: Number(e.target.value)})}
          required
        />
        <input
          type="text"
          placeholder="Adresa"
          value={newZakazka.adresa}
          onChange={(e) => setNewZakazka({...newZakazka, adresa: e.target.value})}
        />
        <button type="submit">Přidat zakázku</button>
      </form>

      {/* File Upload Example */}
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files[0]
          if (file) handleFileUpload(file)
        }}
      />

      {/* Zakazky List */}
      <div>
        <h2>Zakázky ({zakazky.length})</h2>
        {zakazky.map((zakazka) => (
          <div key={zakazka.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
            <p><strong>{zakazka.klient}</strong> - {zakazka.datum}</p>
            <p>Druh: {zakazka.druh} | ID: {zakazka.id_zakazky}</p>
            <p>Částka: {zakazka.castka} Kč | Adresa: {zakazka.adresa}</p>
            <button onClick={() => handleDeleteZakazka(zakazka.id)}>Smazat</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
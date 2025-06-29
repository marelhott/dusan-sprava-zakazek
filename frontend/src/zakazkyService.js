import supabase from './supabaseClient'

// Add new zakazka
export const addZakazka = async (newZakazka) => {
  const { data, error } = await supabase
    .from('zakazky')
    .insert([newZakazka])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Get all zakazky
export const getZakazky = async () => {
  const { data, error } = await supabase
    .from('zakazky')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Update zakazka
export const updateZakazka = async (id, updates) => {
  const { data, error } = await supabase
    .from('zakazky')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Delete zakazka
export const deleteZakazka = async (id) => {
  const { error } = await supabase
    .from('zakazky')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// Upload file to Supabase Storage
export const uploadFileToStorage = async (file, fileName) => {
  const { data, error } = await supabase.storage
    .from('zakazky-files')
    .upload(fileName, file)
  
  if (error) throw error
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('zakazky-files')
    .getPublicUrl(fileName)
  
  return urlData.publicUrl
}
import supabase from './supabaseClient';

/**
 * Konverze souboru na base64
 * @param {File} file 
 * @returns {Promise<string>}
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

/**
 * Upload souboru do localStorage (dočasné řešení)
 * @param {File} file - File objekt z input
 * @param {string} zakazkaId - ID zakázky pro organizaci souborů
 * @returns {Promise<{success: boolean, fileObject?: object, error?: string}>}
 */
export const uploadFileToSupabase = async (file, zakazkaId) => {
  try {
    console.log('📁 Nahrávám soubor do localStorage:', {
      originalName: file.name,
      size: file.size,
      type: file.type,
      zakazkaId: zakazkaId
    });
    
    // Konverze souboru na base64
    const base64Data = await fileToBase64(file);
    
    // Generování unikátního ID souboru
    const timestamp = Date.now();
    const fileId = `${zakazkaId}_${timestamp}`;
    
    // Vytvoření file objektu s metadaty
    const fileObject = {
      id: fileId,
      name: file.name,
      url: base64Data, // base64 data jako URL
      uploadedAt: new Date().toISOString(),
      size: file.size,
      type: file.type,
      storagePath: fileId,
      storage: 'localStorage' // označení pro budoucí migraci
    };
    
    // Uložení do localStorage
    const storageKey = `file_${fileId}`;
    localStorage.setItem(storageKey, JSON.stringify(fileObject));
    
    console.log('✅ Soubor úspěšně uložen do localStorage:', fileObject.name);
    
    return {
      success: true,
      fileObject
    };
    
  } catch (error) {
    console.error('❌ Chyba při ukládání souboru:', error);
    return {
      success: false,
      error: `Chyba při ukládání: ${error.message}`
    };
  }
};

/**
 * Smazání souboru ze Supabase Storage
 * @param {string} storagePath - Cesta k souboru v storage
 * @param {string} bucket - Název bucket (volitelný)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteFileFromSupabase = async (storagePath, bucket = null) => {
  try {
    // Pokud není bucket specifikován, najdi dostupný
    const activeBucket = bucket || await findOrCreateBucket();
    if (!activeBucket) {
      return {
        success: false,
        error: 'Storage není dostupný'
      };
    }
    
    const { error } = await supabase.storage
      .from(activeBucket)
      .remove([storagePath]);
    
    if (error) {
      console.error('❌ Chyba při mazání souboru:', error);
      return {
        success: false,
        error: `Chyba při mazání: ${error.message}`
      };
    }
    
    console.log('✅ Soubor úspěšně smazán:', storagePath);
    return { success: true };
    
  } catch (error) {
    console.error('❌ Neočekávaná chyba při mazání:', error);
    return {
      success: false,
      error: `Neočekávaná chyba: ${error.message}`
    };
  }
};

/**
 * Stažení souboru - redirect na Supabase URL
 * @param {string} url - Veřejná URL souboru
 * @param {string} fileName - Název souboru pro download
 */
export const downloadFile = (url, fileName) => {
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('❌ Chyba při stahování souboru:', error);
    // Fallback - otevři v novém okně
    window.open(url, '_blank');
  }
};

/**
 * Validace typu a velikosti souboru
 * @param {File} file - File objekt
 * @param {number} maxSizeMB - Maximální velikost v MB (default 10MB)
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
export const validateFile = async (file, maxSizeMB = 10) => {
  // Kontrola velikosti
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Soubor je příliš velký. Maximum je ${maxSizeMB}MB.`
    };
  }
  
  // Kontrola názvu souboru
  if (file.name.length > 100) {
    return {
      valid: false,
      error: 'Název souboru je příliš dlouhý (max 100 znaků).'
    };
  }
  
  return { valid: true };
};
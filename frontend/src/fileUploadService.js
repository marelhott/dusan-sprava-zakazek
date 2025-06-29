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
 * Smazání souboru z localStorage
 * @param {string} storagePath - Cesta k souboru
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteFileFromSupabase = async (storagePath) => {
  try {
    const storageKey = `file_${storagePath}`;
    localStorage.removeItem(storageKey);
    
    console.log('✅ Soubor úspěšně smazán z localStorage:', storagePath);
    return { success: true };
    
  } catch (error) {
    console.error('❌ Chyba při mazání souboru:', error);
    return {
      success: false,
      error: `Chyba při mazání: ${error.message}`
    };
  }
};

/**
 * Stažení souboru - použije base64 data
 * @param {string} url - Base64 data URL
 * @param {string} fileName - Název souboru pro download
 */
export const downloadFile = (url, fileName) => {
  try {
    // Pro base64 soubory vytvoř blob a stáhni
    if (url.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Fallback - otevři v novém okně
      window.open(url, '_blank');
    }
  } catch (error) {
    console.error('❌ Chyba při stahování souboru:', error);
    // Fallback - otevři v novém okně
    window.open(url, '_blank');
  }
};

/**
 * Validace typu a velikosti souboru
 * @param {File} file - File objekt
 * @param {number} maxSizeMB - Maximální velikost v MB (default 5MB pro localStorage)
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
export const validateFile = async (file, maxSizeMB = 5) => {
  // Kontrola velikosti (menší limit pro localStorage)
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
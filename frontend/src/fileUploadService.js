import supabase from './supabaseClient';

// Zkusíme použít jednoduchý bucket název
const BUCKET_NAME = 'files';

/**
 * Ověření a inicializace bucket pro file storage
 */
const ensureBucketExists = async () => {
  try {
    // Zkontroluj existující buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Chyba při načítání buckets:', bucketsError);
      // Pokusíme se pokračovat s výchozím bucket názvem
      return BUCKET_NAME;
    }
    
    console.log('📁 Dostupné buckets:', buckets?.map(b => b.name) || []);
    
    // Zkontroluj, zda náš bucket existuje
    const targetBucket = buckets?.find(bucket => bucket.name === BUCKET_NAME);
    
    if (targetBucket) {
      console.log('✅ Používám existující bucket:', BUCKET_NAME);
      return BUCKET_NAME;
    }
    
    // Zkus vytvořit nový bucket
    console.log('📁 Vytvářím bucket:', BUCKET_NAME);
    const { data: newBucket, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      allowedMimeTypes: null, // Umožní všechny typy souborů
      fileSizeLimit: 50 * 1024 * 1024 // 50MB limit
    });
    
    if (createError) {
      console.error('⚠️ Nelze vytvořit bucket:', createError);
      // Zkusíme použít jiný existující bucket
      if (buckets && buckets.length > 0) {
        const fallbackBucket = buckets[0].name;
        console.log('🔄 Používám fallback bucket:', fallbackBucket);
        return fallbackBucket;
      }
      return BUCKET_NAME; // Zkusíme pokračovat přesto
    }
    
    console.log('✅ Bucket úspěšně vytvořen:', newBucket);
    return BUCKET_NAME;
    
  } catch (error) {
    console.error('❌ Chyba při inicializaci bucket:', error);
    return BUCKET_NAME; // Fallback
  }
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
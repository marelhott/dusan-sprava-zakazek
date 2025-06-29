import supabase from './supabaseClient';

// Možné názvy bucketů (zkusíme je postupně)
const POSSIBLE_BUCKETS = ['files', 'uploads', 'documents', 'zakazky-files', 'public'];

let ACTIVE_BUCKET = null;

/**
 * Najde funkční bucket nebo vytvoří nový
 */
const findOrCreateBucket = async () => {
  try {
    // Zkontroluj existující buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Chyba při načítání buckets:', bucketsError);
      return null;
    }
    
    console.log('📁 Dostupné buckets:', buckets.map(b => b.name));
    
    // Zkus použít první dostupný bucket
    if (buckets.length > 0) {
      ACTIVE_BUCKET = buckets[0].name;
      console.log('✅ Používám existující bucket:', ACTIVE_BUCKET);
      return ACTIVE_BUCKET;
    }
    
    // Pokud žádný bucket neexistuje, zkus vytvořit s jednoduchým názvem
    for (const bucketName of POSSIBLE_BUCKETS) {
      try {
        const { data, error } = await supabase.storage.createBucket(bucketName, {
          public: true
        });
        
        if (!error) {
          ACTIVE_BUCKET = bucketName;
          console.log('✅ Bucket vytvořen:', bucketName);
          return ACTIVE_BUCKET;
        }
      } catch (e) {
        console.log(`⚠️ Nelze vytvořit bucket ${bucketName}:`, e.message);
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ Chyba při hledání bucket:', error);
    return null;
  }
};

/**
 * Upload souboru do Supabase Storage
 * @param {File} file - File objekt z input
 * @param {string} zakazkaId - ID zakázky pro organizaci souborů
 * @returns {Promise<{success: boolean, fileObject?: object, error?: string}>}
 */
export const uploadFileToSupabase = async (file, zakazkaId) => {
  try {
    // Nejdříve najdi/vytvoř bucket
    const activeBucket = await findOrCreateBucket();
    if (!activeBucket) {
      return {
        success: false,
        error: 'Supabase Storage není dostupný. Kontaktujte administrátora.'
      };
    }
    
    // Generování unikátního názvu souboru
    const fileExtension = file.name.split('.').pop();
    const timestamp = Date.now();
    const uniqueFileName = `${zakazkaId}/${timestamp}_${file.name}`;
    
    console.log('📁 Nahrávám soubor:', {
      originalName: file.name,
      uniqueName: uniqueFileName,
      size: file.size,
      type: file.type,
      bucket: activeBucket
    });
    
    // Upload do Supabase Storage
    const { data, error } = await supabase.storage
      .from(activeBucket)
      .upload(uniqueFileName, file);
    
    if (error) {
      console.error('❌ Chyba při uploadu souboru:', error);
      return {
        success: false,
        error: `Chyba při nahrávání: ${error.message}`
      };
    }
    
    // Získání veřejné URL
    const { data: urlData } = supabase.storage
      .from(activeBucket)
      .getPublicUrl(uniqueFileName);
    
    // Vytvoření file objektu s metadaty
    const fileObject = {
      id: timestamp.toString(),
      name: file.name,
      url: urlData.publicUrl,
      uploadedAt: new Date().toISOString(),
      size: file.size,
      type: file.type,
      storagePath: uniqueFileName,
      bucket: activeBucket
    };
    
    console.log('✅ Soubor úspěšně nahrán:', fileObject);
    
    return {
      success: true,
      fileObject
    };
    
  } catch (error) {
    console.error('❌ Neočekávaná chyba při uploadu:', error);
    return {
      success: false,
      error: `Neočekávaná chyba: ${error.message}`
    };
  }
};
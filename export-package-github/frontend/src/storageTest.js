import supabase from './supabaseClient';

// Test funkce pro ověření Supabase Storage
export const testSupabaseStorage = async () => {
  try {
    console.log('🧪 Testuji Supabase Storage...');
    
    // Test 1: Zkusíme načíst buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Chyba při načítání buckets:', bucketsError);
      return false;
    }
    
    console.log('✅ Dostupné buckets:', buckets);
    
    // Test 2: Zkontrolujeme, zda existuje náš bucket 'zakazky-files'
    const zakazkyBucket = buckets.find(bucket => bucket.name === 'zakazky-files');
    
    if (!zakazkyBucket) {
      console.log('⚠️ Bucket "zakazky-files" neexistuje, zkusíme ho vytvořit...');
      
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('zakazky-files', {
        public: true  // Umožní veřejný přístup k souborům
      });
      
      if (createError) {
        console.error('❌ Chyba při vytváření bucket:', createError);
        return false;
      }
      
      console.log('✅ Bucket "zakazky-files" úspěšně vytvořen:', newBucket);
    } else {
      console.log('✅ Bucket "zakazky-files" už existuje');
    }
    
    // Test 3: Zkusíme základní upload/download test
    const testFile = new Blob(['Test soubor pro ověření uploadu'], { type: 'text/plain' });
    const testFileName = `test_${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('zakazky-files')
      .upload(testFileName, testFile);
    
    if (uploadError) {
      console.error('❌ Chyba při test uploadu:', uploadError);
      return false;
    }
    
    console.log('✅ Test upload úspěšný:', uploadData);
    
    // Test 4: Získání veřejné URL
    const { data: urlData } = supabase.storage
      .from('zakazky-files')
      .getPublicUrl(testFileName);
    
    console.log('✅ Test URL:', urlData.publicUrl);
    
    // Test 5: Smazání test souboru
    const { error: deleteError } = await supabase.storage
      .from('zakazky-files')
      .remove([testFileName]);
    
    if (deleteError) {
      console.warn('⚠️ Chyba při mazání test souboru:', deleteError);
    } else {
      console.log('✅ Test soubor úspěšně smazán');
    }
    
    console.log('🎉 Supabase Storage je plně funkční!');
    return true;
    
  } catch (error) {
    console.error('❌ Neočekávaná chyba při testování Storage:', error);
    return false;
  }
};

// Zavolej test při načtení
window.testSupabaseStorage = testSupabaseStorage;